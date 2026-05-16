"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import type { UserRole } from "@/lib/types";
import { auth } from "@/lib/firebase/auth";
import { db } from "@/lib/firebase/client";

type AuthState = {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
};

const AuthContext = createContext<AuthState>({
  user: null,
  role: null,
  loading: true,
});

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<AuthState>({
    user: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    const database = db;

    if (!auth || !database) {
      setState({ user: null, role: null, loading: false });
      return;
    }

    let active = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) {
        return;
      }

      if (!user) {
        setState({ user: null, role: null, loading: false });
        return;
      }

      try {
        const snap = await getDoc(doc(database, "users", user.uid));
        const roleValue = snap.exists() ? (snap.data().role as UserRole) : null;
        const normalizedRole =
          roleValue === "dean" || roleValue === "intern" ? roleValue : null;

        setState({ user, role: normalizedRole, loading: false });
      } catch {
        setState({ user, role: null, loading: false });
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
