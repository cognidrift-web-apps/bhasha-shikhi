import Link from "next/link";

export function Hero() {
  return (
    <section
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 w-full">
        <div className="flex flex-col items-center text-center gap-8">
          <div className="space-y-4">
            <p className="font-bengali text-2xl font-semibold text-primary-200 tracking-[-0.05em]">
              ফেব্রুয়ারি
            </p>
            <h1 className="font-bengali text-3xl md:text-5xl font-semibold text-white leading-tight">
              কথা বলে
              <br />
              ভাষা শিখুন
            </h1>
            <p className="text-lg md:text-xl text-primary-200 max-w-lg mx-auto leading-relaxed tracking-[-0.03em]">
              Learn Languages by Actually Talking
            </p>
            <p className="text-base text-slate-300 max-w-md mx-auto leading-relaxed">
              7 practice modes, an AI tutor who listens and responds naturally,
              instant feedback on your mistakes, and no account needed.
            </p>
          </div>
          <Link
            href="/practice"
            className="btn-primary inline-flex flex-col items-center rounded-xl bg-gradient-to-b from-primary-500 to-primary-600 px-10 py-4 text-lg font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 min-h-[44px]"
          >
            <span className="font-bengali">শুরু করুন</span>
            <span className="text-white/50 text-xs">Start Now</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
