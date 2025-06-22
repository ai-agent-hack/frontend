"use client";

import type { User as FirebaseUser } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import {
  apiLogin,
  apiLogout,
  apiSessionLogin,
  apiSignup,
  type User as BackendUser,
} from "@/contexts/auth/action";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: BackendUser | null;
  loading: boolean;
  initializing: boolean;

  signup: (email: string, password: string, username: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<BackendUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        try {
          const firebaseToken = await firebaseUser.getIdToken();
          const backendUser = await apiSessionLogin(firebaseToken);

          setUser(backendUser);
        } catch (error) {
          console.error("Failed to sync with backend:", error);
        }
      } else {
        setUser(null);
      }

      setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseToken = await userCredential.user.getIdToken();
      await apiSignup(firebaseToken, username);
      const backendUser = await apiSessionLogin(firebaseToken);

      setUser(backendUser);
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseToken = await userCredential.user.getIdToken();
      await apiLogin(firebaseToken);
      const backendUser = await apiSessionLogin(firebaseToken);

      setUser(backendUser);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      try {
        await apiLogout();
      } catch (error) {
        console.error("Failed to clear backend session:", error);
      }

      setUser(null);
    } catch (error) {
      console.error("Signout failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    firebaseUser,
    user,
    loading,
    initializing,
    signup,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
