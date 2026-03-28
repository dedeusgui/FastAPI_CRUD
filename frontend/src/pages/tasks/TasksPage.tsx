import { FormEvent, useEffect, useState } from "react";
import { Check, ListTodo, PencilLine, Plus, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { StatusBadge } from "../../components/ui/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { ApiError } from "../../services/api/client";
import {
  completeTask,
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../../services/modules/tasks";
import type { TaskItem } from "../../types/app";

type TaskFilter = "todas" | "pendentes" | "concluidas";

const filterOptions: Array<{ value: TaskFilter; label: string }> = [
  { value: "todas", label: "todas" },
  { value: "pendentes", label: "pendentes" },
  { value: "concluidas", label: "concluídas" },
];

export function TasksPage() {
  const navigate = useNavigate();
  const { clearSession } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<TaskFilter>("todas");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadTaskList() {
      setIsLoading(true);
      setError("");

      try {
        const taskList = await getTasks();

        if (!active) {
          return;
        }

        setTasks(taskList);
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
            : "Não foi possível carregar suas tarefas.",
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void loadTaskList();

    return () => {
      active = false;
    };
  }, [clearSession, navigate]);

  async function refreshTasks(message?: string) {
    try {
      const taskList = await getTasks();
      setTasks(taskList);
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
          : "Não foi possível atualizar a lista de tarefas.",
      );
    }
  }

  const visibleTasks = tasks.filter((task) => {
    if (activeFilter === "pendentes") {
      return !task.completed;
    }
    if (activeFilter === "concluidas") {
      return task.completed;
    }
    return true;
  });

  async function handleCreateTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFeedback("");

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle) {
      setError("Informe um título para criar a tarefa.");
      return;
    }

    setIsSubmitting(true);

    try {
      await createTask({
        title: trimmedTitle,
        description: trimmedDescription || undefined,
      });
      setTitle("");
      setDescription("");
      await refreshTasks("Tarefa criada com sucesso.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível criar a tarefa.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditing(task: TaskItem) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description ?? "");
  }

  function stopEditing() {
    setEditingTaskId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function handleSaveTask(taskId: number) {
    setError("");
    setFeedback("");

    const trimmedTitle = editTitle.trim();
    const trimmedDescription = editDescription.trim();

    if (!trimmedTitle) {
      setError("O título da tarefa não pode ficar vazio.");
      return;
    }

    try {
      await updateTask(taskId, {
        title: trimmedTitle,
        description: trimmedDescription || undefined,
      });
      stopEditing();
      await refreshTasks("Tarefa atualizada.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível atualizar a tarefa.",
      );
    }
  }

  async function handleCompleteTask(taskId: number) {
    setError("");
    setFeedback("");

    try {
      await completeTask(taskId);
      await refreshTasks("Tarefa concluída.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível concluir a tarefa.",
      );
    }
  }

  async function handleDeleteTask(taskId: number) {
    setError("");
    setFeedback("");

    try {
      await deleteTask(taskId);
      if (editingTaskId === taskId) {
        stopEditing();
      }
      await refreshTasks("Tarefa removida.");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Não foi possível remover a tarefa.",
      );
    }
  }

  if (isLoading) {
    return (
      <div className="page-stack">
        <section className="surface-card loading-card">
          <span className="eyebrow">Tarefas</span>
          <h1>Carregando sua lista</h1>
          <p>Buscando o estado atual das tarefas diretamente na API.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="page-stack">
      <section className="page-header">
        <div>
          <span className="eyebrow">Tarefas</span>
          <h1>Organize o que precisa acontecer sem perder contexto</h1>
          <p>
            A lista trabalha com o que o back-end entrega hoje, com foco em
            leitura, edição rápida e feedback consistente após cada ação.
          </p>
        </div>
        <div className="header-chip">
          <ListTodo size={18} />
          <span>{visibleTasks.length} itens visíveis</span>
        </div>
      </section>

      {error ? <p className="form-feedback form-feedback-error">{error}</p> : null}
      {feedback ? <p className="form-feedback form-feedback-success">{feedback}</p> : null}

      <section className="surface-card task-composer-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Nova tarefa</span>
            <h2>Adicionar um novo item</h2>
            <p className="section-supporting-text">
              Descreva o essencial. Se precisar, você poderá editar depois.
            </p>
          </div>
        </div>

        <form className="task-form" onSubmit={handleCreateTask}>
          <label className="field">
            <span>Título</span>
            <div className="field-input">
              <input
                placeholder="Ex.: Revisar validação do fluxo de login"
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </div>
          </label>

          <label className="field">
            <span>Descrição</span>
            <div className="field-input field-textarea">
              <textarea
                placeholder="Opcional. Adicione um contexto curto para facilitar a execução."
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>
          </label>

          <button className="primary-button" disabled={isSubmitting} type="submit">
            <Plus size={18} />
            {isSubmitting ? "Criando..." : "Criar tarefa"}
          </button>
        </form>
      </section>

      <section className="surface-card">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Lista atual</span>
            <h2>Controle de visualização</h2>
            <p className="section-supporting-text">
              Filtre rapidamente para enxergar o que está pendente ou já concluído.
            </p>
          </div>
          <div className="filter-row">
            {filterOptions.map(({ value, label }) => (
              <button
                key={value}
                className={
                  activeFilter === value ? "filter-pill filter-pill-active" : "filter-pill"
                }
                type="button"
                onClick={() => setActiveFilter(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="stack-list">
          {visibleTasks.length === 0 ? (
            <div className="empty-state">
              <strong>Nenhuma tarefa neste filtro</strong>
              <p>Crie uma nova tarefa ou altere o filtro para visualizar outros itens.</p>
            </div>
          ) : (
            visibleTasks.map((task) => (
              <article className="task-card" key={task.id}>
                <div
                  className={task.completed ? "task-toggle task-toggle-done" : "task-toggle"}
                >
                  {task.completed ? <Check size={16} /> : null}
                </div>

                <div className="task-copy">
                  <div className="task-title-row">
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

                  {editingTaskId === task.id ? (
                    <div className="edit-panel">
                      <label className="field">
                        <span>Título</span>
                        <div className="field-input">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(event) => setEditTitle(event.target.value)}
                          />
                        </div>
                      </label>
                      <label className="field">
                        <span>Descrição</span>
                        <div className="field-input field-textarea">
                          <textarea
                            rows={3}
                            value={editDescription}
                            onChange={(event) => setEditDescription(event.target.value)}
                          />
                        </div>
                      </label>
                    </div>
                  ) : null}
                </div>

                <div className="task-actions">
                  {editingTaskId === task.id ? (
                    <>
                      <button className="soft-button" type="button" onClick={() => handleSaveTask(task.id)}>
                        <Check size={16} />
                        Salvar
                      </button>
                      <button className="soft-button" type="button" onClick={stopEditing}>
                        <X size={16} />
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      {!task.completed ? (
                        <button className="soft-button" type="button" onClick={() => handleCompleteTask(task.id)}>
                          <Check size={16} />
                          Concluir
                        </button>
                      ) : null}
                      <button className="soft-button" type="button" onClick={() => startEditing(task)}>
                        <PencilLine size={16} />
                        Editar
                      </button>
                    </>
                  )}

                  <button className="soft-button soft-button-danger" type="button" onClick={() => handleDeleteTask(task.id)}>
                    <Trash2 size={16} />
                    Excluir
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
