import type { VercelRequest, VercelResponse } from '@vercel/node';
import admin from 'firebase-admin';

// Inicializa o Firebase Admin apenas uma vez
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL,
    }),
    databaseURL: "https://txeka-aqui-ae4f5-default-rtdb.firebaseio.com/",
  });
}

const authAdmin = admin.auth();
const firestoreAdmin = admin.firestore();

// 🔒 UID permitido
const ALLOWED_UID = "dpMJJTdcIMNvAyFPxgDMWLnVdrm1";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 🔹 Pegar token do header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    const idToken = authHeader.split("Bearer ")[1];

    // 🔹 Verificar token no Firebase
    const decodedToken = await authAdmin.verifyIdToken(idToken);

    // 🔹 Checar UID autorizado
    if (decodedToken.uid !== ALLOWED_UID) {
      return res.status(403).json({ error: "Acesso negado" });
    }

    // 🔹 Contar usuários
    const listUsers = await authAdmin.listUsers(); // retorna até 1000
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
