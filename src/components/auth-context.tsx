"use client";

import { SessionProvider, useSession, signOut } from "next-auth/react";
import { createContext, useContext, ReactNode } from "react";
import type { Session } from "next-auth";

interface AuthContextType {
  user: Session["user"] | null;
  isLoading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

const AuthProviderContent = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession();
  console.log("Auth status:", status, "Session:", session); // <-- Agrega esto
  const isLoading = status === "loading";
  const user = session?.user ?? null;

  const logout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      <AuthProviderContent>{children}</AuthProviderContent>
    </SessionProvider>
  );
};
