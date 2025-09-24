import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem("auth");
      return raw
        ? JSON.parse(raw)
        : { token: null, userId: null, userName: null, email: null };
    } catch {
      return { token: null, userId: null, userName: null, email: null };
    }
  });

  useEffect(() => {
    localStorage.setItem("auth", JSON.stringify(auth));
  }, [auth]);

  const login = ({ token, userId, userName, email }) => {
    setAuth({ token, userId, userName, email: email || null });
  };

  const logout = () => {
    setAuth({ token: null, userId: null, userName: null, email: null });
    localStorage.removeItem("auth");
  };

  const value = useMemo(
    () => ({
      ...auth,
      isAuthenticated: Boolean(auth?.token && auth?.userId),
      login,
      logout,
    }),
    [auth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
