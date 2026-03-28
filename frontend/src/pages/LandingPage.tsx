import {
  ArrowRight,
  CalendarRange,
  ChartNoAxesCombined,
  CheckCheck,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Brand } from "../components/ui/Brand";
import { useAuth } from "../context/AuthContext";

const highlights = [
  {
    title: "Rotina com foco real",
    description:
      "Tarefas, prioridades e próximos passos aparecem em uma hierarquia clara, sem ruído visual desnecessário.",
    icon: CheckCheck,
    colorClass: "icon-blue",
  },
  {
    title: "Visão de progresso",
    description:
      "O painel transforma o estado atual da sua conta em sinais simples para acompanhar o que avança e o que pede atenção.",
    icon: ChartNoAxesCombined,
    colorClass: "icon-green",
  },
  {
    title: "Relacionamentos em ordem",
    description:
      "Convites pendentes e conexões ativas ficam separados com clareza para você agir sem perder contexto.",
    icon: Users,
    colorClass: "icon-rose",
  },
];

const productSignals = [
  {
    label: "Organização central",
    value: "Tarefas, conexões e conta em um só fluxo.",
  },
  {
    label: "Leitura tranquila",
    value: "Mais espaço, menos blocos disputando atenção.",
  },
  {
    label: "Uso diário",
    value: "Interface desenhada para acompanhar a rotina.",
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

      <section className="hero-grid hero-grid-editorial">
        <div className="hero-copy hero-copy-editorial">
          <span className="eyebrow">Avel</span>
          <h1>Produtividade com clareza, contexto e espaço para a rotina respirar.</h1>
          <p>
            A Avel organiza tarefas, conexões e andamento do seu dia em uma
            experiência mais calma, legível e profissional. Em vez de competir
            por atenção, cada área da interface ajuda você a entender o cenário
            e agir com rapidez.
          </p>

          <div className="hero-actions">
            <Link className="primary-button" to={user ? "/dashboard" : "/criar-conta"}>
              {user ? "Ir para o painel" : "Começar agora"}
              <ArrowRight size={18} />
            </Link>
            <Link className="secondary-button" to={user ? "/tarefas" : "/entrar"}>
              {user ? "Ver tarefas" : "Entrar na conta"}
            </Link>
          </div>

          <div className="hero-proof hero-proof-stacked">
            <div className="proof-chip">
              <ShieldCheck size={16} />
              <span>Acesso seguro e contínuo</span>
            </div>
            <div className="proof-chip">
              <CalendarRange size={16} />
              <span>Fluxo pensado para uso diário</span>
            </div>
            <div className="proof-chip">
              <Sparkles size={16} />
              <span>Linguagem e interface de produto</span>
            </div>
          </div>
        </div>

        <div className="hero-preview">
          <div className="preview-window preview-window-editorial">
            <div className="preview-bar">
              <span className="preview-dot preview-dot-red" />
              <span className="preview-dot preview-dot-yellow" />
              <span className="preview-dot preview-dot-green" />
            </div>

            <div className="hero-preview-panel">
              <div className="hero-preview-block hero-preview-block-primary">
                <div className="preview-copy">
                  <span className="eyebrow">Visão geral</span>
                  <strong>Um painel que mostra prioridades, progresso e relações ativas sem sobrecarregar a leitura.</strong>
                </div>
                <div className="preview-metric-row">
                  {productSignals.map((signal) => (
                    <article className="preview-stat-card" key={signal.label}>
                      <span>{signal.label}</span>
                      <strong>{signal.value}</strong>
                    </article>
                  ))}
                </div>
              </div>

              <div className="preview-grid preview-grid-editorial">
                <article className="preview-card">
                  <div className="preview-icon icon-green">
                    <ChartNoAxesCombined size={18} />
                  </div>
                  <strong>Resumo com contexto</strong>
                  <p>
                    Indicadores e listas curtas ajudam a identificar o que está
                    em andamento sem exigir leitura excessiva.
                  </p>
                </article>

                <article className="preview-card">
                  <div className="preview-icon icon-rose">
                    <Users size={18} />
                  </div>
                  <strong>Conexões organizadas</strong>
                  <p>
                    Convites e relações ativas aparecem separados para facilitar
                    decisão e acompanhamento.
                  </p>
                </article>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <div className="section-heading section-heading-spacious">
          <div>
            <span className="eyebrow">Por que a Avel</span>
            <h2>Menos densidade. Mais controle.</h2>
            <p className="section-supporting-text">
              A experiência foi redesenhada para caber melhor no ritmo real de
              quem precisa decidir, priorizar e seguir adiante.
            </p>
          </div>
        </div>

        <div className="highlight-grid highlight-grid-thirds">
          {highlights.map(({ title, description, icon: Icon, colorClass }) => (
            <article className="surface-card surface-card-spacious" key={title}>
              <div className={`feature-icon ${colorClass}`}>
                <Icon size={18} />
              </div>
              <h2>{title}</h2>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
