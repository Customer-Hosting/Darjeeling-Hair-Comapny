"use client";

import { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
  updatePassword,
  updateProfile,
} from "firebase/auth";
import { Eye, EyeOff, KeyRound, Loader2, Mail, Save, ShieldCheck, UserRound } from "lucide-react";
import { useAdmin } from "@/components/admin/AdminProvider";
import { initialsOf } from "@/components/admin/AccountMenu";
import { Field, PageTitle } from "@/components/admin/ui";
import { getFirebaseAuth } from "@/lib/firebase-client";
import { cn } from "@/lib/cn";

function authMessage(err: unknown): string {
  const code = String((err as { code?: string })?.code ?? "");
  if (code.includes("wrong-password") || code.includes("invalid-credential") || code.includes("invalid-login"))
    return "Your current password is incorrect.";
  if (code.includes("too-many-requests")) return "Too many attempts. Please wait a few minutes and try again.";
  if (code.includes("weak-password")) return "Firebase needs a password of at least 6 characters.";
  if (code.includes("requires-recent-login")) return "For security, please sign out and sign in again, then retry.";
  if (code.includes("network")) return "Network error — check your connection and try again.";
  return "Something went wrong. Please try again.";
}

function formatDate(v?: string) {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

export default function ProfileAdminPage() {
  const { user, toast, refreshUser } = useAdmin();
  const email = user?.email ?? "";
  const hasPassword = !!user?.providerData.some((p) => p.providerId === "password");

  // ── display name ──
  const [name, setName] = useState(user?.displayName ?? "");
  const [savingName, setSavingName] = useState(false);

  async function saveName(e: React.FormEvent) {
    e.preventDefault();
    const current = getFirebaseAuth().currentUser;
    if (!current) return;
    setSavingName(true);
    try {
      await updateProfile(current, { displayName: name.trim() || null });
      refreshUser();
      toast("Profile updated");
    } catch (err) {
      toast(authMessage(err), "error");
    } finally {
      setSavingName(false);
    }
  }

  // ── password ──
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [show, setShow] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

  const mismatch = confirmPw.length > 0 && confirmPw !== newPw;
  // No password rules — only require all fields filled and the confirmation to match.
  const canSubmit = !!currentPw && !!newPw && newPw === confirmPw;

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    if (!canSubmit) return setPwError(mismatch ? "The new passwords don't match." : "Please fill in all three password fields.");
    const current = getFirebaseAuth().currentUser;
    if (!current || !current.email) return setPwError("Your session has expired — please sign in again.");
    setSavingPw(true);
    try {
      // Firebase requires a fresh sign-in before sensitive changes
      await reauthenticateWithCredential(current, EmailAuthProvider.credential(current.email, currentPw));
      await updatePassword(current, newPw);
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
      toast("Password changed successfully");
    } catch (err) {
      setPwError(authMessage(err));
    } finally {
      setSavingPw(false);
    }
  }

  async function sendReset() {
    if (!email) return;
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
      toast(`Password reset link sent to ${email}`);
    } catch (err) {
      toast(authMessage(err), "error");
    }
  }

  const pwInput = (id: string, value: string, set: (v: string) => void, autoComplete: string, invalid = false) => (
    <div className="relative">
      <input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        className={cn("field !pr-12", invalid && "!border-blush/60")}
        value={value}
        onChange={(e) => set(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Hide passwords" : "Show passwords"}
        className="absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer p-1 text-white/45 hover:text-white"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );

  return (
    <>
      <PageTitle title="Profile" subtitle="Manage your Super Admin account and password." />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.25fr]">
        {/* ── Account ── */}
        <section className="h-fit rounded-3xl border border-white/10 bg-ink-2 p-6">
          <div className="flex items-center gap-4">
            <span className="grid size-16 shrink-0 place-items-center rounded-full bg-rose text-xl font-bold text-ink">
              {initialsOf(user?.displayName, email)}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-xl font-bold">{user?.displayName || "Super Admin"}</p>
              <p className="truncate text-sm text-white/55">{email}</p>
              <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald">
                <ShieldCheck className="size-3.5" /> Super Admin
              </p>
            </div>
          </div>

          <form onSubmit={saveName} className="mt-6 space-y-4 border-t border-white/10 pt-6">
            <Field label="Display name">
              <input className="field" maxLength={60} placeholder="e.g. Pranay Chettri" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Field label="Email (sign-in)">
              <div className="field flex items-center gap-2 !text-white/60">
                <Mail className="size-4 shrink-0" /> <span className="truncate">{email}</span>
              </div>
            </Field>
            <button type="submit" className="btn-primary" disabled={savingName || name.trim() === (user?.displayName ?? "")}>
              {savingName ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save profile
            </button>
          </form>

          <dl className="mt-6 grid gap-3 border-t border-white/10 pt-6 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-white/50">Last sign-in</dt>
              <dd className="text-right font-medium">{formatDate(user?.metadata.lastSignInTime)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/50">Account created</dt>
              <dd className="text-right font-medium">{formatDate(user?.metadata.creationTime)}</dd>
            </div>
          </dl>
        </section>

        {/* ── Change password ── */}
        <section className="rounded-3xl border border-white/10 bg-ink-2 p-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-full bg-rose/10 text-rose">
              <KeyRound className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-bold">Change password</h2>
              <p className="text-sm text-white/55">You&apos;ll stay signed in on this device.</p>
            </div>
          </div>

          {!hasPassword ? (
            <p className="mt-6 rounded-2xl bg-white/5 p-4 text-sm text-white/70">
              This account signs in with Google, so its password is managed by Google — there&apos;s nothing to change here.
            </p>
          ) : (
            <form onSubmit={changePassword} className="mt-6 space-y-4" noValidate>
              <Field label="Current password">{pwInput("pw-current", currentPw, setCurrentPw, "current-password")}</Field>
              <Field label="New password">{pwInput("pw-new", newPw, setNewPw, "new-password")}</Field>


              <Field label="Confirm new password">{pwInput("pw-confirm", confirmPw, setConfirmPw, "new-password", mismatch)}</Field>
              {mismatch && <p className="-mt-2 text-xs text-blush">Passwords don&apos;t match.</p>}

              {pwError && (
                <p role="alert" className="rounded-xl border border-blush/30 bg-blush/10 px-4 py-3 text-sm text-blush">
                  {pwError}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button type="button" onClick={sendReset} className="cursor-pointer text-sm text-white/55 underline-offset-4 hover:text-rose hover:underline">
                  Forgot your current password?
                </button>
                <button type="submit" className="btn-primary" disabled={savingPw || !canSubmit}>
                  {savingPw ? <Loader2 className="size-4 animate-spin" /> : <UserRound className="size-4" />} Update password
                </button>
              </div>
            </form>
          )}
        </section>
      </div>
    </>
  );
}
