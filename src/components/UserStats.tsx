import { useEffect, useState } from "react";
import { auth } from "../firebaseConfig";

interface Stats {
  users: number;
  invoices: number;
  revenue: number;
}

const UserStats = () => {
  const [stats, setStats] = useState<Stats>({ users: 0, invoices: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const user = auth.currentUser;
      setCurrentUser(user);

      if (user) {
        try {
          const token = await user.getIdToken();
          const res = await fetch("http://localhost:3001/admin/stats", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (!res.ok) throw new Error("Erro ao buscar estatísticas");

          const data = await res.json();
          setStats({
            users: data.users,
            invoices: data.invoices,
            revenue: data.revenue,
          });
        } catch (error) {
          console.error(error);
        }
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) return <p className="mt-20 text-center">Carregando...</p>;
  if (!currentUser) return <p className="mt-20 text-center">Faça login para acessar o dashboard</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-center">Dashboard de Admin</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">Usuários Registrados</p>
          <p className="text-3xl font-bold">{stats.users}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">Faturas</p>
          <p className="text-3xl font-bold">{stats.invoices}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">Receita</p>
          <p className="text-3xl font-bold">{stats.revenue}</p>
        </div>
      </div>
    </div>
  );
};

export default UserStats;