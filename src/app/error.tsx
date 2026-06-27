"use client";

import { WarningCircle } from "@phosphor-icons/react";

export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page-mesh px-4">
      <div className="rounded-2xl bg-white/50 backdrop-blur-xl border border-white/40 shadow-lg shadow-indigo-500/10 p-8 text-center">
        <WarningCircle size={48} weight="duotone" className="text-primary-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-stone-900 mb-2">
          Something went wrong
        </h1>
        <p className="font-bengali text-stone-600 mb-4">
          কিছু ভুল হয়েছে। আবার চেষ্টা করো।
        </p>
        <button
          onClick={reset}
          className="btn-primary rounded-2xl bg-gradient-to-b from-primary-500 to-primary-600 px-6 py-2.5 min-h-[44px] text-white transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.98]"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
