import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import { firebaseAuth } from "@/lib/firebase";

type AuthContextValue = {
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void setPersistence(firebaseAuth, browserLocalPersistence);
    const unsub = onAuthStateChanged(firebaseAuth, async (nextUser) => {
      setUser(nextUser);
      if (nextUser) {
        setAuthTokenGetter(async () => nextUser.getIdToken());
      } else {
        setAuthTokenGetter(null);
      }
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      isSignedIn: !!user,
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      },
      signUp: async (email, password) => {
        await createUserWithEmailAndPassword(firebaseAuth, email, password);
      },
      logout: async () => {
        await signOut(firebaseAuth);
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

