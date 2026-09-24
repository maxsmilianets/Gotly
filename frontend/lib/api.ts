export type ApiResponse<T> = {
  data: T;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  payload?: unknown;
};

function getAuthHeaders() {
  if (typeof window === "undefined") {
    return {} as Record<string, string>;
  }

  const token = window.localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function normalizeError(data: unknown) {
  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    return Object.entries(data as Record<string, unknown>)
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : String(value)}`)
      .join(" | ");
  }
  return "Wystąpił błąd API.";
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: options.payload !== undefined ? JSON.stringify(options.payload) : undefined,
    cache: "no-store",
  });

  const contentType = response.headers.get("content-type") ?? "";
  const hasBody = response.status !== 204;
  const data = hasBody ? (contentType.includes("application/json") ? await response.json() : await response.text()) : null;

  if (!response.ok) {
    throw new Error(normalizeError(data));
  }

  return { data: data as T };
}

function get<T = unknown>(url: string) {
  return request<T>(url, { method: "GET" });
}

function post<T = unknown>(url: string, payload?: unknown) {
  return request<T>(url, { method: "POST", payload });
}

function put<T = unknown>(url: string, payload?: unknown) {
  return request<T>(url, { method: "PUT", payload });
}

function patch<T = unknown>(url: string, payload?: unknown) {
  return request<T>(url, { method: "PATCH", payload });
}

function remove<T = unknown>(url: string) {
  return request<T>(url, { method: "DELETE" });
}

export const api = { get, post, put, patch, delete: remove };
