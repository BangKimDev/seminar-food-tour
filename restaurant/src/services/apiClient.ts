const BASE_URL = (import.meta.env.VITE_API_URL as string) || '';
const API_PREFIX = '/api';

const getToken = (): string | null => localStorage.getItem('owner_token');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${API_PREFIX}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    const msg = err.details
      ? err.details.map((d: any) => `${d.field}: ${d.message}`).join('; ')
      : err.error;
    throw new Error(msg || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const apiClient = {
  get:    <T>(url: string)                       => request<T>(url),
  post:   <T>(url: string, body: unknown)        => request<T>(url, { method: 'POST',   body: JSON.stringify(body) }),
  put:    <T>(url: string, body: unknown)        => request<T>(url, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  <T>(url: string, body: unknown)        => request<T>(url, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: <T>(url: string)                       => request<T>(url, { method: 'DELETE' }),
};
