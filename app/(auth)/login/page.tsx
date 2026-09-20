"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle, Loader2, LogIn, ShieldAlert, ShieldCheck, UserCheck } from "lucide-react";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("ava@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    errorParam === "admin_required"
      ? "Administrator credentials are required to access that area. Sign in as Admin below."
      : ""
  );

  async function handleLogin(targetEmail?: string, targetPassword?: string) {
    const submitEmail = targetEmail || email;
    const submitPassword = targetPassword || password;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: submitEmail, password: submitPassword })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(data.redirectTo || "/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-140px)] max-w-7xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        {/* Quick Demo Access Bar */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-soft">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            One-Click Demo Credentials
          </p>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setEmail("ava@example.com");
                setPassword("password123");
                handleLogin("ava@example.com", "password123");
              }}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/75 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 transition-colors"
            >
              <UserCheck className="h-3.5 w-3.5 text-forest" />
              <span>Ava (Subscriber)</span>
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={() => {
                setEmail("admin@example.com");
                setPassword("password123");
                handleLogin("admin@example.com", "password123");
              }}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-obsidian-900 px-3 py-2 text-xs font-semibold text-white hover:bg-obsidian-950 disabled:opacity-50 transition-colors"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-gold" />
              <span>Morgan (Admin)</span>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-card"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-forest text-white text-xs font-bold">
              DH
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Member Access</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            Sign In to Account
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Log in to manage golf rounds, audit charity splits, and view draw claims.
          </p>

          {error ? (
            <div className="mt-5 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
              <AlertCircle className="h-4 w-4 flex-none mt-0.5" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700" htmlFor="password">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Demo: password123</span>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-ring mt-1.5 w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="focus-ring mt-6 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-forest px-4 text-xs font-semibold text-white hover:bg-forest-800 disabled:opacity-50 transition-colors shadow-soft"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4 text-gold-light" />}
            Authenticate & Proceed
          </button>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <a
              href="/signup"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest hover:text-forest-800 transition-colors"
            >
              <span>Need a subscriber account? Select charity & register</span>
              <ArrowRight className="h-3 w-3" />
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs text-slate-400">Loading portal...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
