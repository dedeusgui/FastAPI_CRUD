import { useEffect, useState } from "react";
import { Check, UserMinus, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { StatusBadge } from "../../components/ui/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/api/client";
import {
  acceptFriendRequest,
  getFriends,
  getPendingFriendRequests,
  refuseFriendRequest,
  removeFriendship,
} from "../../services/modules/friends";
import type { FriendItem, PendingFriendRequest } from "../../types/app";
import { getInitials } from "../../utils/avatar";

export function FriendsPage() {
  const navigate = useNavigate();
  const { user, clearSession } = useAuth();
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingFriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFriends() {
      if (!user) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const [friendList, pendingList] = await Promise.all([
          getFriends(user.id),
          getPendingFriendRequests(user.id),
        ]);

        if (!active) {
          return;
        }

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
            : "Não foi possível carregar suas conexões.",
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadFriends();

    return () => {
      active = false;
    };
  }, [clearSession, navigate, user]);

  async function refreshFriends(message?: string) {
    if (!user) {
      return;
    }

    try {
      const [friendList, pendingList] = await Promise.all([
        getFriends(user.id),
        getPendingFriendRequests(user.id),
      ]);

      setFriends(friendList);
      setPendingRequests(pendingList);
      if (message) {
        setFeedback(message);
      }
    } catch (refreshError) {
      if (refreshError instanceof ApiError && refreshError.status === 401) {
        clearSession();
        navigate("/entrar", { replace: true });
        return;
      }

      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Não foi possível atualizar suas conexões.",
      );
    }
  }

  async function handleAccept(request: PendingFriendRequest) {
    setFeedback("");
    setError("");

    try {
      await acceptFriendRequest({
        requester_id: request.requester_id,
        receiver_id: request.receiver_id,
      });
      await refreshFriends("Solicitação aceita com sucesso.");
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível aceitar esta solicitação.",
      );
    }
  }

  async function handleRefuse(request: PendingFriendRequest) {
    setFeedback("");
    setError("");

    try {
      await refuseFriendRequest({
        requester_id: request.requester_id,
        receiver_id: request.receiver_id,
      });
      await refreshFriends("Solicitação recusada.");
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível recusar esta solicitação.",
      );
    }
  }

  async function handleRemove(friend: FriendItem) {
    if (!user) {
      return;
    }

    setFeedback("");
    setError("");

    try {
      await removeFriendship(user.id, friend.id);
      await refreshFriends("Conexão removida.");
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível remover esta conexão.",
      );
    }
  }

  if (isLoading) {
    return (
      <div className="page-stack">
        <section className="surface-card loading-card">
          <span className="eyebrow">Conexões</span>
          <h1>Carregando sua rede</h1>
          <p>Preparando convites e conexões ativas da sua conta.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="page-hero-card">
        <div className="page-hero-copy">
          <span className="eyebrow">Conexões</span>
          <h1>Uma rede mais organizada para acompanhar quem já está com você.</h1>
          <p>
            Convites e contatos ativos ficam em áreas separadas para facilitar
            leitura, resposta e manutenção da sua rede sem parecer uma tela
            carregada demais.
          </p>
        </div>

        <div className="page-hero-aside page-hero-stats">
          <div className="header-chip header-chip-spacious">
            <Users size={18} />
            <span>{friends.length} conexões ativas</span>
          </div>
          <div className="inline-metric-grid">
            <article className="inline-metric-card">
              <span>Pendentes</span>
              <strong>{pendingRequests.length}</strong>
            </article>
            <article className="inline-metric-card">
              <span>Ativas</span>
              <strong>{friends.length}</strong>
            </article>
          </div>
        </div>
      </section>

      {error ? <p className="form-feedback form-feedback-error">{error}</p> : null}
      {feedback ? <p className="form-feedback form-feedback-success">{feedback}</p> : null}

      <section className="content-grid content-grid-featured friends-overview-grid">
        <article className="surface-card surface-card-spacious">
          <div className="section-heading section-heading-spacious">
            <div>
              <span className="eyebrow">Pendências</span>
              <h2>Solicitações aguardando resposta</h2>
              <p className="section-supporting-text">
                Responda aos convites recebidos sem perder visibilidade do restante da rede.
              </p>
            </div>
            <StatusBadge tone="warning">{pendingRequests.length} aguardando</StatusBadge>
          </div>

          <div className="stack-list stack-list-spacious">
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <strong>Nenhuma solicitação pendente</strong>
                <p>Quando um novo convite chegar, ele vai aparecer nesta área.</p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div className="friend-card friend-card-spacious" key={request.id}>
                  <div className="friend-card-top">
                    <div className="avatar avatar-large">#{request.requester_id}</div>
                    <div>
                      <strong>Usuário #{request.requester_id}</strong>
                      <p>Convite recebido para a sua conta atual.</p>
                    </div>
                  </div>

                  <p>
                    Por enquanto, esta listagem mostra o identificador disponível
                    para manter clareza e consistência na resposta aos convites.
                  </p>

                  <div className="friend-card-actions">
                    <StatusBadge tone="warning">Pendente</StatusBadge>
                    <div className="button-row">
                      <button className="soft-button" type="button" onClick={() => handleAccept(request)}>
                        <Check size={16} />
                        Aceitar
                      </button>
                      <button className="soft-button soft-button-danger" type="button" onClick={() => handleRefuse(request)}>
                        <X size={16} />
                        Recusar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="surface-card surface-card-spacious">
          <div className="section-heading section-heading-spacious">
            <div>
              <span className="eyebrow">Rede ativa</span>
              <h2>Conexões já confirmadas</h2>
              <p className="section-supporting-text">
                Pessoas que já fazem parte da sua rede em uma visualização mais aberta e fácil de percorrer.
              </p>
            </div>
            <StatusBadge tone="success">{friends.length} ativas</StatusBadge>
          </div>

          <div className="friend-grid friend-grid-spacious">
            {friends.length === 0 ? (
              <div className="empty-state empty-state-wide">
                <strong>Sem conexões confirmadas</strong>
                <p>Assim que houver amizades aceitas, elas serão exibidas aqui.</p>
              </div>
            ) : (
              friends.map((friend) => (
                <article className="friend-card friend-card-spacious" key={friend.id}>
                  <div className="friend-card-top">
                    <div className="avatar avatar-large">{getInitials(friend.name)}</div>
                    <div>
                      <strong>{friend.name}</strong>
                      <p>{friend.email}</p>
                    </div>
                  </div>

                  <p>Conexão disponível para consulta e gestão dentro do seu espaço de trabalho.</p>

                  <div className="friend-card-actions">
                    <StatusBadge tone="success">Ativa</StatusBadge>
                    <button className="soft-button soft-button-danger" type="button" onClick={() => handleRemove(friend)}>
                      <UserMinus size={16} />
                      Remover
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
