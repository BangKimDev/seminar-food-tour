const BASE_URL = (import.meta.env.VITE_API_URL as string) || '';
const API_PREFIX = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${BASE_URL}${API_PREFIX}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiClient = {
  get:    <T>(url: string)                       => request<T>(url),
  post:   <T>(url: string, body: unknown)        => request<T>(url, { method: 'POST',   body: JSON.stringify(body) }),
};
