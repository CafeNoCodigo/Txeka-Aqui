import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";
import AuthForm from "./components/AuthForm";
import InvoiceManager from "./components/InvoiceManager";
import type { User } from "firebase/auth";
import { Suspense, lazy } from "react";

const Loader = lazy(() => import("./components/Loader"));

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gray-100">
          <Loader text="Inicializando aplicação..." size={80} />
        </div>
      }
    >
      {loading ? (
        <div className="h-screen flex items-center justify-center bg-gray-100">
          <Loader text="Cuidando de Suas Faturas..." size={80} />
        </div>
      ) : (
        <Routes>
          <Route
            path="/login"
            element={!user ? <AuthForm /> : <Navigate to="/invoices" />}
          />
          <Route
            path="/invoices"
            element={user ? <InvoiceManager /> : <Navigate to="/login" />}
          />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Suspense>
  );
}

export default App;
