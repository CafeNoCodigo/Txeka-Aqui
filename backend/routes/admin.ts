import { Router } from "express";
import { authAdmin, firestoreAdmin } from "../admin.ts";

const router = Router();

router.get("/stats", async (req, res) => {
  try {
    // 1️⃣ Contar usuários
    const listUsers = await authAdmin.listUsers(); // retorna max 1000 por vez
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

    res.json({
      users: totalUsers,
      invoices: totalInvoices,
      revenue: totalRevenue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar estatísticas" });
  }
});

export default router;