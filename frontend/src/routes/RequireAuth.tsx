import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function RequireAuth() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="auth-gate">
        <div className="auth-gate-card">
          <span className="eyebrow">Avel</span>
          <h1>Carregando sua sessão</h1>
          <p>Validando seu acesso antes de abrir a área autenticada.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
