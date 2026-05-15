import { apiClient } from './apiClient';
import { SystemUser } from '../types';

const TOKEN_KEY = 'owner_token';
const USER_KEY  = 'owner_user';

interface LoginResult {
  token: string;
  user: SystemUser;
}

export const authService = {
  async login(identifier: string, password: string): Promise<LoginResult> {
    return apiClient.post<LoginResult>('/auth/owner/login', { identifier, password });
  },

  async register(email: string, password: string, name: string, username: string, address?: string, description?: string, cuisine?: string, openingHours?: string): Promise<SystemUser> {
    return apiClient.post<SystemUser>('/auth/owner/register', { username, email, password, name, address, description, cuisine, openingHours });
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  storeSession(token: string, user: SystemUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getStoredUser(): SystemUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as SystemUser) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
};
