import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: "https://txeka-aqui-ae4f5-default-rtdb.firebaseio.com/",
  });
}

export const authAdmin = admin.auth();
export const firestoreAdmin = admin.firestore();
export const rtdbAdmin = admin.database();
