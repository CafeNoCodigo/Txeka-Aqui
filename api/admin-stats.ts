// api/admin-stats.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { authAdmin, firestoreAdmin } from "../backend/admin";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // 1️⃣ Contar usuários
    const listUsers = await authAdmin.listUsers();
    const totalUsers = listUsers.users.length;

    // 2️⃣ Contar invoices no Firestore
    const invoicesSnapshot = await firestoreAdmin.collection("invoices").get();
    const totalInvoices = invoicesSnapshot.size;

    // 3️⃣ Somar receita
    let totalRevenue = 0;
    invoicesSnapshot.forEach((doc) => {
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
