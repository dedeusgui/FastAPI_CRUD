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
      icon: metricIcons.total,
      accent: "icon-blue",
    },
    {
      label: "Concluídas",
      value: completedTasks,
      icon: metricIcons.done,
      accent: "icon-green",
    },
    {
      label: "Pendentes",
      value: pendingTasks,
      icon: metricIcons.pending,
      accent: "icon-amber",
    },
    {
      label: "Amigos ativos",
      value: friends.length,
      icon: metricIcons.friends,
      accent: "icon-rose",
    },
  ];

  if (isLoading) {
    return (
      <div className="page-stack">
        <section className="surface-card loading-card">
          <span className="eyebrow">Dashboard</span>
          <h1>Carregando sua visão geral</h1>
          <p>Buscando tarefas, amizades e solicitações pendentes na API.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Bom te ver, {user?.name}</h1>
          <p>
            Tudo o que aparece aqui reflete o estado atual da sua conta, com
            foco em leitura rápida e nas ações que realmente pedem atenção.
          </p>
        </div>
        <div className="header-chip">
          <ChartNoAxesCombined size={18} />
          <span>Conta ativa: {user?.email}</span>
        </div>
      </section>

      {error ? <p className="form-feedback form-feedback-error">{error}</p> : null}

      <section className="metric-grid">
        {metrics.map(({ label, value, icon: Icon, accent }) => (
          <article className="surface-card metric-card" key={label}>
            <div className="metric-card-header">
              <div className={`feature-icon ${accent}`}>
                <Icon size={18} />
              </div>
              <span>{label}</span>
            </div>
            <strong>{value}</strong>
            <p className="metric-card-note">
              {label === "Total de tarefas"
                ? "Volume geral da sua rotina."
                : label === "Concluídas"
                  ? "Itens já resolvidos."
                  : label === "Pendentes"
                    ? "O que ainda depende de você."
                    : "Pessoas já conectadas à sua conta."}
            </p>
          </article>
        ))}
      </section>

      <section className="content-grid">
        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Foco</span>
              <h2>O que merece atenção agora</h2>
            </div>
            <Link className="soft-button" to="/tarefas">
              Abrir tarefas
            </Link>
          </div>

          <div className="stack-list">
            {tasksToShow.length === 0 ? (
              <div className="empty-state">
                <strong>Nenhuma tarefa encontrada</strong>
                <p>Crie sua primeira tarefa para começar a organizar a rotina com mais clareza.</p>
              </div>
            ) : (
              tasksToShow.slice(0, 4).map((task) => (
                <div className="list-row" key={task.id}>
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

        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Pendências</span>
              <h2>Solicitações recebidas</h2>
            </div>
            <StatusBadge tone="warning">{pendingRequests.length} abertas</StatusBadge>
          </div>

          <div className="stack-list">
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <strong>Nada pendente por aqui</strong>
                <p>Sua fila de convites recebidos está vazia no momento.</p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div className="friend-row" key={request.id}>
                  <div className="avatar">#{request.requester_id}</div>
                  <div>
                    <strong>Solicitação do usuário #{request.requester_id}</strong>
                    <p>Convite recebido para a conta autenticada #{request.receiver_id}.</p>
                  </div>
                  <StatusBadge tone="warning">Pendente</StatusBadge>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="content-grid">
        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Amigos</span>
              <h2>Sua rede ativa</h2>
            </div>
            <StatusBadge tone="primary">{friends.length} conectados</StatusBadge>
          </div>

          <div className="stack-list">
            {friends.length === 0 ? (
              <div className="empty-state">
                <strong>Sem amizades aceitas</strong>
                <p>Assim que houver conexões aceitas, elas vão aparecer aqui.</p>
              </div>
            ) : (
              friends.map((friend) => (
                <div className="friend-row" key={friend.id}>
                  <div className="avatar">{getInitials(friend.name)}</div>
                  <div>
                    <strong>{friend.name}</strong>
                    <p>{friend.email}</p>
                  </div>
                  <StatusBadge tone="success">Ativo</StatusBadge>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Sessão</span>
              <h2>Identidade da conta</h2>
            </div>
          </div>

          <div className="profile-card">
            <div className="avatar avatar-xl">{getInitials(user?.name ?? "Avel")}</div>
            <div>
              <strong>{user?.name}</strong>
              <p>{user?.email}</p>
            </div>
          </div>

          <div className="stack-list stack-list-tight">
            <div className="list-row">
              <div>
                <strong>Sessão autenticada</strong>
                <p>O acesso foi validado com base em `/users/me`.</p>
              </div>
              <StatusBadge tone="success">Válida</StatusBadge>
            </div>

            <div className="list-row">
              <div>
                <strong>Canal de contato</strong>
                <p>O e-mail abaixo representa a conta autenticada no momento.</p>
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
