import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

interface AuthContextType {
  sessionToken: string | null;
  setSessionToken: (token: string | null) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  sessionToken: null,
  setSessionToken: () => {},
  logout: () => {},
  isAdmin: false,
});

const SESSION_KEY = "pathology_admin_session";
const SUBACCOUNTS_KEY = "pathology_subaccounts";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [sessionToken, setSessionTokenState] = useState<string | null>(() => {
    return localStorage.getItem(SESSION_KEY);
  });

  const setSessionToken = useCallback((token: string | null) => {
    setSessionTokenState(token);
    if (token) {
      localStorage.setItem(SESSION_KEY, token);
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    setSessionToken(null);
  }, [setSessionToken]);

  return (
    <AuthContext.Provider
      value={{
        sessionToken,
        setSessionToken,
        logout,
        isAdmin: !!sessionToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export const SUBACCOUNTS_CACHE_KEY = SUBACCOUNTS_KEY;
