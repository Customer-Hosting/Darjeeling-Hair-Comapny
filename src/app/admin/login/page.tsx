"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import {
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useAdmin } from "@/components/admin/AdminProvider";
import { BrandLogo } from "@/components/site/BrandLogo";
import { getFirebaseAuth } from "@/lib/firebase-client";

function friendly(code: string) {
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found"))
    return "Incorrect email or password.";
  if (code.includes("too-many-requests")) return "Too many attempts. Please wait a minute and try again.";
  if (code.includes("popup-closed")) return "Google sign-in was cancelled.";
  if (code.includes("network")) return "Network error — check your connection.";
  return "Sign-in failed. Please try again.";
}

export default function AdminLoginPage() {
  const { status, deniedReason } = useAdmin();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (status === "admin") router.replace("/admin");
  }, [status, router]);

  const shownError = error ?? (status === "denied" ? deniedReason : null);

  async function run(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await fn();
    } catch (e) {
      setError(friendly(String((e as { code?: string }).code ?? e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="brick-bg relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-rose/50 neon-ring-rose" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 size-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald/40 neon-ring-emerald" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md rounded-[2rem] border border-white/10 bg-ink-2/90 p-8 shadow-2xl backdrop-blur-xl md:p-10"
      >
        <div className="flex justify-center">
          <BrandLogo size="md" glow />
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 text-xs font-semibold tracking-[0.25em] text-white/50 uppercase">
          <Lock className="size-3.5" /> Super Admin
        </div>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password));
          }}
        >
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input id="email" type="email" required autoComplete="username" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="pw" className="label">Password</label>
            <div className="relative">
              <input id="pw" type={show ? "text" : "password"} required autoComplete="current-password" className="field pr-12" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-white/50 hover:text-white">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {shownError && <p role="alert" className="rounded-xl border border-rose/30 bg-rose/10 px-4 py-3 text-sm text-rose-soft">{shownError}</p>}
          {info && <p className="rounded-xl border border-champagne/30 bg-champagne/10 px-4 py-3 text-sm text-champagne">{info}</p>}

          <button type="submit" disabled={busy || status === "loading"} className="btn-primary w-full !py-3.5">
            {busy && <Loader2 className="size-4 animate-spin" />} Sign in
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-white/30">
          <span className="h-px flex-1 bg-white/10" /> or <span className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => run(() => signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider()))}
          className="btn-ghost w-full !py-3.5"
        >
          <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
            <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.9 3.1 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12Z" />
          </svg>
          Continue with Google
        </button>

        <div className="mt-6 flex items-center justify-between text-xs">
          <Link href="/" className="flex items-center gap-1 text-white/45 hover:text-white">
            <ArrowLeft className="size-3" /> Back to website
          </Link>
          <button
            type="button"
            className="cursor-pointer text-white/45 hover:text-white"
            onClick={() => {
              if (!email) return setError("Enter your email above first.");
              run(async () => {
                await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
                setInfo("If that account exists, a reset link is on its way.");
              });
            }}
          >
            Forgot password?
          </button>
        </div>
      </motion.div>
    </div>
  );
}
