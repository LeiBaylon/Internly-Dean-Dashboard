"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/auth";

export default function SignInCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!auth) {
      setError("Firebase is not configured.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setPassword("");
    } catch {
      setError("Sign-in failed. Check your credentials and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#121417] px-5 py-8 text-ink">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(54,224,173,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(54,224,173,0.035)_1px,transparent_1px)] bg-size-[64px_64px]" />
      <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_50%_0%,rgba(18,201,147,0.18),transparent_42rem)]" />
      <div className="absolute bottom-0 right-0 h-80 w-1/2 bg-[radial-gradient(circle_at_70%_80%,rgba(18,201,147,0.1),transparent_30rem)]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-stroke bg-[#17191e]/95 shadow-[0_30px_90px_rgba(0,0,0,0.35)] lg:grid-cols-[0.9fr_1fr]">
        <section className="relative min-h-90 overflow-hidden border-b border-stroke bg-[#15171b] p-8 sm:p-10 lg:min-h-125 lg:border-b-0 lg:border-r">
          <div className="absolute -left-28 -top-32 h-80 w-80 rounded-full bg-primary/18 blur-2xl" />
          <div className="absolute bottom-0 right-0 h-64 w-64 translate-x-20 translate-y-20 rounded-full bg-primary/10 blur-2xl" />
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-accent to-transparent" />

          <div className="relative flex h-full flex-col justify-between">
            <div>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-linear-to-br from-[#35e0ad] to-[#08a978] text-2xl font-bold text-white shadow-soft">
                I
              </div>
              <p className="mt-8 text-xs font-bold uppercase tracking-[0.3em] text-primary">
                Internly
              </p>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-ink sm:text-5xl">
                Dean Portal
              </h1>
            </div>

            <div>
              <div className="mb-6 h-px w-24 bg-primary/60" />
              <p className="max-w-md text-sm font-semibold uppercase tracking-[0.22em] text-ink-soft">
                OJT Monitoring and Training Management
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-90 items-center bg-[#17191e] p-8 sm:p-10 lg:min-h-125">
          <div className="mx-auto w-full max-w-sm">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary">
                Secure Access
              </p>
              <h2 className="mt-3 text-3xl font-bold text-ink">Sign in</h2>
              <p className="mt-2 text-sm text-slate-500">
                Access your Internly dean account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-400">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  className="h-12 rounded-lg border border-stroke bg-[#f0f5ff] px-4 text-base text-[#111318] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-semibold text-slate-400">
                Password
                <span className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    className="h-12 w-full rounded-lg border border-stroke bg-[#f0f5ff] px-4 pr-14 text-base text-[#111318] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-bold uppercase tracking-wide text-slate-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "View"}
                  </button>
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="flex items-center gap-3 text-slate-500">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-4 w-4 rounded border border-stroke bg-transparent accent-primary"
                  />
                  Remember me
                </label>
              </div>

              {error ? (
                <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-lg bg-primary px-5 text-base font-bold text-white shadow-soft transition hover:bg-primary/90 disabled:opacity-60"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
