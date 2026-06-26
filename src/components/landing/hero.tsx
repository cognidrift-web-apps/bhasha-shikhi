import Link from "next/link";

export function Hero() {
  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-bengali text-lg font-semibold text-brand-600 mb-2 tracking-wide">
        ভাষাশিখি
      </p>
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-stone-900 max-w-3xl">
        Learn Languages by Actually Talking
      </h1>
      <p className="mt-6 text-xl md:text-2xl font-bengali text-stone-700 max-w-2xl leading-relaxed">
        কথা বলে বলে ইংলিশ, জার্মান, আরবি বা হিন্দি শিখুন
      </p>
      <p className="mt-3 text-base text-stone-500 max-w-xl leading-relaxed">
        7 practice modes, an AI tutor who listens and responds naturally, instant
        feedback on your mistakes, and no account needed to get started.
      </p>
      <Link
        href="/practice"
        className="mt-10 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-brand-700 active:bg-brand-800 min-h-[44px]"
      >
        <span className="font-bengali">শুরু করুন</span>
        <span className="text-brand-200">|</span>
        <span>Start Now</span>
      </Link>
    </section>
  );
}
