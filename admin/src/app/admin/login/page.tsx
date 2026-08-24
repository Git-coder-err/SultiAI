"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/Toast";
import { sessionMock } from "@/lib/mock/session";

export default function AdminLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSignIn() {
    setBusy(true);
    setError("");
    try {
      await sessionMock.signIn();
      toast.push("success", "Signed in as Admin.");
      router.push("/admin");
    } catch (err: any) {
      setError(err?.message || "Failed to sign in. Make sure the server is running on port 3001.");
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-light to-surface px-4">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-sm">
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand to-brand-dark text-xl font-bold text-white">
            S
          </span>
          <h1 className="mt-5 text-xl font-bold text-ink">SultiAI Admin</h1>
          <p className="mt-1.5 text-sm text-ink-soft">Sign in to manage the platform.</p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-danger/20 bg-danger/5 p-3 text-center text-sm text-danger">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleSignIn}
          disabled={busy}
          className="mt-8 w-full rounded-xl bg-gradient-to-r from-brand to-brand-dark py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Signing in..." : "Sign in as Admin"}
        </button>

        <p className="mt-6 text-center text-xs leading-relaxed text-ink-faint">
          Automatically creates an admin account (admin@sultiai.com / admin123)
          if one doesn&apos;t exist. Requires the server to be running.
        </p>
      </div>
    </div>
  );
}
