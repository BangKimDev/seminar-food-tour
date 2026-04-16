import { apiClient } from './apiClient';

const TOKEN_KEY = 'owner_token';
const USER_KEY  = 'owner_user';

export interface OwnerUser {
  id: string;
  email: string;
  name: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: OwnerUser }> {
    return apiClient.post<{ token: string; user: OwnerUser }>('/auth/owner/login', { email, password });
  },

  async register(email: string, password: string, name: string): Promise<OwnerUser> {
    return apiClient.post<OwnerUser>('/auth/owner/register', { email, password, name });
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  storeSession(token: string, user: OwnerUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getStoredUser(): OwnerUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as OwnerUser) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
};
