"use client";

import Link from "next/link";
import { MagnifyingGlass } from "@phosphor-icons/react";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page-mesh px-4">
      <div className="rounded-2xl bg-white/70 backdrop-blur-xl border border-white/20 shadow-lg shadow-blue-500/[0.03] p-8 text-center">
        <MagnifyingGlass size={48} weight="duotone" className="text-primary-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-stone-900 mb-2">
          Page not found
        </h1>
        <p className="font-bengali text-stone-600 mb-4">
          এই পেজটা খুঁজে পাওয়া যায়নি
        </p>
        <Link
          href="/"
          className="btn-primary inline-block rounded-2xl bg-gradient-to-b from-primary-500 to-primary-600 px-6 py-2.5 min-h-[44px] text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
