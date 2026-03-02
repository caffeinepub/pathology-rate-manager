import type React from "react";
import { createContext, useCallback, useContext, useState } from "react";

const SESSION_KEY = "lis_admin_session";
const ADMIN_USERNAME = "Rays";
const ADMIN_PASSWORD = "1245";

interface LisAuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const LisAuthContext = createContext<LisAuthContextType>({
  isAuthenticated: false,
  login: () => false,
  logout: () => {},
});

export function LisAuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!localStorage.getItem(SESSION_KEY);
  });

  const login = useCallback((username: string, password: string): boolean => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem(SESSION_KEY, "authenticated");
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <LisAuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </LisAuthContext.Provider>
  );
}

export function useLisAuth() {
  return useContext(LisAuthContext);
}
