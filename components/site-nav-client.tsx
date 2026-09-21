"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { Award, ChevronRight, LayoutDashboard, LogOut, Menu, ShieldCheck, User, X } from "lucide-react";
import type { Profile } from "@/lib/types";

export function SiteNavClient({ user }: { user: Profile | null }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

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
    <>
      <div className="fixed top-0 left-0 right-0 z-50 border-b border-stone-200 bg-[#faf9f6] shadow-sm">
        <header
          className="mx-auto w-full max-w-7xl"
        >
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link
            href="/"
            className="focus-ring flex items-center gap-2.5 rounded-lg py-1 pr-2 group transition-colors hover:bg-stone-900/[0.04]"
          >
            <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-md ring-1 ring-stone-900/10 transition-transform group-hover:scale-105 bg-white shadow-sm">
              <Image
                src="/images/logo.jpg"
                alt="Digital Heroes Logo"
                width={32}
                height={32}
                className="object-cover"
                priority
              />
            </span>
            <span className="hidden sm:block text-sm font-bold tracking-tight text-stone-900 leading-none">
              Digital Heroes
            </span>
          </Link>

          {/* Center nav pills */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`focus-ring relative rounded-md px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-stone-900 text-white"
                      : "text-stone-600 hover:text-stone-900 hover:bg-stone-900/[0.04]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {isAdmin && (
              <Link
                href="/admin"
                className={`focus-ring flex items-center gap-1.5 rounded-md px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                  pathname.startsWith("/admin")
                    ? "bg-emerald-700 text-white"
                    : "text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100/60"
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
                <div className="hidden items-center gap-2.5 rounded-md bg-stone-900/[0.05] py-1 pl-3 pr-1 sm:flex ring-1 ring-stone-900/[0.05]">
                  <div className="text-right">
                    <p className="text-[11px] font-bold text-stone-900 leading-none">{user.fullName}</p>
                    <span
                      className={`inline-flex items-center gap-1 text-[9px] font-semibold mt-0.5 ${
                        isAdmin ? "text-emerald-700" : "text-stone-500"
                      }`}
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
                      <span className="capitalize">{user.role}</span>
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="focus-ring flex h-7 w-7 items-center justify-center rounded-md bg-stone-900/[0.06] text-stone-600 hover:bg-stone-900/[0.12] hover:text-stone-900 transition-all"
                    title="Logout"
                  >
                    <LogOut className="h-3 w-3" />
                  </button>
                </div>

                {/* Mobile user icon */}
                <Link
                  href="/dashboard"
                  className="focus-ring flex h-8 w-8 items-center justify-center rounded-md bg-stone-900/[0.06] text-stone-700 hover:bg-stone-900/[0.1] hover:text-stone-900 sm:hidden transition-colors"
                  title="Dashboard"
                >
                  <User className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  href="/login"
                  className="focus-ring rounded-md px-4 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-stone-900/[0.05] transition-all"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="focus-ring group inline-flex items-center gap-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all duration-200"
                >
                  <Award className="h-3 w-3 text-white" />
                  Join
                  <ChevronRight className="h-3 w-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                </Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="focus-ring flex h-8 w-8 items-center justify-center rounded-md bg-stone-900/[0.06] text-stone-700 hover:bg-stone-900/[0.1] hover:text-stone-900 md:hidden transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-3.5 w-3.5" /> : <Menu className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile dropdown — positioned below capsule */}
      {mobileOpen && (
        <div className="fixed inset-x-4 top-[72px] z-40 rounded-md border border-stone-200 bg-[#faf9f6] shadow-lg md:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="p-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-stone-900 text-white"
                      : "text-stone-700 hover:bg-stone-900/[0.05] hover:text-stone-900"
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
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-emerald-800 hover:bg-emerald-100/60 transition-colors"
              >
                <ShieldCheck className="h-4 w-4" />
                Admin Console
              </Link>
            )}

            {!user && (
              <div className="border-t border-stone-200/80 pt-3 mt-2 space-y-2 px-1">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-800 hover:bg-stone-50 transition-colors shadow-sm"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="block text-center rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-600/20 transition-all"
                >
                  Join Platform
                </Link>
              </div>
            )}

            {user && (
              <div className="border-t border-stone-200/80 pt-3 mt-2 px-1">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleLogout();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-stone-900/[0.05] hover:text-stone-900 transition-colors"
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
    </>
  );
}
