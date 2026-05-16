"use client";

import { useEffect } from "react";
import { initAnalytics } from "@/lib/firebase/analytics";

export default function FirebaseAnalytics() {
  useEffect(() => {
    initAnalytics().catch(() => null);
  }, []);

  return null;
}
