import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

// Inicializa o Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: "https://txeka-aqui-ae4f5-default-rtdb.firebaseio.com/",
  });
}

const authAdmin = admin.auth();
const firestoreAdmin = admin.firestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // ✅ Pega token enviado no header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await authAdmin.verifyIdToken(idToken);

    // ✅ Verifica se o uid é o admin
    if (decodedToken.uid !== process.env.ADMIN_UID) {
      return res.status(403).json({ error: "Acesso negado: você não é admin" });
    }

    // 🔹 Contar usuários
    const listUsers = await authAdmin.listUsers();
    const totalUsers = listUsers.users.length;

    // 🔹 Contar invoices
    const invoicesSnapshot = await firestoreAdmin.collection("invoices").get();
    const totalInvoices = invoicesSnapshot.size;

    // 🔹 Somar receita
    let totalRevenue = 0;
    invoicesSnapshot.forEach(doc => {
      const data = doc.data();
      totalRevenue += data.total || 0;
    });

    res.status(200).json({
      users: totalUsers,
      invoices: totalInvoices,
      revenue: totalRevenue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
}
