import React, { createContext, useContext, useState } from "react";

type Rol = "admin" | "vendedor";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  username: string | null;
  rol: Rol | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "imparables_session";
const SESSION_ROL_KEY = "imparables_rol";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [username, setUsername] = useState<string | null>(() =>
    sessionStorage.getItem(SESSION_KEY)
  );
  const [rol, setRol] = useState<Rol | null>(() =>
    sessionStorage.getItem(SESSION_ROL_KEY) as Rol | null
  );

  const isAuthenticated = username !== null;
  const isAdmin = rol === "admin";

  const login = async (user: string, password: string): Promise<boolean> => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user, password }),
    });
    if (res.ok) {
      const data = await res.json() as { username: string; rol: Rol };
      sessionStorage.setItem(SESSION_KEY, data.username);
      sessionStorage.setItem(SESSION_ROL_KEY, data.rol);
      setUsername(data.username);
      setRol(data.rol);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_ROL_KEY);
    setUsername(null);
    setRol(null);
  };

  const getAuthHeaders = (): Record<string, string> => ({
    "x-user-rol": rol ?? "",
    "x-username": username ?? "",
  });

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, username, rol, login, logout, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
