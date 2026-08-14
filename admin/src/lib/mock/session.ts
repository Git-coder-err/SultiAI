import { useSyncExternalStore } from "react";
import type { AdminSession } from "@/types";

const SESSION_KEY = "sultiai_admin_session";

const mockAccount: AdminSession = {
  id: "1",
  name: "Genesis Diaz",
  email: "genesis@sultiai.com",
  provider: "google",
  role: "admin",
  avatar: "GD",
  signedInAt: new Date().toISOString(),
};

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

function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const sessionMock = {
  getSession(): AdminSession | null {
    ensureInit();
    return currentSession;
  },

  async signIn(): Promise<AdminSession> {
    await delay();
    commit(mockAccount);
    return mockAccount;
  },

  async signOut(): Promise<void> {
    await delay(200);
    commit(null);
  },
};

export function useSession() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}