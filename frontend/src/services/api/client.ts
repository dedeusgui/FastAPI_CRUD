const API_BASE_URL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL
    : "";

export class ApiError extends Error {
  status: number;
  detail: unknown;

  constructor(status: number, message: string, detail: unknown) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

function formatErrorMessage(detail: unknown, status: number) {
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
      payload && typeof payload === "object" && "detail" in payload
        ? payload.detail
        : payload;
    throw new ApiError(
      response.status,
      formatErrorMessage(detail, response.status),
      detail,
    );
  }

  if (response.status === 204 || !isJson) {
    return undefined as T;
  }

  return payload as T;
}
