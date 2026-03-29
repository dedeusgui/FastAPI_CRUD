import {
  ArrowRight,
  ChartNoAxesCombined,
  CheckCheck,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { Brand } from "../components/ui/Brand";
import { useAuth } from "../context/AuthContext";

const categories = [
  {
    label: "Painel diário",
    note: "Retome prioridades, pendências e convites sem trocar de contexto.",
    icon: ChartNoAxesCombined,
  },
  {
    label: "Tarefas",
    note: "Crie, edite, conclua e filtre sua lista com rapidez.",
    icon: CheckCheck,
  },
  {
    label: "Conexões",
    note: "Use uma rede leve para acompanhar convites e contatos ativos.",
    icon: Users,
  },
  {
    label: "Sessão segura",
    note: "A conta segue autenticada por cookie e conectada ao backend real.",
    icon: ShieldCheck,
  },
];

const productModules = [
  {
    eyebrow: "Painel",
    title: "Volte para o que precisa de ação agora.",
    description:
      "O dashboard resume tarefas pendentes, convites recebidos e o estado da sua conta em uma leitura curta.",
    tone: "landing-module-sky",
    rows: [
      {
        title: "Resumo do dia",
        note: "Veja o que está pendente, o que foi concluído e o que ainda aguarda resposta.",
      },
      {
        title: "Fila de atenção",
        note: "As tarefas mais importantes aparecem primeiro, sem esconder o restante da rotina.",
      },
      {
        title: "Contexto da conta",
        note: "Você sabe em qual conta está e mantém a continuidade da sessão.",
      },
    ],
  },
  {
    eyebrow: "Tarefas",
    title: "Gerencie execução sem carregar peso desnecessário.",
    description:
      "A base atual da Avel já cobre o fluxo principal: criar tarefas, ajustar detalhes, concluir e limpar a lista.",
    tone: "landing-module-ink",
    rows: [
      {
        title: "Criação rápida",
        note: "Registre título e descrição curta para manter o foco no que precisa andar.",
      },
      {
        title: "Filtros objetivos",
        note: "Alterne entre todas, pendentes e concluídas sem bagunçar a leitura.",
      },
      {
        title: "Ação direta",
        note: "Editar, concluir ou excluir acontece no próprio item, sem etapas extras.",
      },
    ],
  },
  {
    eyebrow: "Conexões",
    title: "Uma camada social leve, útil e honesta com o estágio do produto.",
    description:
      "Hoje a rede da Avel complementa a organização pessoal com convites, pendências e conexões ativas.",
    tone: "landing-module-soft",
    rows: [
      {
        title: "Convite por ID",
        note: "O MVP usa o identificador da conta para iniciar novas conexões sem inventar fluxos que ainda não existem.",
      },
      {
        title: "Pendências claras",
        note: "Aceite ou recuse solicitações recebidas sem misturar isso com o restante do produto.",
      },
      {
        title: "Rede em ordem",
        note: "Mantenha sua lista de conexões ativas disponível para consulta e gestão.",
      },
    ],
  },
];

const trustCards = [
  {
    title: "Ligado à API atual",
    description:
      "O front conversa com autenticação, tarefas e amizades reais, em vez de depender de telas ilustrativas desconectadas.",
    icon: ShieldCheck,
    tone: "icon-blue",
  },
  {
    title: "Escopo enxuto",
    description:
      "Avel não tenta prometer uma rede social completa agora. O foco é validar a rotina principal com clareza.",
    icon: Sparkles,
    tone: "icon-amber",
  },
  {
    title: "Base pronta para evoluir",
    description:
      "Com a navegação e os contratos funcionando bem, fica mais seguro expandir o produto no próximo ciclo.",
    icon: Users,
    tone: "icon-rose",
  },
];

const heroRows = [
  {
    title: "Painel objetivo",
    note: "Resumo rápido do que está pendente, concluído e aguardando resposta.",
  },
  {
    title: "Tarefas no centro",
    note: "O fluxo principal da Avel é transformar intenção em execução diária.",
  },
  {
    title: "Conexões como apoio",
    note: "A rede entra para complementar a rotina, não para competir com ela.",
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
            {user ? "Abrir app" : "Entrar"}
          </Link>
          <Link className="primary-button" to={user ? "/dashboard" : "/criar-conta"}>
            {user ? "Ir para o painel" : "Criar conta"}
          </Link>
        </div>
      </header>

      <section className="landing-hero">
        <div className="landing-hero-copy">
          <span className="eyebrow">Avel</span>
          <h1>Organize sua rotina em um só lugar.</h1>
          <p>
            Avel é um MVP funcional para acompanhar tarefas, prioridades e uma
            camada leve de conexões com um front simples, claro e conectado ao
            backend real.
          </p>

          <div className="hero-actions">
            <Link className="primary-button" to={user ? "/dashboard" : "/criar-conta"}>
              {user ? "Abrir visão geral" : "Começar agora"}
              <ArrowRight size={18} />
            </Link>
            <Link className="secondary-button" to={user ? "/tarefas" : "/entrar"}>
              {user ? "Ver tarefas" : "Entrar"}
            </Link>
          </div>
        </div>

        <div className="landing-hero-stage">
          <div className="landing-hero-window">
            <div className="preview-bar">
              <span className="preview-dot preview-dot-red" />
              <span className="preview-dot preview-dot-yellow" />
              <span className="preview-dot preview-dot-green" />
            </div>

            <div className="landing-hero-screen">
              <div className="landing-hero-meta">
                <div className="landing-hero-heading">
                  <span className="eyebrow">Visão geral</span>
                  <strong>Tudo o que importa para continuar o dia.</strong>
                </div>
                <span className="landing-chip">MVP funcional</span>
              </div>

              <div className="landing-hero-summary">
                <article className="landing-hero-stat">
                  <span>Pendentes</span>
                  <strong>06</strong>
                </article>
                <article className="landing-hero-stat">
                  <span>Convites</span>
                  <strong>02</strong>
                </article>
                <article className="landing-hero-stat">
                  <span>Concluídas</span>
                  <strong>14</strong>
                </article>
              </div>

              <div className="landing-hero-canvas">
                <article className="landing-focus-card">
                  <div className="landing-focus-copy">
                    <span className="eyebrow">O que já funciona</span>
                    <strong>Uma base enxuta, mas pronta para ser usada.</strong>
                  </div>

                  <div className="landing-focus-list">
                    {heroRows.map((item) => (
                      <div className="landing-focus-item" key={item.title}>
                        <span className="landing-focus-bullet" aria-hidden="true" />
                        <div className="landing-focus-text">
                          <strong>{item.title}</strong>
                          <span>{item.note}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </article>

                <div className="landing-mini-stack">
                  <article className="landing-mini-card">
                    <div className="preview-icon icon-green">
                      <ShieldCheck size={18} />
                    </div>
                    <strong>Sessão preservada</strong>
                    <p>Login por cookie e continuidade direta para a área autenticada.</p>
                  </article>

                  <article className="landing-mini-card">
                    <div className="preview-icon icon-rose">
                      <Sparkles size={18} />
                    </div>
                    <strong>Escopo realista</strong>
                    <p>Sem promessas vazias: só o que a plataforma já sustenta hoje.</p>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-category-strip">
        <div className="landing-category-rail">
          {categories.map(({ label, note, icon: Icon }) => (
            <article className="landing-category-card" key={label}>
              <div className="preview-icon icon-blue">
                <Icon size={18} />
              </div>
              <strong>{label}</strong>
              <p>{note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-feature-group">
        <div className="landing-section-intro">
          <span className="eyebrow">O que você já consegue fazer</span>
          <h2>Um produto simples, mas com fluxo de uso real.</h2>
          <p>
            Em vez de vender uma plataforma exagerada, a Avel mostra exatamente
            o que já entrega hoje e cria uma base melhor para o próximo passo.
          </p>
        </div>

        <div className="landing-module-rail">
          {productModules.map((module) => (
            <article className={`landing-module ${module.tone}`} key={module.title}>
              <div className="landing-module-copy">
                <span className="eyebrow">{module.eyebrow}</span>
                <strong>{module.title}</strong>
                <p>{module.description}</p>
              </div>

              <div className="landing-module-frame">
                {module.rows.map((row) => (
                  <div className="landing-module-row" key={row.title}>
                    <span className="landing-module-bullet" aria-hidden="true" />
                    <div className="landing-module-text">
                      <strong>{row.title}</strong>
                      <span>{row.note}</span>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-proof-section">
        <div className="landing-section-intro">
          <span className="eyebrow">Por que essa abordagem funciona</span>
          <h2>Primeiro credibilidade. Depois expansão.</h2>
          <p>
            O front precisa transmitir confiança e fechar o ciclo com a API
            atual. Depois disso, faz sentido expandir recursos e sofisticar a
            experiência.
          </p>
        </div>

        <div className="landing-proof-grid">
          {trustCards.map(({ title, description, icon: Icon, tone }) => (
            <article className="landing-proof-card" key={title}>
              <div className={`feature-icon ${tone}`}>
                <Icon size={18} />
              </div>
              <strong>{title}</strong>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta-wrap">
        <div className="cta-band">
          <div className="cta-band-copy">
            <span className="eyebrow">Próximo passo</span>
            <h2>Validar o uso diário antes de ampliar a ambição do produto.</h2>
            <p>
              Avel já tem a base para testar o conceito com pessoas reais,
              aprender com o uso e evoluir sem carregar uma interface genérica.
            </p>
          </div>

          <div className="hero-actions">
            <Link className="primary-button" to={user ? "/dashboard" : "/criar-conta"}>
              {user ? "Abrir aplicativo" : "Criar conta"}
            </Link>
            <Link className="secondary-button" to={user ? "/tarefas" : "/entrar"}>
              {user ? "Ir para tarefas" : "Entrar"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
