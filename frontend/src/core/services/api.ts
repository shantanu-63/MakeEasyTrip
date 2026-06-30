// Centralized API service — all fetch calls go through here
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchOptions {
  method?: HttpMethod;
  body?: unknown;
  token?: string;
}

export async function apiFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = "GET", body, token } = options;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text().catch(() => "Unknown error");
    throw new Error(`API ${method} ${endpoint} failed (${res.status}): ${err}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string, token?: string) => apiFetch<T>(endpoint, { token }),
  post: <T>(endpoint: string, body: unknown, token?: string) => apiFetch<T>(endpoint, { method: "POST", body, token }),
  put: <T>(endpoint: string, body: unknown, token?: string) => apiFetch<T>(endpoint, { method: "PUT", body, token }),
  delete: <T>(endpoint: string, token?: string) => apiFetch<T>(endpoint, { method: "DELETE", token }),
  patch: <T>(endpoint: string, body: unknown, token?: string) => apiFetch<T>(endpoint, { method: "PATCH", body, token }),
};
