#!/usr/bin/env node
/**
 * Creates the Super Admin account in Firebase Authentication.
 *
 *   npm run create-admin
 *
 * Reads from .env.local:
 *   NEXT_PUBLIC_FIREBASE_API_KEY  – Firebase web API key
 *   SUPER_ADMIN_EMAILS            – the FIRST email is used
 *   SUPER_ADMIN_PASSWORD          – the password to set
 *
 * Uses Firebase's public sign-up endpoint, so "Email/Password" must be enabled
 * (and new sign-ups allowed) in Firebase Console → Authentication when you run it.
 */
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnv(file) {
  const env = {};
  if (!existsSync(file)) return env;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return env;
}

const env = { ...loadEnv(resolve(".env.local")), ...process.env };
const apiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY;
const email = (env.SUPER_ADMIN_EMAILS || "").split(",")[0]?.trim();
const password = env.SUPER_ADMIN_PASSWORD;

if (!apiKey || !email || !password) {
  console.error("✖ Missing NEXT_PUBLIC_FIREBASE_API_KEY, SUPER_ADMIN_EMAILS or SUPER_ADMIN_PASSWORD in .env.local");
  process.exit(1);
}
if (password.length < 6) {
  console.error("✖ Firebase requires a password of at least 6 characters.");
  process.exit(1);
}

const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, returnSecureToken: false }),
});
const data = await res.json().catch(() => ({}));

if (res.ok) {
  console.log(`✔ Super Admin created: ${email}`);
  console.log("  Sign in at /admin/login with this email and the password from SUPER_ADMIN_PASSWORD.");
  process.exit(0);
}

const code = data?.error?.message || `HTTP ${res.status}`;
const help = {
  EMAIL_EXISTS:
    "This email already has an account. To change its password, use “Forgot password?” on /admin/login,\n  or Firebase Console → Authentication → Users → ⋮ → Reset password.",
  OPERATION_NOT_ALLOWED:
    "Email/Password sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method, then run this again.",
  ADMIN_ONLY_OPERATION:
    "New sign-ups are disabled for this project. Temporarily enable “Enable create (sign-up)” in\n  Firebase Console → Authentication → Settings → User actions, run this again, then disable it.",
};
console.error(`✖ Could not create the admin account: ${code}`);
const key = Object.keys(help).find((k) => code.startsWith(k));
if (key) console.error(`  ${help[key]}`);
process.exit(1);
