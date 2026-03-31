import { apiRequest } from "../api/client";
import type { TaskData, TaskItem, TasksData } from "../../types/app";

interface TaskPayload {
  title: string;
  description?: string;
}

interface TaskUpdatePayload {
  title?: string;
  description?: string;
}

export function getTasks() {
  return apiRequest<TasksData>("/tasks/").then(({ tasks }) => tasks);
}

export function createTask(payload: TaskPayload) {
  return apiRequest<TaskData>("/tasks/create", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(({ task }) => task);
}

export function completeTask(taskId: number) {
  return apiRequest<TaskData>(`/tasks/complete/${taskId}`, {
    method: "POST",
  }).then(({ task }) => task);
}

export function updateTask(taskId: number, payload: TaskUpdatePayload) {
  return apiRequest<TaskData>(`/tasks/update/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  }).then(({ task }) => task);
}

export function deleteTask(taskId: number) {
  return apiRequest<null>(`/tasks/delete/${taskId}`, {
    method: "DELETE",
  }).then(() => undefined);
}
