import admin from "firebase-admin";
import serviceAccount from "./txeka-aqui-ae4f5-firebase-adminsdk-fbsvc-f48b4f53c5.json" with { type: "json" };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
    databaseURL: "https://txeka-aqui-ae4f5-default-rtdb.firebaseio.com/"
  });
}

export const authAdmin = admin.auth();
export const rtdbAdmin = admin.database();
export const firestoreAdmin = admin.firestore();
