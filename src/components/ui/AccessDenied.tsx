"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase/auth";

export default function AccessDenied() {
  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
    }
  };

  return (
    <div className="mx-auto mt-20 max-w-xl rounded-2xl border border-rose-400/30 bg-rose-500/10 p-10 text-center">
      <h1 className="text-2xl font-semibold text-rose-100">
        Access restricted
      </h1>
      <p className="mt-3 text-sm text-rose-200">
        You do not have permission to view dean pages. Please sign in with a
        dean account.
      </p>
      <button
        type="button"
        onClick={handleSignOut}
        className="mt-6 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-soft transition hover:bg-primary/90"
      >
        Sign out and return to login
      </button>
    </div>
  );
}
