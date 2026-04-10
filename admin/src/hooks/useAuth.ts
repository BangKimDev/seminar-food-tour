import { useState, useCallback } from 'react';
import { authService } from '../services/authService';
import { AuthUser } from '../types';

/**
 * useAuth — quản lý trạng thái đăng nhập toàn ứng dụng.
 *
 * - Đọc session từ localStorage khi khởi tạo (persist qua refresh)
 * - Expose: user, isLoggedIn, isLoading, error, login(), logout()
 * - login() throw Error nếu thất bại để caller xử lý toast
 */
export function useAuth() {
  const [user, setUser]       = useState<AuthUser | null>(() => authService.getStoredUser());
  const [isLoading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const isLoggedIn = user !== null;

  const login = useCallback(async (username: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { token, user: authUser } = await authService.login(username, password);
      authService.storeSession(token, authUser);
      setUser(authUser);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Đăng nhập thất bại';
      setError(msg);
      throw err; // re-throw để App.tsx bắt và hiện toast
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await authService.logout();
    setUser(null);
    setError(null);
  }, []);

  return { user, isLoggedIn, isLoading, error, login, logout };
}
