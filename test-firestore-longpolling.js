import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const dbId = config.firestoreDatabaseId;
const db = initializeFirestore(app, { experimentalAutoDetectLongPolling: true }, dbId);

async function test() {
  try {
    const querySnapshot = await getDocs(collection(db, "test_collection"));
    console.log("Success with AutoDetect! Docs:", querySnapshot.size);
    process.exit(0);
  } catch(e) {
    console.error("Error:", e);
    process.exit(1);
  }
}
test();
