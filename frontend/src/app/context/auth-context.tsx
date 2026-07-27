import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import Cookies from "js-cookie";
import api from "@/lib/api";
import type { User } from "@/types";

interface RegisterParams {
  full_name: string;
  email: string;
  password: string;
  role: "teacher" | "learner";
}

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (params: RegisterParams) => Promise<User>;
  signInWithGoogle: (credential: string, role?: "teacher" | "learner") => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function setTokens(access: string, refresh: string) {
  Cookies.set("access_token", access, { expires: 1 });
  Cookies.set("refresh_token", refresh, { expires: 7 });
}

function clearTokens() {
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/api/auth/me/")
      .then((res) => setUser(res.data))
      .catch(clearTokens)
      .finally(() => setLoading(false));
  }, []);

  const signIn: AuthContextValue["signIn"] = async (email, password) => {
    const { data } = await api.post("/api/auth/login/", { email, password });
    setTokens(data.access, data.refresh);
    const me = await api.get("/api/auth/me/");
    setUser(me.data);
    return me.data as User;
  };

  const signUp: AuthContextValue["signUp"] = async (params) => {
    const { data } = await api.post("/api/auth/register/", params);
    setTokens(data.access, data.refresh);
    setUser(data.user);
    return data.user as User;
  };

  const signInWithGoogle: AuthContextValue["signInWithGoogle"] = async (credential, role) => {
    const { data } = await api.post("/api/auth/google/", { credential, role });
    setTokens(data.access, data.refresh);
    setUser(data.user);
    return data.user as User;
  };

  const signOut = async () => {
    const refresh = Cookies.get("refresh_token");
    if (refresh) await api.post("/api/auth/logout/", { refresh }).catch(() => {});
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
