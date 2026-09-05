import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  initializeFirestore,
  getFirestore,
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc,
  Unsubscribe,
  setLogLevel
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress internal Firestore connection warnings that trigger error overlays
setLogLevel('silent');
import { RefundRequest, User, AppSettings } from '../types';
import { INITIAL_USERS, INITIAL_REQUESTS } from '../data/mockData';

const app = getApps().length > 0 ? getApp() : initializeApp({
  projectId: firebaseConfig.projectId,
  appId: firebaseConfig.appId,
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
});

const rawDbId = firebaseConfig.firestoreDatabaseId;
const dbId = (rawDbId && rawDbId !== '(default)') ? rawDbId : undefined;

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  }, dbId);
} catch {
  firestoreInstance = dbId ? getFirestore(app, dbId) : getFirestore(app);
}

export const db = firestoreInstance;

const REQUESTS_COLLECTION = 'refund_requests';
const USERS_COLLECTION = 'users';

const CACHED_REQUESTS_KEY = 'ue_refund_requests_cache_v2';
const CACHED_USERS_KEY = 'ue_users_cache_v2';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  // Log gracefully without crashing client experience
  console.warn('Firestore notice:', errInfo);
}

// Local cache helpers for resilient offline/online synchronization
function getLocalCachedRequests(): RefundRequest[] {
  try {
    const raw = localStorage.getItem(CACHED_REQUESTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading cached requests:', e);
  }
  return INITIAL_REQUESTS;
}

function saveLocalCachedRequests(requests: RefundRequest[]) {
  try {
    localStorage.setItem(CACHED_REQUESTS_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error('Error caching requests:', e);
  }
}

function getLocalCachedUsers(): User[] {
  try {
    const raw = localStorage.getItem(CACHED_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading cached users:', e);
  }
  return INITIAL_USERS;
}

function saveLocalCachedUsers(users: User[]) {
  try {
    localStorage.setItem(CACHED_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Error caching users:', e);
  }
}

/**
 * Seed initial sample requests to Firestore if empty
 */
export async function seedInitialRequests() {
  try {
    for (const r of INITIAL_REQUESTS) {
      await setDoc(doc(db, REQUESTS_COLLECTION, r.id), r, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, REQUESTS_COLLECTION);
  }
}

/**
 * Real-time listener for all Refund Requests across all connected devices
 */
export function subscribeToRequests(callback: (requests: RefundRequest[]) => void): Unsubscribe {
  // Immediately provide local cache so user never sees empty screen while Firestore connects
  const cached = getLocalCachedRequests();
  callback(cached);

  const reqCol = collection(db, REQUESTS_COLLECTION);
  return onSnapshot(
    reqCol,
    (snapshot) => {
      const list: RefundRequest[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as RefundRequest);
      });

      if (list.length === 0) {
        // If Firestore is completely empty, seed initial sample requests so admin sees data
        seedInitialRequests();
        const merged = getLocalCachedRequests();
        callback(merged.length > 0 ? merged : INITIAL_REQUESTS);
      } else {
        // Merge any locally pending items with Firestore items
        const existingLocal = getLocalCachedRequests();
        const firestoreIds = new Set(list.map(r => r.id));
        const extraLocal = existingLocal.filter(r => !firestoreIds.has(r.id));
        const combined = [...list, ...extraLocal];

        // Sort by submission timestamp descending
        combined.sort((a, b) => (b.submissionDate || '').localeCompare(a.submissionDate || ''));
        saveLocalCachedRequests(combined);
        callback(combined);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, REQUESTS_COLLECTION);
      // Fallback to local cache on connection delays
      callback(getLocalCachedRequests());
    }
  );
}

/**
 * Real-time listener for Users
 */
export function subscribeToUsers(callback: (users: User[]) => void): Unsubscribe {
  const cached = getLocalCachedUsers();
  callback(cached);

  const userCol = collection(db, USERS_COLLECTION);
  return onSnapshot(
    userCol,
    (snapshot) => {
      const list: User[] = [];
      snapshot.forEach((docSnap) => {
        list.push(docSnap.data() as User);
      });
      if (list.length === 0) {
        seedInitialUsers();
        callback(INITIAL_USERS);
      } else {
        saveLocalCachedUsers(list);
        callback(list);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
      callback(getLocalCachedUsers());
    }
  );
}

/**
 * Seed initial administrative & staff accounts to firestore if empty
 */
export async function seedInitialUsers() {
  try {
    for (const u of INITIAL_USERS) {
      await setDoc(doc(db, USERS_COLLECTION, u.id), u, { merge: true });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, USERS_COLLECTION);
  }
}

/**
 * Create or save a new Refund Request in Firestore
 */
export async function saveRefundRequestToDb(req: RefundRequest): Promise<void> {
  // Update local cache immediately
  const existing = getLocalCachedRequests();
  const updated = [req, ...existing.filter((r) => r.id !== req.id)];
  saveLocalCachedRequests(updated);

  try {
    await setDoc(doc(db, REQUESTS_COLLECTION, req.id), req, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${REQUESTS_COLLECTION}/${req.id}`);
  }
}

/**
 * Update an existing Refund Request in Firestore (triggers real-time update on all clients)
 */
export async function updateRefundRequestInDb(req: RefundRequest): Promise<void> {
  // Update local cache immediately
  const existing = getLocalCachedRequests();
  const updated = existing.map((r) => (r.id === req.id ? req : r));
  saveLocalCachedRequests(updated);

  try {
    await setDoc(doc(db, REQUESTS_COLLECTION, req.id), req, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `${REQUESTS_COLLECTION}/${req.id}`);
  }
}

/**
 * Save new registered user to Firestore
 */
export async function saveUserToDb(user: User): Promise<void> {
  const existing = getLocalCachedUsers();
  const updated = [user, ...existing.filter((u) => u.id !== user.id)];
  saveLocalCachedUsers(updated);

  try {
    await setDoc(doc(db, USERS_COLLECTION, user.id), user, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, `${USERS_COLLECTION}/${user.id}`);
  }
}

/**
 * Delete a user from Firestore and local cache
 */
export async function deleteUserFromDb(userId: string): Promise<void> {
  const existing = getLocalCachedUsers();
  const updated = existing.filter((u) => u.id !== userId);
  saveLocalCachedUsers(updated);

  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${USERS_COLLECTION}/${userId}`);
  }
}

/**
 * Delete a refund request from Firestore and local cache
 */
export async function deleteRefundRequestFromDb(requestId: string): Promise<void> {
  const existing = getLocalCachedRequests();
  const updated = existing.filter((r) => r.id !== requestId);
  saveLocalCachedRequests(updated);

  try {
    await deleteDoc(doc(db, REQUESTS_COLLECTION, requestId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${REQUESTS_COLLECTION}/${requestId}`);
  }
}

const SETTINGS_COLLECTION = 'app_settings';
const SETTINGS_DOC_ID = 'general_config';
const CACHED_SETTINGS_KEY = 'ue_app_settings_cache_v1';

export const DEFAULT_APP_SETTINGS: AppSettings = {
  id: SETTINGS_DOC_ID,
  supportVideoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  supportVideoTitle: 'রিফান্ড আবেদন ও ট্র্যাকিং সম্পর্কিত অফিসিয়াল ভিডিও গাইডলাইন',
  telegramUrl: 'https://t.me/unityearning12',
  supportEmail: 'unityearning13@gmail.com',
  officialHelpline: '+880 1700-000000',
  maxReviewDays: 20,
  lastUpdated: new Date().toISOString().split('T')[0]
};

export function getLocalCachedSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(CACHED_SETTINGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.supportVideoUrl) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading cached settings:', e);
  }
  return DEFAULT_APP_SETTINGS;
}

export function saveLocalCachedSettings(settings: AppSettings) {
  try {
    localStorage.setItem(CACHED_SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error caching settings:', e);
  }
}

/**
 * Real-time listener for App Settings (e.g. YouTube Support Video URL)
 */
export function subscribeToAppSettings(callback: (settings: AppSettings) => void): Unsubscribe {
  const cached = getLocalCachedSettings();
  callback(cached);

  const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
  return onSnapshot(
    settingsDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as AppSettings;
        saveLocalCachedSettings(data);
        callback(data);
      } else {
        // Initialize default in Firestore
        setDoc(settingsDocRef, DEFAULT_APP_SETTINGS, { merge: true });
        callback(DEFAULT_APP_SETTINGS);
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`);
      callback(getLocalCachedSettings());
    }
  );
}

/**
 * Save / Update App Settings in Firestore (Live broadcast to all students and admins)
 */
export async function saveAppSettingsToDb(settings: AppSettings): Promise<void> {
  saveLocalCachedSettings(settings);
  try {
    const settingsDocRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(settingsDocRef, settings, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${SETTINGS_COLLECTION}/${SETTINGS_DOC_ID}`);
  }
}
