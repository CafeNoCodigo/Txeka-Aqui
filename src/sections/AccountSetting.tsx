import { useEffect, useState } from "react";
import { auth, firestore } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export default function AccountSettings() {
  const user = auth.currentUser;
  const [profile, setProfile] = useState({
    companyName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const docRef = doc(firestore, "users", user.uid);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setProfile((prev) => ({ ...prev, ...snap.data() }));
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    const docRef = doc(firestore, "users", user.uid);
    await updateDoc(docRef, profile);
    alert("Perfil atualizado com sucesso!");
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded mt-20">
      <h2 className="text-2xl font-bold mb-4">Configurações da Conta</h2>

      <label className="block mb-2">Nome da Empresa</label>
      <input
        type="text"
        value={profile.companyName}
        onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
        className="w-full border p-2 rounded mb-4"
      />

      <label className="block mb-2">Email</label>
      <input
        type="email"
        value={profile.email}
        disabled
        className="w-full border p-2 rounded mb-4 bg-gray-100"
      />

      <label className="block mb-2">Telefone</label>
      <input
        type="text"
        value={profile.phone}
        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
        className="w-full border p-2 rounded mb-4"
      />

      <button
        onClick={handleSave}
        className="bg-green-600 text-white px-4 py-2 rounded md:hover:bg-green-700 cursor-pointer"
      >
        Salvar alterações
      </button>
    </div>
  );
}