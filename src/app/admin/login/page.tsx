"use client";

import "../../(site)/site.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { useAdmin } from "@/components/admin/AdminProvider";
import { LogoBadge } from "@/components/site/LogoBadge";
import { getFirebaseAuth } from "@/lib/firebase-client";

function friendly(code: string) {
  if (code.includes("invalid-credential") || code.includes("wrong-password") || code.includes("user-not-found"))
    return "Incorrect email or password.";
  if (code.includes("too-many-requests")) return "Too many attempts. Please wait a minute and try again.";
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
    <div className="site grid min-h-dvh place-items-center bg-gradient-to-b from-sand to-[#efe6dd] px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-2xl border border-line bg-white p-8 shadow-soft md:p-10"
      >
        <div className="flex justify-center">
          <LogoBadge className="w-24" priority />
        </div>
        <h1 className="h-serif mt-6 text-center text-2xl">Welcome back</h1>
        <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm">
          <Lock className="size-3.5 text-accent" /> Super Admin sign in
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            run(() => signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password));
          }}
        >
          <div>
            <label htmlFor="email" className="s-label">Email</label>
            <input id="email" type="email" required autoComplete="username" placeholder="you@example.com" className="s-field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="pw" className="s-label">Password</label>
            <div className="relative">
              <input id="pw" type={show ? "text" : "password"} required autoComplete="current-password" className="s-field !pr-12" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Hide password" : "Show password"} className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1 text-body hover:text-accent">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {shownError && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{shownError}</p>}
          {info && <p className="rounded-lg border border-forest/20 bg-forest-soft px-4 py-3 text-sm text-forest">{info}</p>}

          <button type="submit" disabled={busy || status === "loading"} className="s-btn-accent w-full !py-3.5">
            {busy && <Loader2 className="size-4 animate-spin" />} Sign in
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between text-sm">
          <Link href="/" className="flex items-center gap-1 text-body hover:text-accent">
            <ArrowLeft className="size-3.5" /> Back to website
          </Link>
          <button
            type="button"
            className="cursor-pointer text-body hover:text-accent"
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
