import type { ApiErrorPayload, ApiSuccess, FieldError } from "../../types/app";

const API_BASE_URL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "";

export class ApiError extends Error {
  status: number;
  code?: string;
  detail: unknown;
  fields: FieldError[];

  constructor(
    status: number,
    message: string,
    detail: unknown,
    code?: string,
    fields: FieldError[] = [],
  ) {
    super(message);
    this.status = status;
    this.code = code;
    this.detail = detail;
    this.fields = fields;
  }
}

function formatErrorMessage(detail: unknown, status: number) {
  if (isApiErrorPayload(detail) && detail.message.trim()) {
    return detail.message;
  }

  if (typeof detail === "string" && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    const messages = detail
      .map((item) =>
        typeof item === "object" && item !== null && "msg" in item
          ? String(item.msg)
          : null,
      )
      .filter(Boolean);

    if (messages.length > 0) {
      return messages.join(" ");
    }
  }

  if (status === 401) {
    return "Sua sessão não é válida no momento.";
  }

  if (status === 422) {
    return "Verifique os campos informados.";
  }

  return "Não foi possível concluir a solicitação.";
}

function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    typeof value.code === "string" &&
    "message" in value &&
    typeof value.message === "string" &&
    "fields" in value &&
    Array.isArray(value.fields)
  );
}

export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  const hasJsonBody = init.body !== undefined && !(init.body instanceof FormData);

  if (hasJsonBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers,
    credentials: "include",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const detail =
      payload && typeof payload === "object" && "error" in payload
        ? payload.error
        : payload;
    const errorPayload = isApiErrorPayload(detail) ? detail : null;
    throw new ApiError(
      response.status,
      formatErrorMessage(errorPayload ?? detail, response.status),
      detail,
      errorPayload?.code,
      errorPayload?.fields ?? [],
    );
  }

  if (response.status === 204 || !isJson) {
    return undefined as T;
  }

  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as ApiSuccess<T>).data;
  }

  return payload as T;
}
