import { SignupForm } from "@/components/signup-form";
import { getCharities } from "@/lib/store";
import { HeartHandshake, Shield, Sparkles, Trophy } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SignupPage() {
  const charities = await getCharities();

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      {/* ─── Left Branding Panel ─── */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-obsidian-900 p-10 xl:p-14">
        {/* animated background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -left-24 h-[420px] w-[420px] rounded-full bg-forest/20 blur-[120px] animate-pulse" />
          <div className="absolute -bottom-32 -right-32 h-[360px] w-[360px] rounded-full bg-gold/10 blur-[100px] animate-pulse [animation-delay:2s]" />
          <svg
            className="absolute inset-0 h-full w-full opacity-[0.04]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="grid-signup" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid-signup)" />
          </svg>
        </div>

        {/* top logo */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-forest to-forest-600 shadow-glow">
              <span className="text-sm font-black text-white tracking-tight">DH</span>
            </div>
            <span className="text-lg font-bold text-white tracking-tight">Digital Heroes</span>
          </div>

          <h2 className="mt-8 text-2xl font-bold text-white leading-snug xl:text-3xl">
            Play golf.<br />
            Support causes.<br />
            Win prizes.
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            Join thousands of golfers who track their game, support charities they believe in, and
            enter monthly draws — all from a single subscription.
          </p>
        </div>

        {/* value props */}
        <div className="relative z-10 space-y-4">
          {[
            {
              icon: Trophy,
              title: "Monthly Prize Draws",
              desc: "Auto-entered every month with 3 prize tiers",
            },
            {
              icon: HeartHandshake,
              title: "Direct Charity Impact",
              desc: "Choose where your allocation goes — min 10%",
            },
            {
              icon: Sparkles,
              title: "Score-Weighted Tickets",
              desc: "Better scores = smarter number selection",
            },
          ].map((item) => (
            <div key={item.title} className="flex items-start gap-3">
              <div className="flex h-9 w-9 flex-none items-center justify-center rounded-xl bg-white/[0.06] border border-white/10">
                <item.icon className="h-4 w-4 text-emerald-300" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{item.title}</p>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* footer */}
        <div className="relative z-10 flex items-center gap-2 text-xs text-slate-500">
          <Shield className="h-3 w-3" />
          <span>Secure registration · Instant activation · Cancel anytime</span>
        </div>
      </div>

      {/* ─── Right Form Panel ─── */}
      <div className="flex items-start justify-center bg-canvas px-6 py-10 sm:px-12 lg:overflow-y-auto lg:py-12">
        <div className="w-full max-w-xl">
          {/* mobile-only logo */}
          <div className="flex items-center gap-3 lg:hidden mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-forest to-forest-600">
              <span className="text-xs font-black text-white">DH</span>
            </div>
            <span className="text-base font-bold text-slate-900">Digital Heroes</span>
          </div>

          {/* heading */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Create your account
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Choose your charity, pick a plan, and start making an impact today.
            </p>
          </div>

          <SignupForm charities={charities} />

          {/* footer link */}
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold text-forest hover:text-forest-700 transition-colors"
            >
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
