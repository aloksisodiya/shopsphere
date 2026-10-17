import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const persist = (data) => {
    const u = { id: data.id, name: data.name, email: data.email, role: data.role };
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  const login = async (email, password) =>
    persist(await api("/auth/login", { method: "POST", body: { email, password }, auth: false }));

  const register = async (name, email, password) =>
    persist(
      await api("/auth/register", { method: "POST", body: { name, email, password }, auth: false })
    );

  // Validate any stored token once on load; an expired one triggers "auth:expired".
  useEffect(() => {
    if (localStorage.getItem("token")) api("/auth/me").catch(() => {});
  }, []);

  useEffect(() => {
    window.addEventListener("auth:expired", logout);
    return () => window.removeEventListener("auth:expired", logout);
  }, [logout]);

  const value = useMemo(
    () => ({ user, isAdmin: user?.role === "ADMIN", login, register, logout }),
    [user, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
