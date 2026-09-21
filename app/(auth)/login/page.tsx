"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Trophy,
  UserCheck,
  Zap,
} from "lucide-react";

/* ──────────────────── Animated background dots ──────────────────── */
function GridPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* floating orbs */}
      <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-forest/20 blur-[120px] animate-pulse" />
      <div className="absolute -bottom-32 -right-32 h-[360px] w-[360px] rounded-full bg-gold/10 blur-[100px] animate-pulse [animation-delay:2s]" />
      {/* subtle grid */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

/* ──────────────────── Floating stat badge ──────────────────── */
function FloatBadge({
  icon: Icon,
  label,
  value,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delay: string;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] backdrop-blur-md px-4 py-3 animate-float"
      style={{ animationDelay: delay }}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-forest/30">
        <Icon className="h-4 w-4 text-emerald-300" />
      </div>
      <div>
        <p className="text-[11px] text-slate-400">{label}</p>
        <p className="text-sm font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

/* ════════════════════ MAIN LOGIN FORM ════════════════════ */
function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("ava@example.com");
  const [password, setPassword] = useState("password123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    errorParam === "admin_required"
      ? "Administrator credentials are required to access that area."
      : errorParam === "login_required"
      ? "Please sign in to continue."
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
        body: JSON.stringify({ email: submitEmail, password: submitPassword }),
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
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      {/* ─── Left Branding Panel ─── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-obsidian-900 p-10 xl:p-14">
        <GridPattern />

        {/* top logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-forest to-forest-600 shadow-glow">
              <span className="text-sm font-black text-white tracking-tight">DH</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Digital Heroes</span>
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-slate-400">
            Golf performance meets transparent charity giving. Track rounds, enter monthly draws, and make an impact — all in one platform.
          </p>
        </div>

        {/* floating stat badges */}
        <div className="relative z-10 space-y-3">
          <FloatBadge icon={Trophy} label="Prize Pool This Month" value="$4,200+" delay="0s" />
          <FloatBadge icon={Zap} label="Active Subscribers" value="1,240" delay="1s" />
          <FloatBadge icon={ShieldCheck} label="Charities Supported" value="18 Partners" delay="2s" />
        </div>

        {/* bottom trust line */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
          <Lock className="h-3 w-3" />
          <span>Bank-grade encryption · PCI compliant · SOC 2 certified</span>
        </div>
      </div>

      {/* ─── Right Form Panel ─── */}
      <div className="flex items-center justify-center bg-canvas px-6 py-12 sm:px-12">
        <div className="w-full max-w-[420px] space-y-7">
          {/* mobile-only logo */}
          <div className="flex items-center gap-3 lg:hidden mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-forest to-forest-600">
              <span className="text-xs font-black text-white">DH</span>
            </div>
            <span className="text-base font-bold text-slate-900">Digital Heroes</span>
          </div>

          {/* heading */}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Welcome back
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Sign in to your account to continue
            </p>
          </div>

          {/* demo quick access */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-soft">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Quick Demo Access
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setEmail("ava@example.com");
                  setPassword("password123");
                  handleLogin("ava@example.com", "password123");
                }}
                className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition-all duration-200 hover:border-forest/30 hover:bg-forest-50 hover:shadow-soft disabled:opacity-50"
              >
                <UserCheck className="h-4 w-4 text-forest transition-transform duration-200 group-hover:scale-110" />
                <div className="text-left">
                  <span className="block text-xs font-bold">Ava</span>
                  <span className="block text-[10px] text-slate-400 font-normal">Subscriber</span>
                </div>
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setEmail("admin@example.com");
                  setPassword("password123");
                  handleLogin("admin@example.com", "password123");
                }}
                className="group flex items-center gap-2 rounded-xl bg-obsidian-900 px-3.5 py-2.5 text-xs font-semibold text-white transition-all duration-200 hover:bg-obsidian-800 hover:shadow-lg disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4 text-gold transition-transform duration-200 group-hover:scale-110" />
                <div className="text-left">
                  <span className="block text-xs font-bold">Morgan</span>
                  <span className="block text-[10px] text-slate-400 font-normal">Admin</span>
                </div>
              </button>
            </div>
          </div>

          {/* divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-canvas px-3 text-[11px] font-medium text-slate-400">
                or sign in with email
              </span>
            </div>
          </div>

          {/* error */}
          {error ? (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-medium text-rose-700">
              <AlertCircle className="h-4 w-4 flex-none mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>
          ) : null}

          {/* form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5" htmlFor="login-email">
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="premium-input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700" htmlFor="login-password">
                  Password
                </label>
                <span className="text-[11px] text-slate-400 select-none">Demo: password123</span>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="login-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="premium-input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full mt-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>

          {/* footer link */}
          <p className="text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <a
              href="/signup"
              className="font-semibold text-forest hover:text-forest-700 transition-colors"
            >
              Create free account
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-forest" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
