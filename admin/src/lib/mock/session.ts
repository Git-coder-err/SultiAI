import { useSyncExternalStore } from "react";

export interface AdminSession {
  id: string;
  name: string;
  email: string;
  provider: "google" | "email";
  role: string;
  avatar: string;
  signedInAt: string;
  token: string;
}

const SESSION_KEY = "sultiai_admin_session";
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

let currentSession: AdminSession | null = null;
let initialized = false;
const listeners = new Set<() => void>();

function readFromStorage(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

function ensureInit() {
  if (!initialized) {
    currentSession = readFromStorage();
    initialized = true;
  }
}

function subscribe(listener: () => void) {
  ensureInit();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  ensureInit();
  return currentSession;
}

function getServerSnapshot() {
  return null;
}

function commit(session: AdminSession | null) {
  currentSession = session;
  if (typeof window !== "undefined") {
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }
  listeners.forEach((l) => l());
}

export const sessionMock = {
  getSession(): AdminSession | null {
    ensureInit();
    return currentSession;
  },

  async signIn(): Promise<AdminSession> {
    // Use real backend auth
    const res = await fetch(`${API_BASE}/api/health`);
    const health = await res.json();

    // For now, use a hardcoded admin — in production, use proper login form
    // This creates a session with a real JWT
    const loginRes = await fetch(`${API_BASE}/api/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@sultiai.com",
        password: "admin123",
      }),
    });

    if (!loginRes.ok) {
      // Fallback: create the admin account if it doesn't exist
      const signupRes = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullname: "Admin",
          email: "admin@sultiai.com",
          password: "admin123",
        }),
      });

      if (!signupRes.ok) {
        throw new Error("Failed to create admin account");
      }

      const signupData = await signupRes.json();
      const data = signupData.data || signupRes.json;

      // Promote to admin
      await fetch(`${API_BASE}/api/auth/promote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.accessToken}`,
        },
        body: JSON.stringify({ email: "admin@sultiai.com" }),
      });

      const session: AdminSession = {
        id: String(data.user?.id ?? "1"),
        name: data.user?.fullname ?? "Admin",
        email: data.user?.email ?? "admin@sultiai.com",
        provider: "email",
        role: "admin",
        avatar: "A",
        signedInAt: new Date().toISOString(),
        token: data.accessToken,
      };
      commit(session);
      return session;
    }

    const signinData = await loginRes.json();
    const d = signinData.data || signinData;

    const session: AdminSession = {
      id: String(d.user?.id ?? "1"),
      name: d.user?.fullname ?? "Admin",
      email: d.user?.email ?? "admin@sultiai.com",
      provider: "email",
      role: "admin",
      avatar: "A",
      signedInAt: new Date().toISOString(),
      token: d.accessToken,
    };
    commit(session);
    return session;
  },

  async signOut(): Promise<void> {
    commit(null);
  },
};

export function useSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
