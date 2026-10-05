import 'dotenv/config';
import { cert, getApps, initializeApp } from 'firebase-admin/app';
// import {  } from 'firebase-admin/firestore';
import { getFirestore } from 'firebase-admin/firestore';


const projectId = process.env.FIREBASE_PROJECT_ID;

const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are required');
}

// const app = getAps()[0] ?? initializeApp({
// });
const app = getApps()[0] ?? initializeApp({
  credential: cert({ projectId, clientEmail, privateKey })
});

export const firestore = getFirestore(app);