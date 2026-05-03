// apps/mobile/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from "react";
import { auth as authApi, saveToken, removeToken, type User } from "../lib/api";

interface AuthContextType {
  user: User | null;
  role: "student" | "professor" | "lab_technician" | null;
  isLoading: boolean;
  setTokenAndLoad: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null, role: null, isLoading: true,
  setTokenAndLoad: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar utilizador sempre que o token existir (ex.: após guardar no callback)
  useEffect(() => {
    console.log('[AuthContext] Calling /auth/me');
    authApi.me()
      .then((u) => {
        console.log('[AuthContext] User loaded:', u.email);
        setUser(u);
      })
      .catch((err) => {
        console.log('[AuthContext] /auth/me failed:', err.message);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const logout = async () => {
    await removeToken();
    setUser(null);
  };

  // Fornece uma forma simples de guardar o token e recarregar o utilizador
  const setTokenAndRefresh = async (token: string) => {
    await saveToken(token);
    // Força o recarregamento do utilizador
    setIsLoading(true);
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const role = user?.role === "lab_technician" ? "lab_technician"
    : user?.role === "professor" ? "professor"
    : user ? "student" : null;

  return (
    <AuthContext.Provider value={{ user, role, isLoading, setTokenAndLoad: setTokenAndRefresh, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);