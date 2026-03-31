import { apiRequest } from "../api/client";
import type {
  AuthPayload,
  AuthUser,
  RegisterPayload,
  UserData,
} from "../../types/app";

export function getCurrentUser() {
  return apiRequest<UserData>("/users/me").then(({ user }) => user);
}

export function login(payload: AuthPayload) {
  return apiRequest<UserData>("/users/login", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(({ user }) => user);
}

export function register(payload: RegisterPayload) {
  return apiRequest<UserData>("/users/register", {
    method: "POST",
    body: JSON.stringify(payload),
  }).then(({ user }) => user);
}

export function logout() {
  return apiRequest<null>("/users/logout", {
    method: "POST",
  });
}
