"use client";

import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page-mesh px-4">
      <div className="glass-panel rounded-2xl p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-500 text-white mx-auto mb-4">
          <MagnifyingGlass size={24} weight="fill" />
        </div>
        <h1 className="text-2xl font-bold text-[#1E1B4B] mb-2">
          Page not found
        </h1>
        <p className="font-bengali text-slate-600 mb-4">
          এই পেজটা খুঁজে পাওয়া যাচ্ছে না
        </p>
        <Link
          href="/"
          className="btn-primary inline-block rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 px-6 py-2.5 min-h-[44px] text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          হোমে যান
        </Link>
      </div>
    </main>
  );
}
