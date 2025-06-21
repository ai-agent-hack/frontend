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
  type User as BackendUser,
  firebaseSessionLogin,
  firebaseSessionLogout,
  firebaseSignup,
  getCurrentUserInfo,
} from "@/contexts/auth/action";
import { auth } from "@/lib/firebase";

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: BackendUser | null;
  loading: boolean;
  initializing: boolean;

  signUp: (email: string, password: string, username: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
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
          const backendUser = await getCurrentUserInfo(firebaseToken);
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

  const signUp = async (email: string, password: string, username: string) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseToken = await userCredential.user.getIdToken();
      const backendUser = await firebaseSignup(firebaseToken, username);
      setUser(backendUser);
    } catch (error) {
      console.error("Signup failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseToken = await userCredential.user.getIdToken();

      const backendUser = await firebaseSessionLogin(firebaseToken);
      setUser(backendUser);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      await firebaseSignOut(auth);
      try {
        await firebaseSessionLogout();
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
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
