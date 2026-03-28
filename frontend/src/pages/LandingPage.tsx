import {
  ArrowRight,
  ChartNoAxesCombined,
  LockKeyhole,
  MoveRight,
  Star,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Brand } from "../components/ui/Brand";
import { useAuth } from "../context/AuthContext";

const highlights = [
  {
    title: "Rotina mais legível",
    description: "Prioridades, conexões e progresso em uma interface que ajuda a decidir o próximo passo.",
    icon: Star,
    colorClass: "icon-blue",
  },
  {
    title: "Sessão de verdade",
    description: "Login persistido por cookie HTTP-only e navegação protegida pelo estado real da conta.",
    icon: LockKeyhole,
    colorClass: "icon-rose",
  },
  {
    title: "Base pronta para evoluir",
    description: "O front conversa com a API atual sem depender de dados falsos nem de cenários artificiais.",
    icon: ChartNoAxesCombined,
    colorClass: "icon-green",
  },
];

export function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing-page">
      <header className="landing-header">
        <Brand />
        <div className="landing-header-actions">
          <Link className="ghost-button" to={user ? "/dashboard" : "/entrar"}>
            {user ? "Abrir aplicativo" : "Entrar"}
          </Link>
          {!user ? (
            <Link className="primary-button" to="/criar-conta">
              Criar conta
            </Link>
          ) : null}
        </div>
      </header>

      <section className="hero-grid">
        <div className="hero-copy">
          <span className="eyebrow">Front-end conectado ao seu back-end</span>
          <h1>Organize tarefas e conexões em uma experiência que finalmente parece produto.</h1>
          <p>
            A Avel transforma a base atual da sua API em uma experiência mais
            clara, confiável e agradável de usar, com autenticação real,
            dashboard útil e fluxo direto para a rotina acontecer.
          </p>
          <div className="hero-summary">
            <div className="hero-stat">
              <strong>Leitura rápida</strong>
              <span>Hierarquia visual melhor resolvida para identificar o que importa.</span>
            </div>
            <div className="hero-stat">
              <strong>Dados reais</strong>
              <span>Tarefas, amizades e sessão refletindo o estado atual da aplicação.</span>
            </div>
          </div>
          <div className="hero-actions">
            <Link className="primary-button" to={user ? "/dashboard" : "/entrar"}>
              {user ? "Abrir painel" : "Entrar na Avel"}
              <ArrowRight size={18} />
            </Link>
            {!user ? (
              <Link className="secondary-button" to="/criar-conta">
                Criar conta
              </Link>
            ) : (
              <Link className="secondary-button" to="/tarefas">
                Ver tarefas
              </Link>
            )}
          </div>

          <div className="hero-proof">
            <div className="proof-chip">
              <ShieldCheck size={16} />
              <span>Autenticação persistida por cookie</span>
            </div>
            <div className="proof-chip">
              <Users size={16} />
              <span>Tarefas e amizades vindas da API</span>
            </div>
            <div className="proof-chip">
              <MoveRight size={16} />
              <span>Fluxo simples, pronto para evoluir</span>
            </div>
          </div>
        </div>

        <div className="hero-preview">
          <div className="preview-window">
            <div className="preview-bar">
              <span className="preview-dot preview-dot-red" />
              <span className="preview-dot preview-dot-yellow" />
              <span className="preview-dot preview-dot-green" />
            </div>

            <div className="preview-grid">
              <article className="preview-card preview-card-wide">
                <div className="preview-icon icon-green">
                  <ChartNoAxesCombined size={18} />
                </div>
                <strong>Visão geral com contexto real</strong>
                <p>Métricas derivadas da API e foco no que está pendente, concluído e em movimento.</p>
              </article>

              <article className="preview-card">
                <div className="preview-icon icon-blue">
                  <LockKeyhole size={18} />
                </div>
                <strong>Acesso sem atrito</strong>
                <p>Cadastro e login com linguagem melhor, feedback claro e menos aparência de protótipo.</p>
              </article>

              <article className="preview-card">
                <div className="preview-icon icon-rose">
                  <Users size={18} />
                </div>
                <strong>Conexões mais legíveis</strong>
                <p>Pedidos pendentes, amizades aceitas e ações visíveis sem sobrecarga visual.</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className="highlight-grid">
        {highlights.map(({ title, description, icon: Icon, colorClass }) => (
          <article className="surface-card" key={title}>
            <div className={`feature-icon ${colorClass}`}>
              <Icon size={18} />
            </div>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
