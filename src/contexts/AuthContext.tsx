import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

export type UserRole = "petani" | "investor" | "admin" | "validator";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  createdAt: string;
  verificationStatus: "unverified" | "pending" | "verified" | "rejected";
  rejectionReason?: string;
  ktpPhotoUrl: string;
  nik: string;
  bio?: string;
  balance?: number;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  setMockProfile: (role: UserRole) => void;
  restoreAdminSession: (
    adminUser: FirebaseUser,
    adminProfile: UserProfile,
  ) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  useEffect(() => {
    // If we are in mock mode, don't let Firebase Auth override it
    if (isMock) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        // Subscribe to profile changes
        const docRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(
          docRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setProfile({ id: docSnap.id, ...docSnap.data() } as UserProfile);
            } else {
              setProfile(null);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error fetching profile:", error);
            setLoading(false);
          },
        );

        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [isMock]);

  const signOut = async () => {
    if (isMock) {
      setIsMock(false);
      setProfile(null);
      setUser(null);
    } else {
      await firebaseSignOut(auth);
    }
  };

  const setMockProfile = (role: UserRole) => {
    setIsMock(true);
    setLoading(false);
    setUser({ uid: `demo-${role}`, email: `${role}@demo.com` } as any);
    setProfile({
      id: `demo-${role}`,
      name: `${role.charAt(0).toUpperCase() + role.slice(1)} Demo`,
      email: `${role}@demo.com`,
      role: role,
      status: "active",
      createdAt: new Date().toISOString(),
      verificationStatus: "verified",
      bio: `Akun demo ${role} untuk eksplorasi platform LahanBersama.`,
      nik: "1234567890",
      ktpPhotoUrl: "",
      balance: 1500000,
    });
  };

  const restoreAdminSession = (
    adminUser: FirebaseUser,
    adminProfile: UserProfile,
  ) => {
    setUser(adminUser);
    setProfile(adminProfile);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signOut,
        setMockProfile,
        restoreAdminSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
