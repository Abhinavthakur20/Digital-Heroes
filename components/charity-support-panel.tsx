"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { HeartHandshake, Sparkles } from "lucide-react";
import type { Charity } from "@/lib/types";

const IndependentDonationModal = dynamic(
  () => import("./independent-donation-modal").then((m) => m.IndependentDonationModal),
  { ssr: false }
);

export function CharitySupportPanel({ charity }: { charity: Charity }) {
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  return (
    <>
      <div className="rounded-2xl border border-slate-200/80 bg-white p-8 sm:p-10 shadow-soft flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 flex-none items-center justify-center rounded-xl bg-forest/10 text-forest">
            <HeartHandshake className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Support {charity.name}</h2>
            <p className="mt-1 max-w-xl text-xs sm:text-sm text-slate-600 leading-relaxed">
              Back this mission through your monthly membership draw allocation (10% to 60%), or make an independent one-time charitable gift directly.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDonateOpen(true)}
            className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-lg border-2 border-forest bg-white px-5 text-xs font-bold text-forest hover:bg-forest/5 transition-colors shadow-soft"
          >
            <Sparkles className="h-4 w-4" />
            <span>Independent Donation</span>
          </button>
          <Link
            href={`/signup?charityId=${charity.id}`}
            className="focus-ring inline-flex h-11 items-center justify-center rounded-lg bg-forest px-6 text-xs font-bold text-white hover:bg-forest-800 transition-colors shadow-soft"
          >
            Designate via Membership
          </Link>
        </div>
      </div>

      {isDonateOpen && (
        <IndependentDonationModal
          charity={charity}
          isOpen={isDonateOpen}
          onClose={() => setIsDonateOpen(false)}
        />
      )}
    </>
  );
}
