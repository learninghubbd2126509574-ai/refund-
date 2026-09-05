import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';
const app = initializeApp({ projectId: 'test' });
initializeFirestore(app, { experimentalForceLongPolling: true });
console.log("no error");
