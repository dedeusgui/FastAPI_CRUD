import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { ApiError } from "../services/api/client";
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  register as registerRequest,
} from "../services/modules/auth";
import type { AuthPayload, AuthUser, RegisterPayload } from "../types/app";

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (payload: AuthPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  clearSession: () => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refreshSession() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        setUser(null);
        return;
      }

      throw error;
    }
  }

  function clearSession() {
    setUser(null);
  }

  async function login(payload: AuthPayload) {
    const currentUser = await loginRequest(payload);
    setUser(currentUser);
  }

  async function register(payload: RegisterPayload) {
    await registerRequest(payload);
    const currentUser = await loginRequest({
      email: payload.email,
      password: payload.password,
    });
    setUser(currentUser);
  }

  async function logout() {
    try {
      await logoutRequest();
    } catch (error) {
      if (!(error instanceof ApiError && error.status === 401)) {
        throw error;
      }
    } finally {
      setUser(null);
    }
  }

  useEffect(() => {
    let active = true;

    async function bootstrapSession() {
      try {
        await refreshSession();
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void bootstrapSession();

    return () => {
      active = false;
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        clearSession,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
