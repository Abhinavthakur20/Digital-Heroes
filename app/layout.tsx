import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import Image from "next/image";
import "./globals.css";
import { SiteNav } from "@/components/site-nav";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter"
});

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800", "900"]
});

export const metadata: Metadata = {
  title: "Digital Heroes — Golf Performance & Charity Draw Platform",
  description: "Executive golf performance tracking, verified charity contributions, and transparent monthly prize draws."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="font-sans antialiased text-slate-900 bg-canvas min-h-screen flex flex-col">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <footer className="mt-auto border-t border-white/[0.06] bg-obsidian-950 py-10 text-xs">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full overflow-hidden ring-1 ring-white/10 bg-white">
                  <Image src="/images/logo.jpg" alt="Digital Heroes" width={28} height={28} className="object-cover" />
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-white/90 text-sm leading-none">Digital Heroes</span>
                  <span className="text-[10px] font-medium text-slate-500 mt-0.5">Golf & Impact Platform</span>
                </div>
              </div>
              <p className="text-slate-500 text-center">
                © 2026 Digital Heroes. Performance metrics, transparent giving, and audited prize math.
              </p>
              <div className="flex items-center gap-4 font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-emerald-500/50" />
                  Audited Draw Engine
                </span>
                <span className="text-white/10">|</span>
                <span className="flex items-center gap-1.5">
                  <span className="h-1 w-1 rounded-full bg-gold/50" />
                  100% Impact Transparency
                </span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
