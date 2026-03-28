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
            : "Não foi possível carregar suas amizades.",
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
          : "Não foi possível atualizar sua lista de amizades.",
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
      await refreshFriends("Amizade removida.");
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível remover esta amizade.",
      );
    }
  }

  if (isLoading) {
    return (
      <div className="page-stack">
        <section className="surface-card loading-card">
          <span className="eyebrow">Amigos</span>
          <h1>Carregando suas conexões</h1>
          <p>Buscando amizades aceitas e pendências recebidas na API.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="eyebrow">Amigos</span>
          <h1>Sua rede, com leitura mais direta</h1>
          <p>
            A tela mostra o que a API suporta hoje, mas com organização melhor
            entre convites pendentes, conexões ativas e ações críticas.
          </p>
        </div>
        <div className="header-chip">
          <Users size={18} />
          <span>{friends.length} ativos</span>
        </div>
      </section>

      {error ? <p className="form-feedback form-feedback-error">{error}</p> : null}
      {feedback ? <p className="form-feedback form-feedback-success">{feedback}</p> : null}

      <section className="content-grid">
        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Pendências</span>
              <h2>Solicitações em aberto</h2>
              <p className="section-supporting-text">
                Responda aos convites recebidos sem perder o contexto da conta atual.
              </p>
            </div>
            <StatusBadge tone="warning">{pendingRequests.length} aguardando</StatusBadge>
          </div>

          <div className="stack-list">
            {pendingRequests.length === 0 ? (
              <div className="empty-state">
                <strong>Nenhuma solicitação pendente</strong>
                <p>Quando alguém enviar um convite, ele vai aparecer nesta lista.</p>
              </div>
            ) : (
              pendingRequests.map((request) => (
                <div className="friend-card" key={request.id}>
                  <div className="friend-card-top">
                    <div className="avatar avatar-large">#{request.requester_id}</div>
                    <div>
                      <strong>Usuário #{request.requester_id}</strong>
                      <p>Convite recebido para a sua conta atual.</p>
                    </div>
                  </div>

                  <p>
                    A API ainda não expõe nome ou e-mail do remetente nesta
                    listagem, então a interface trabalha com o identificador real recebido.
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

        <article className="surface-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Rede ativa</span>
              <h2>Amigos aceitos</h2>
              <p className="section-supporting-text">
                Pessoas já conectadas à sua conta e disponíveis para consulta ou remoção.
              </p>
            </div>
            <StatusBadge tone="success">{friends.length} conexões</StatusBadge>
          </div>

          <div className="friend-grid">
            {friends.length === 0 ? (
              <div className="empty-state empty-state-wide">
                <strong>Sem amizades aceitas</strong>
                <p>
                  A tela de envio de convite fica oculta até que a API disponibilize
                  uma forma melhor de descobrir usuários.
                </p>
              </div>
            ) : (
              friends.map((friend) => (
                <article className="friend-card friend-card-tight" key={friend.id}>
                  <div className="friend-card-top">
                    <div className="avatar avatar-large">{getInitials(friend.name)}</div>
                    <div>
                      <strong>{friend.name}</strong>
                      <p>{friend.email}</p>
                    </div>
                  </div>

                  <p>Conexão ativa disponível para consulta e remoção pela interface.</p>
                  <div className="friend-card-actions">
                    <StatusBadge tone="success">Aceita</StatusBadge>
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
