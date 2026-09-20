"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Award, ChevronRight, LayoutDashboard, LogOut, Menu, ShieldCheck, User, X } from "lucide-react";
import type { Profile } from "@/lib/types";

export function SiteNavClient({ user }: { user: Profile | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const isAdmin = user?.role === "admin";

  const navLinks = [
    { href: "/charities", label: "Charities" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      <header
        className={`pointer-events-auto w-full max-w-5xl transition-all duration-500 ease-out rounded-full border ${
          scrolled
            ? "bg-obsidian-950/90 backdrop-blur-2xl border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4),0_1px_0_rgba(255,255,255,0.04)_inset]"
            : "bg-obsidian-950/60 backdrop-blur-xl border-white/[0.05] shadow-[0_4px_24px_rgba(0,0,0,0.2)]"
        }`}
      >
        <div className="flex items-center justify-between px-2 py-1.5 sm:px-4 sm:py-2">
          {/* Logo */}
          <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-full pl-1 pr-3 py-1 group transition-colors hover:bg-white/[0.04]">
            <span className="relative flex h-8 w-8 items-center justify-center rounded-full overflow-hidden ring-1 ring-white/10 transition-transform group-hover:scale-105 bg-white">
              <Image
                src="/images/logo.jpg"
                alt="Digital Heroes Logo"
                width={32}
                height={32}
                className="object-cover"
                priority
              />
            </span>
            <span className="hidden sm:block text-sm font-bold tracking-tight text-white leading-none">
              Digital Heroes
            </span>
          </Link>

          {/* Center nav pills */}
          <nav className="hidden items-center gap-0.5 rounded-full bg-white/[0.04] p-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`focus-ring relative rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-250 ${
                    isActive
                      ? "bg-white/[0.1] text-white shadow-[0_1px_3px_rgba(0,0,0,0.2),0_1px_0_rgba(255,255,255,0.06)_inset]"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className={`focus-ring flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-all duration-250 ${
                  pathname.startsWith("/admin")
                    ? "bg-forest/20 text-emerald-300 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
                    : "text-emerald-400/70 hover:text-emerald-300 hover:bg-forest/10"
                }`}
              >
                <ShieldCheck className="h-3 w-3" />
                Admin
              </Link>
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                {/* User pill - desktop */}
                <div className="hidden items-center gap-2.5 rounded-full bg-white/[0.04] pl-3 pr-1 py-1 sm:flex">
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-white leading-none">{user.fullName}</p>
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-semibold mt-0.5 ${
                        isAdmin ? "text-emerald-400" : "text-slate-400"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          isAdmin
                            ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                            : "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.4)]"
                        }`}
                      />
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="focus-ring flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.06] text-slate-400 hover:bg-white/[0.12] hover:text-white transition-all"
                    title="Logout"
                  >
                    <LogOut className="h-3 w-3" />
                  </button>
                </div>

                {/* Mobile user icon */}
                <Link
                  href="/dashboard"
                  className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] hover:text-white sm:hidden transition-colors"
                  title="Dashboard"
                >
                  <User className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  href="/login"
                  className="focus-ring rounded-full px-4 py-1.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="focus-ring group inline-flex items-center gap-1.5 rounded-full bg-emerald-400 hover:bg-emerald-300 px-4 py-2 text-xs font-bold text-obsidian-950 shadow-[0_0_20px_rgba(52,211,153,0.35)] transition-all duration-300 hover:scale-[1.02]"
                >
                  <Award className="h-3 w-3 text-obsidian-950" />
                  Join
                  <ChevronRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-full bg-white/[0.06] text-slate-300 hover:bg-white/[0.1] hover:text-white md:hidden transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown — positioned below capsule */}
      {mobileOpen && (
        <div className="pointer-events-auto fixed inset-x-4 top-[72px] z-40 rounded-2xl border border-white/[0.06] bg-obsidian-950/95 backdrop-blur-2xl shadow-[0_12px_48px_rgba(0,0,0,0.5)] md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="p-3 space-y-0.5">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-white/[0.08] text-white"
                      : "text-slate-400 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {link.href === "/charities" && <Award className="h-4 w-4" />}
                  {link.href === "/dashboard" && <LayoutDashboard className="h-4 w-4" />}
                  {link.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-emerald-400 hover:bg-forest/10 transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Console
              </Link>
            )}

            {!user && (
              <div className="border-t border-white/[0.06] pt-3 mt-2 space-y-2 px-1">
                <Link
                  href="/login"
                  className="block text-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/[0.06] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="block text-center rounded-xl bg-gradient-to-r from-forest to-forest-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-forest/20 transition-all"
                >
                  Join Platform
                </Link>
              </div>
            )}

            {user && (
              <div className="border-t border-white/[0.06] pt-3 mt-2 px-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-400 hover:bg-white/[0.04] hover:text-white transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
