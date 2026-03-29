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
          getFriends(),
          getPendingFriendRequests(),
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
    (left, right) =>
      Number(left.completed) - Number(right.completed) || right.id - left.id,
  );

  const metrics = [
    {
      label: "Total de tarefas",
      value: tasks.length,
      note: "Tudo o que já foi registrado na sua rotina.",
      icon: metricIcons.total,
      accent: "icon-blue",
    },
    {
      label: "Concluídas",
      value: completedTasks,
      note: "Itens que já saíram da sua fila.",
      icon: metricIcons.done,
      accent: "icon-green",
    },
    {
      label: "Pendentes",
      value: pendingTasks,
      note: "O que ainda pede ação hoje.",
      icon: metricIcons.pending,
      accent: "icon-amber",
    },
    {
      label: "Conexões ativas",
      value: friends.length,
      note: "Contatos aceitos dentro da sua conta.",
      icon: metricIcons.friends,
      accent: "icon-rose",
    },
  ];

  if (isLoading) {
    return (
      <div className="page-stack">
        <section className="surface-card loading-card">
          <span className="eyebrow">Painel</span>
          <h1>Carregando sua área de trabalho</h1>
          <p>Buscando tarefas, conexões e pendências da sua conta.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="page-hero-card">
        <div className="page-hero-copy">
          <span className="eyebrow">Painel</span>
          <h1>Seu espaço de trabalho para hoje.</h1>
          <p>
            Acompanhe tarefas pendentes, convites recebidos e o status da sua
            conta sem trocar de tela.
          </p>
        </div>

        <div className="page-hero-aside page-hero-stats">
          <div className="header-chip header-chip-spacious">
            <ChartNoAxesCombined size={18} />
            <span>{pendingTasks} itens pedindo ação</span>
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
              <h2>O que vale olhar primeiro</h2>
              <p className="section-supporting-text">
                As tarefas abertas aparecem primeiro para você retomar a execução sem procurar demais.
              </p>
            </div>
            <Link className="soft-button" to="/tarefas">
              Abrir tarefas
            </Link>
          </div>

          <div className="stack-list stack-list-spacious">
            {tasksToShow.length === 0 ? (
              <div className="empty-state">
                <strong>Nenhuma tarefa cadastrada</strong>
                <p>Crie sua primeira tarefa para começar a usar a Avel no dia a dia.</p>
              </div>
            ) : (
              tasksToShow.slice(0, 4).map((task) => (
                <div className="list-row list-row-spacious" key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <p>{task.description ?? "Sem contexto adicional informado."}</p>
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
                Convites recebidos ficam separados para você responder sem misturar com as conexões ativas.
              </p>
            </div>
            <Link className="soft-button" to="/amigos">
              Abrir conexões
            </Link>
          </div>

          <div className="stack-list stack-list-spacious">
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <strong>Nenhum convite pendente</strong>
                <p>Quando alguém enviar uma solicitação, ela aparece aqui.</p>
              </div>
            ) : (
              pendingRequests.slice(0, 4).map((request) => (
                <div className="friend-row friend-row-spacious" key={request.id}>
                  <div className="avatar">#{request.requester_id}</div>
                  <div>
                    <strong>Convite do usuário #{request.requester_id}</strong>
                    <p>Pedido recebido e pronto para ser aceito ou recusado na área de conexões.</p>
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
              <h2>Conexões já ativas na sua conta</h2>
              <p className="section-supporting-text">
                Veja rapidamente quem já faz parte da sua rede hoje.
              </p>
            </div>
            <StatusBadge tone="primary">{friends.length} conexões</StatusBadge>
          </div>

          <div className="stack-list stack-list-spacious">
            {friends.length === 0 ? (
              <div className="empty-state">
                <strong>Sem conexões ativas</strong>
                <p>As conexões aceitas serão listadas aqui assim que estiverem disponíveis.</p>
              </div>
            ) : (
              friends.slice(0, 4).map((friend) => (
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
              <h2>Conta e sessão</h2>
              <p className="section-supporting-text">
                Um resumo da conta em uso para reforçar contexto enquanto você navega pelo produto.
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
                <p>Você está autenticado e pronto para continuar usando a Avel.</p>
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
