import Link from "next/link";

function DecorativeOrb() {
  return (
    <div className="relative flex items-center justify-center">
      <div
        className="h-28 w-28 md:h-36 md:w-36 rounded-full animate-orb-breathe"
        style={{
          background: "var(--gradient-orb-idle)",
          boxShadow: "0 0 40px 10px rgba(229, 57, 53, 0.25)",
        }}
      >
        <div
          className="absolute top-[15%] left-[20%] h-[30%] w-[30%] rounded-full opacity-40"
          style={{
            background: "radial-gradient(circle, rgba(255,255,255,0.8), transparent)",
          }}
        />
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
          <div className="md:col-span-3 space-y-6">
            <p className="font-bengali text-2xl font-bold text-primary-300 tracking-wide">
              ভাষাশিখি
            </p>
            <h1 className="font-bengali text-3xl md:text-5xl font-bold text-white leading-tight">
              কথা বলে
              <br />
              ভাষা শিখো
            </h1>
            <p className="text-lg md:text-xl text-primary-200 max-w-lg leading-relaxed">
              Learn Languages by Actually Talking
            </p>
            <p className="text-base text-primary-300/70 max-w-md leading-relaxed">
              7 practice modes, an AI tutor who listens and responds naturally,
              instant feedback on your mistakes, and no account needed.
            </p>
            <Link
              href="/practice"
              className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:-translate-y-0.5 active:scale-[0.98] min-h-[44px]"
              style={{ boxShadow: "0 4px 14px rgba(59,130,246,0.25)" }}
            >
              <span className="font-bengali">শুরু করো</span>
              <span className="text-white/50">|</span>
              <span>Start Now</span>
            </Link>
          </div>
          <div className="md:col-span-2 flex justify-center">
            <DecorativeOrb />
          </div>
        </div>
      </div>
    </section>
  );
}
