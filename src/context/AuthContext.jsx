import { createContext, useContext, useState, useEffect } from "react";
import { onAuthChange } from "@services/auth";
import { getUser } from "@services/firebase";
import { getDatabase, ref, set } from "firebase/database";
import { getApps } from "firebase/app";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase Auth user
  const [userData, setUserData] = useState(null); // Our DB user data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Try to load user data from our DB
        let data = await getUser(firebaseUser.uid);
        if (!data) {
          // First login - create user record
          await createUserWithId(firebaseUser.uid, {
            name: firebaseUser.displayName || "",
            email: firebaseUser.email || "",
          });
          data = await getUser(firebaseUser.uid);
        }
        setUserData(data);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const isLoggedIn = !!user;
  const isAdmin = user?.email?.toLowerCase() === "admin@edu-games.sa";

  return (
    <AuthContext.Provider value={{ user, userData, loading, isLoggedIn, isAdmin, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

// Helper to create user with specific ID (UID from auth)
async function createUserWithId(userId, userData) {
  try {
    const app = getApps()[0];
    if (!app) return;
    const db = getDatabase(app);
    await set(ref(db, `users/${userId}`), {
      profile: {
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        createdAt: new Date().toISOString(),
      },
      subscription: {
        plan: "trial",
        status: "active",
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  } catch (e) {
    console.warn("createUserWithId failed:", e);
  }
}
