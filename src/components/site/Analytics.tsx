"use client";

import { useEffect } from "react";

/** Loads Firebase Analytics in the browser only (if supported & configured). */
export function Analytics() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) return;
    let cancelled = false;
    (async () => {
      const [{ getAnalytics, isSupported }, { getFirebaseApp }] = await Promise.all([
        import("firebase/analytics"),
        import("@/lib/firebase-client"),
      ]);
      if (!cancelled && (await isSupported())) getAnalytics(getFirebaseApp());
    })().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}
