import { apiClient } from './apiClient';
import { AuthUser } from '../types';

/**
 * Auth Service
 *
 * ASSUMPTION: POST /auth/login → { token: string, user: AuthUser }
 *             POST /auth/logout → 204
 *
 * AUTO-MOCK: Khi VITE_API_URL không được set (rỗng), mọi call đều dùng mock
 * để tiện phát triển POC mà không cần backend.
 */

const USE_MOCK = !(import.meta.env.VITE_API_URL as string);

const TOKEN_KEY = 'auth_token';
const USER_KEY  = 'auth_user';

export const authService = {
  async login(username: string, password: string): Promise<{ token: string; user: AuthUser }> {
    if (!username.trim() || !password.trim()) {
      throw new Error('Tên đăng nhập và mật khẩu không được để trống');
    }

    if (USE_MOCK) {
      // Mock: chấp nhận mọi credential, delay 700ms mô phỏng network
      await new Promise(r => setTimeout(r, 700));
      return {
        token: `mock-jwt-${Date.now()}`,
        user: {
          id: 'u1',
          username,
          email: `${username}@foodtour.vn`,
          displayName: 'Admin User',
          role: 'admin',
        },
      };
    }

    return apiClient.post<{ token: string; user: AuthUser }>('/auth/login', { username, password });
  },

  async logout(): Promise<void> {
    if (!USE_MOCK) {
      // Best-effort: không throw nếu endpoint fail
      await apiClient.post('/auth/logout', {}).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  storeSession(token: string, user: AuthUser): void {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getStoredUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
};
