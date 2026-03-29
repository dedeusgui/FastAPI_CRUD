import { FormEvent, useEffect, useState } from "react";
import { Check, Send, UserMinus, Users, X } from "lucide-react";
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
  sendFriendRequest,
} from "../../services/modules/friends";
import type { FriendItem, PendingFriendRequest } from "../../types/app";
import { getInitials } from "../../utils/avatar";

export function FriendsPage() {
  const navigate = useNavigate();
  const { clearSession } = useAuth();
  const [friends, setFriends] = useState<FriendItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingFriendRequest[]>([]);
  const [inviteId, setInviteId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFriends() {
      setIsLoading(true);
      setError("");

      try {
        const [friendList, pendingList] = await Promise.all([
          getFriends(),
          getPendingFriendRequests(),
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
  }, [clearSession, navigate]);

  async function refreshFriends(message?: string) {
    try {
      const [friendList, pendingList] = await Promise.all([
        getFriends(),
        getPendingFriendRequests(),
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

  async function handleInviteSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");
    setError("");

    const friendId = Number(inviteId.trim());

    if (!Number.isInteger(friendId) || friendId <= 0) {
      setError("Informe um ID de usuário válido para enviar o convite.");
      return;
    }

    setIsSendingInvite(true);

    try {
      await sendFriendRequest(friendId);
      setInviteId("");
      await refreshFriends("Convite enviado com sucesso.");
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "Não foi possível enviar este convite.",
      );
    } finally {
      setIsSendingInvite(false);
    }
  }

  async function handleAccept(request: PendingFriendRequest) {
    setFeedback("");
    setError("");

    try {
      await acceptFriendRequest(request.requester_id);
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
      await refuseFriendRequest(request.requester_id);
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
    setFeedback("");
    setError("");

    try {
      await removeFriendship(friend.id);
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
          <p>Buscando convites pendentes e conexões ativas da sua conta.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="page-hero-card">
        <div className="page-hero-copy">
          <span className="eyebrow">Conexões</span>
          <h1>Uma rede leve para complementar sua rotina.</h1>
          <p>
            Hoje a camada social da Avel é simples: enviar convites por ID,
            responder pendências e manter conexões ativas em ordem.
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
        <article className="surface-card surface-card-spacious task-composer-card">
          <div className="section-heading section-heading-spacious">
            <div>
              <span className="eyebrow">Novo convite</span>
              <h2>Conectar uma nova conta</h2>
              <p className="section-supporting-text">
                Neste estágio do produto, os convites são enviados pelo ID do
                usuário para manter o fluxo simples e alinhado à API atual.
              </p>
            </div>
          </div>

          <form className="task-form" onSubmit={handleInviteSubmit}>
            <label className="field">
              <span>ID do usuário</span>
              <div className="field-input">
                <input
                  inputMode="numeric"
                  placeholder="Ex.: 12"
                  type="text"
                  value={inviteId}
                  onChange={(event) => setInviteId(event.target.value)}
                />
              </div>
            </label>

            <button className="primary-button" disabled={isSendingInvite} type="submit">
              <Send size={18} />
              {isSendingInvite ? "Enviando..." : "Enviar convite"}
            </button>
          </form>
        </article>

        <article className="surface-card surface-card-spacious">
          <div className="section-heading section-heading-spacious">
            <div>
              <span className="eyebrow">Pendências</span>
              <h2>Solicitações aguardando resposta</h2>
              <p className="section-supporting-text">
                Responda aos convites recebidos antes de eles entrarem para a rede ativa.
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
                      <p>Solicitação recebida para a sua conta atual.</p>
                    </div>
                  </div>

                  <p>
                    O identificador da conta é exibido porque este MVP ainda não
                    possui busca de usuários ou perfis públicos completos.
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
      </section>

      <section className="surface-card surface-card-spacious">
        <div className="section-heading section-heading-spacious">
          <div>
            <span className="eyebrow">Rede ativa</span>
            <h2>Conexões já confirmadas</h2>
            <p className="section-supporting-text">
              Pessoas que já fazem parte da sua rede e podem continuar no seu fluxo.
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

                <p>Conexão disponível para consulta e gestão dentro da sua conta.</p>

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
      </section>
    </div>
  );
}
