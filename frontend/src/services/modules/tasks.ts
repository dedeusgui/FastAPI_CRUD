import { apiRequest } from "../api/client";
import type { TaskItem } from "../../types/app";

interface TaskPayload {
  title: string;
  description?: string;
}

interface TaskUpdatePayload {
  title?: string;
  description?: string;
}

export function getTasks() {
  return apiRequest<TaskItem[]>("/tasks/");
}

export function createTask(payload: TaskPayload) {
  return apiRequest<void>("/tasks/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function completeTask(taskId: number) {
  return apiRequest<void>(`/tasks/complete/${taskId}`, {
    method: "POST",
  });
}

export function updateTask(taskId: number, payload: TaskUpdatePayload) {
  return apiRequest<void>(`/tasks/update/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteTask(taskId: number) {
  return apiRequest<void>(`/tasks/delete/${taskId}`, {
    method: "DELETE",
  });
}
