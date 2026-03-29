import {
  ChevronRight,
  LayoutDashboard,
  ListTodo,
  Sparkles,
  Users,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { Brand } from "../ui/Brand";

const navigation = [
  { to: "/dashboard", label: "Painel", icon: LayoutDashboard },
  { to: "/amigos", label: "Conexões", icon: Users },
  { to: "/tarefas", label: "Tarefas", icon: ListTodo },
];

export function AppShell() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-top">
          <Brand compact />

          <div className="sidebar-user sidebar-user-panel">
            <span className="eyebrow">Conta ativa</span>
            <strong>{user?.name}</strong>
            <p>{user?.email}</p>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Navegação principal">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              <span className="nav-icon">
                <Icon size={18} />
              </span>
              <span>{label}</span>
              <ChevronRight size={16} className="nav-arrow" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-card sidebar-card-product">
          <div className="sidebar-card-header">
            <Sparkles size={16} />
            <span>MVP em produção</span>
          </div>
          <p>
            Avel já roda sobre autenticação, tarefas e conexões reais. O foco
            agora é validar o uso diário com uma interface simples e confiável.
          </p>
          <Link className="ghost-button sidebar-link" to="/">
            Ver a proposta
          </Link>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
