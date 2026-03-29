import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function RedirectIfAuthenticated() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="auth-gate">
        <div className="auth-gate-card">
          <span className="eyebrow">Avel</span>
          <h1>Preparando a experiência</h1>
          <p>Checando se já existe uma sessão ativa neste navegador.</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
