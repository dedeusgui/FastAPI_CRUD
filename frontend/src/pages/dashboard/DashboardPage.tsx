import {
  ChartNoAxesCombined,
  CheckCheck,
  CircleDashed,
  ListTodo,
  Mail,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { StatusBadge } from "../../components/ui/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/api/client";
import {
  getFriends,
  getPendingFriendRequests,
} from "../../services/modules/friends";
import { getTasks } from "../../services/modules/tasks";
import type { FriendItem, PendingFriendRequest, TaskItem } from "../../types/app";
import { getInitials } from "../../utils/avatar";

const metricIcons = {
  total: ListTodo,
  done: CheckCheck,
  pending: CircleDashed,
  friends: Users,
};

export function DashboardPage() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingFriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      if (!user) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const [taskList, friendList, pendingList] = await Promise.all([
          getTasks(),
          getFriends(user.id),
          getPendingFriendRequests(user.id),
        ]);

        if (!active) {
          return;
        }

        setTasks(taskList);
        setFriends(friendList);
        setPendingRequests(pendingList);
      } catch (loadError) {
        if (loadError instanceof ApiError && loadError.status === 401) {
          clearSession();
          navigate("/entrar", { replace: true });
          return;
        }

        if (!active) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Não foi possível carregar sua visão geral.",
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [clearSession, navigate, user]);

  const completedTasks = tasks.filter((task) => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  const tasksToShow = [...tasks].sort(
    (left, right) => Number(left.completed) - Number(right.completed),
  );

  const metrics = [
    {
      label: "Total de tarefas",
      value: tasks.length,
      note: "Tudo o que está registrado na sua rotina.",
      icon: metricIcons.total,
      accent: "icon-blue",
    },
    {
      label: "Concluídas",
      value: completedTasks,
      note: "Itens que já avançaram até o fim.",
      icon: metricIcons.done,
      accent: "icon-green",
    },
    {
      label: "Pendentes",
      value: pendingTasks,
      note: "O que ainda merece sua atenção.",
      icon: metricIcons.pending,
      accent: "icon-amber",
    },
    {
      label: "Conexões ativas",
      value: friends.length,
      note: "Pessoas já confirmadas na sua rede.",
      icon: metricIcons.friends,
      accent: "icon-rose",
    },
  ];

  if (isLoading) {
    return (
      <div className="page-stack">
        <section className="surface-card loading-card">
          <span className="eyebrow">Painel</span>
          <h1>Preparando sua visão do dia</h1>
          <p>Carregando tarefas, conexões e pendências da sua conta.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="page-hero-card">
        <div className="page-hero-copy">
          <span className="eyebrow">Painel</span>
          <h1>Um resumo claro para retomar sua rotina com contexto.</h1>
          <p>
            Veja o que está em andamento, o que já foi resolvido e quais
            relações ainda precisam de resposta. Tudo em uma leitura mais leve,
            com espaço para entender antes de agir.
          </p>
        </div>

        <div className="page-hero-aside page-hero-stats">
          <div className="header-chip header-chip-spacious">
            <ChartNoAxesCombined size={18} />
            <span>{pendingTasks} prioridades em aberto</span>
          </div>
          <div className="hero-account-card">
            <div className="avatar avatar-xl">{getInitials(user?.name ?? "Avel")}</div>
            <div>
              <strong>{user?.name}</strong>
              <p>{user?.email}</p>
            </div>
          </div>
        </div>
      </section>

      {error ? <p className="form-feedback form-feedback-error">{error}</p> : null}

      <section className="metric-grid metric-grid-spacious">
        {metrics.map(({ label, value, note, icon: Icon, accent }) => (
          <article className="surface-card metric-card metric-card-spacious" key={label}>
            <div className="metric-card-header">
              <div className={`feature-icon ${accent}`}>
                <Icon size={18} />
              </div>
              <span>{label}</span>
            </div>
            <strong>{value}</strong>
            <p className="metric-card-note">{note}</p>
          </article>
        ))}
      </section>

      <section className="content-grid content-grid-featured dashboard-board">
        <article className="surface-card surface-card-spacious">
          <div className="section-heading section-heading-spacious">
            <div>
              <span className="eyebrow">Em foco</span>
              <h2>O que merece atenção agora</h2>
              <p className="section-supporting-text">
                Uma leitura curta das tarefas mais relevantes para você retomar
                o ritmo sem percorrer a lista inteira.
              </p>
            </div>
            <Link className="soft-button" to="/tarefas">
              Abrir tarefas
            </Link>
          </div>

          <div className="stack-list stack-list-spacious">
            {tasksToShow.length === 0 ? (
              <div className="empty-state">
                <strong>Nenhuma tarefa registrada</strong>
                <p>Adicione sua primeira tarefa para começar a organizar o que vem pela frente.</p>
              </div>
            ) : (
              tasksToShow.slice(0, 4).map((task) => (
                <div className="list-row list-row-spacious" key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.description ?? "Sem descrição adicional informada."}</p>
                  </div>
                  <div className="row-meta">
                    <StatusBadge tone={task.completed ? "success" : "warning"}>
                      {task.completed ? "Concluída" : "Pendente"}
                    </StatusBadge>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="surface-card surface-card-spacious">
          <div className="section-heading section-heading-spacious">
            <div>
              <span className="eyebrow">Pendências</span>
              <h2>Convites aguardando resposta</h2>
              <p className="section-supporting-text">
                Mantenha a rede organizada respondendo ao que ainda está em aberto.
              </p>
            </div>
            <StatusBadge tone="warning">{pendingRequests.length} aguardando</StatusBadge>
          </div>

          <div className="stack-list stack-list-spacious">
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <strong>Nenhum convite pendente</strong>
                <p>Sua fila de solicitações está vazia no momento.</p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div className="friend-row friend-row-spacious" key={request.id}>
                  <div className="avatar">#{request.requester_id}</div>
                  <div>
                    <strong>Convite do usuário #{request.requester_id}</strong>
                    <p>Solicitação recebida para a conta atual.</p>
                  </div>
                  <StatusBadge tone="warning">Pendente</StatusBadge>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="content-grid content-grid-featured dashboard-support">
        <article className="surface-card surface-card-spacious">
          <div className="section-heading section-heading-spacious">
            <div>
              <span className="eyebrow">Rede ativa</span>
              <h2>Conexões que já fazem parte do seu espaço</h2>
              <p className="section-supporting-text">
                Visualize rapidamente quem está conectado à sua conta hoje.
              </p>
            </div>
            <StatusBadge tone="primary">{friends.length} conexões</StatusBadge>
          </div>

          <div className="stack-list stack-list-spacious">
            {friends.length === 0 ? (
              <div className="empty-state">
                <strong>Sem conexões ativas</strong>
                <p>Assim que houver amizades aceitas, elas vão aparecer aqui.</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div className="friend-row friend-row-spacious" key={friend.id}>
                  <div className="avatar">{getInitials(friend.name)}</div>
                  <div>
                    <strong>{friend.name}</strong>
                    <p>{friend.email}</p>
                  </div>
                  <StatusBadge tone="success">Ativa</StatusBadge>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="surface-card surface-card-spacious">
          <div className="section-heading section-heading-spacious">
            <div>
              <span className="eyebrow">Conta</span>
              <h2>Sua presença na plataforma</h2>
              <p className="section-supporting-text">
                Um resumo simples da conta em uso para reduzir dúvida e reforçar contexto.
              </p>
            </div>
          </div>

          <div className="profile-card profile-card-spacious">
            <div className="avatar avatar-xl">{getInitials(user?.name ?? "Avel")}</div>
            <div>
              <strong>{user?.name}</strong>
              <p>{user?.email}</p>
            </div>
          </div>

          <div className="stack-list stack-list-tight">
            <div className="list-row list-row-spacious">
              <div>
                <strong>Sessão em andamento</strong>
                <p>Você está autenticado e pronto para continuar usando a plataforma.</p>
              </div>
              <StatusBadge tone="success">Ativa</StatusBadge>
            </div>

            <div className="list-row list-row-spacious">
              <div>
                <strong>E-mail principal</strong>
                <p>Canal associado à conta utilizada neste momento.</p>
              </div>
              <div className="row-meta">
                <Mail size={16} />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
