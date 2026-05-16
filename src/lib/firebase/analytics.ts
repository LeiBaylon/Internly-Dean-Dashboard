"use client";

import { getAnalytics, isSupported } from "firebase/analytics";
import type { Analytics } from "firebase/analytics";
import { firebaseApp } from "./client";

let analyticsPromise: Promise<Analytics | null> | null = null;

export function initAnalytics() {
  const app = firebaseApp;

  if (!app) {
    return Promise.resolve(null);
  }

  if (!analyticsPromise) {
    analyticsPromise = isSupported()
      .then((supported) => (supported ? getAnalytics(app) : null))
      .catch(() => null);
  }

  return analyticsPromise;
}
