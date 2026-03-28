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
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/amigos", label: "Amigos", icon: Users },
  { to: "/tarefas", label: "Tarefas", icon: ListTodo },
];

export function AppShell() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="sidebar-top">
          <Brand compact />
          <div className="sidebar-user">
            <span className="eyebrow">Sessão ativa</span>
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

        <div className="sidebar-card">
          <div className="sidebar-card-header">
            <Sparkles size={16} />
            <span>Resumo do produto</span>
          </div>
          <p>
            A interface trabalha com a API real e prioriza leitura rápida,
            feedback claro e menos atrito nas ações do dia a dia.
          </p>
          <Link className="ghost-button sidebar-link" to="/">
            Ver landing pública
          </Link>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
