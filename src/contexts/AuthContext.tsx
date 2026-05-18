import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { UserProfile, BadgeType } from "../types";
import { generateUID } from "../lib/utils";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Sync profile
        const profileRef = doc(db, "users", firebaseUser.uid);
        const unsubscribeProfile = onSnapshot(profileRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setProfile(data);

            // Force admin badge for these specific emails
            const adminEmails = ["mf460854@gmail.com", "mdfaruq0194@gmail.com"];
            if (firebaseUser.email && adminEmails.includes(firebaseUser.email) && data.badge !== BadgeType.ADMIN) {
              await setDoc(profileRef, { badge: BadgeType.ADMIN }, { merge: true });
            }
          } else {
            // New user - profile should be created during registration, 
            // but for safety (e.g. Google login) we can check if it exists
            const initialProfile: Partial<UserProfile> = {
              id: firebaseUser.uid,
              uid: generateUID(),
              displayName: firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
              photoURL: firebaseUser.photoURL || "",
              phone: "",
              bio: "",
              gender: "",
              age: 0,
              isPublic: true,
              badge: (firebaseUser.email === "mf460854@gmail.com" || firebaseUser.email === "mdfaruq0194@gmail.com") 
                ? BadgeType.ADMIN : BadgeType.NORMAL,
              uidPrivacy: true,
              bannedUntil: null,
              isPermanentlyBanned: false,
              createdAt: serverTimestamp() as any,
              lastSeen: serverTimestamp() as any
            };
            await setDoc(profileRef, initialProfile as UserProfile);
          }
          setLoading(false);
        });
        return () => unsubscribeProfile();
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Track last seen
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        const profileRef = doc(db, "users", user.uid);
        setDoc(profileRef, { lastSeen: serverTimestamp() }, { merge: true });
      }, 60000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
