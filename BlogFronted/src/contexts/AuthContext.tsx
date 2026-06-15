import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { adminLogin as adminLoginApi, checkAuth } from '../api';

interface AuthState {
  isAdmin: boolean;
  username: string;
  token: string;
}

interface AuthContextValue {
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = 'blog_admin_auth';

function readStorage(): AuthState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthState;
    if (!parsed.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(state: AuthState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearStorage() {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState | null>(readStorage);
  const [checking, setChecking] = useState(true);

  // 应用启动时验证 token 是否过期
  useEffect(() => {
    const stored = readStorage();
    if (!stored) {
      setChecking(false);
      return;
    }
    let cancelled = false;
    checkAuth()
      .then((valid) => {
        if (!cancelled) {
          if (!valid) clearStorage();
          setAuth(valid ? stored : null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearStorage();
          setAuth(null);
        }
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const token = await adminLoginApi(username, password);
    const state: AuthState = { isAdmin: true, username, token };
    writeStorage(state);
    setAuth(state);
  }, []);

  const logout = useCallback(() => {
    clearStorage();
    setAuth(null);
  }, []);

  if (checking) return null;

  return (
    <AuthContext.Provider value={{ isAdmin: auth?.isAdmin ?? false, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
