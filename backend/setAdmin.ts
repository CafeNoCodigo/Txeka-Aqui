import { authAdmin } from "./admin.ts";

async function makeAdmin(uid: string) {
  try {
    await authAdmin.setCustomUserClaims(uid, { admin: true });
    console.log(`Usuário ${uid} agora é admin!`);
  } catch (err) {
    console.error("Erro ao definir admin:", err);
  }
}

// Substitua pelo UID do usuário que quer tornar admin
const UID_DO_USUARIO = String(process.env.VITE_FIREBASE_UID);
makeAdmin(UID_DO_USUARIO);