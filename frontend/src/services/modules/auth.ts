import { apiRequest } from "../api/client";
import type { AuthPayload, AuthUser, RegisterPayload } from "../../types/app";

interface MessageResponse {
  message: string;
}

export function getCurrentUser() {
  return apiRequest<AuthUser>("/users/me");
}

export function login(payload: AuthPayload) {
  return apiRequest<MessageResponse>("/users/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<MessageResponse>("/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
