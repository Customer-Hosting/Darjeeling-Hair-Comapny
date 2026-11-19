"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signOut as fbSignOut, type User } from "firebase/auth";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { getFirebaseAuth } from "@/lib/firebase-client";

type Status = "loading" | "signedOut" | "denied" | "admin";
type Toast = { id: number; type: "success" | "error"; msg: string };

type Ctx = {
  status: Status;
  user: User | null;
  dbConfigured: boolean;
  deniedReason: string | null;
  signOut: () => Promise<void>;
  /** Re-render consumers after the Firebase user object changes (e.g. display name update). */
  refreshUser: () => void;
  /** Bumps whenever the user profile is refreshed. */
  userVersion: number;
  /** fetch() with the admin's Firebase ID token attached; throws on error */
  api: <T = unknown>(url: string, init?: RequestInit) => Promise<T>;
  toast: (msg: string, type?: Toast["type"]) => void;
};

const AdminCtx = createContext<Ctx | null>(null);

export function useAdmin() {
  const c = useContext(AdminCtx);
  if (!c) throw new Error("useAdmin must be used inside <AdminProvider>");
  return c;
}

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [dbConfigured, setDbConfigured] = useState(true);
  const [deniedReason, setDeniedReason] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((msg: string, type: Toast["type"] = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, type, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  useEffect(() => {
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setUser(null);
        setStatus("signedOut");
        return;
      }
      setStatus("loading");
      try {
        const token = await u.getIdToken();
        const res = await fetch("/api/admin/me", { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) {
          setDeniedReason(`${u.email ?? "This account"} is not authorised as a Super Admin.`);
          await fbSignOut(auth);
          setStatus("denied");
          return;
        }
        const me = (await res.json()) as { dbConfigured: boolean };
        setDbConfigured(me.dbConfigured);
        setDeniedReason(null);
        setUser(u);
        setStatus("admin");
      } catch {
        setDeniedReason("Could not verify your account. Check your connection and try again.");
        setStatus("denied");
      }
    });
  }, []);

  const signOut = useCallback(async () => {
    await fbSignOut(getFirebaseAuth());
  }, []);

  const api = useCallback(async <T,>(url: string, init: RequestInit = {}): Promise<T> => {
    const current = getFirebaseAuth().currentUser;
    if (!current) throw new Error("Your session has expired — please sign in again.");
    const token = await current.getIdToken();
    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${token}`);
    if (init.body && typeof init.body === "string") headers.set("Content-Type", "application/json");
    const res = await fetch(url, { ...init, headers, cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
    return data as T;
  }, []);

  const [userVersion, setUserVersion] = useState(0);
  const refreshUser = useCallback(() => setUserVersion((v) => v + 1), []);

  const value = useMemo(
    () => ({ status, user, dbConfigured, deniedReason, signOut, api, toast, refreshUser, userVersion }),
    [status, user, dbConfigured, deniedReason, signOut, api, toast, refreshUser, userVersion],
  );

  return (
    <AdminCtx.Provider value={value}>
      {children}
      <div className="admin-theme pointer-events-none fixed right-4 bottom-4 !bg-transparent z-[100] flex w-[min(92vw,380px)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-white/10 bg-ink-3/95 px-4 py-3 text-sm shadow-2xl backdrop-blur"
              role="status"
            >
              {t.type === "success" ? (
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-champagne" />
              ) : (
                <XCircle className="mt-0.5 size-4 shrink-0 text-rose" />
              )}
              <span>{t.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </AdminCtx.Provider>
  );
}
