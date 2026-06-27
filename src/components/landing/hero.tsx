"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const DEMO_MESSAGES = [
  { role: "tutor" as const, text: "হাই! আমি প্রিয়া। আজকে কী শিখবে?" },
  { role: "user" as const, text: "I want to practice English" },
  { role: "tutor" as const, text: "Sure! Let's start with introductions. Tell me your name?" },
];

function DemoOrb() {
  return (
    <div className="relative flex items-center justify-center">
      <div className="h-24 w-24 md:h-32 md:w-32 rounded-full animate-orb-breathe"
        style={{
          background: "radial-gradient(circle at 35% 35%, #A5B4FC, #6366F1)",
          boxShadow: "0 0 40px 10px rgba(99, 102, 241, 0.3)",
        }}
      />
    </div>
  );
}

function DemoBubble({ role, text, delay }: { role: "tutor" | "user"; text: string; delay: number }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(show);
  }, [delay]);

  if (!visible) return <div className="h-10" />;

  return (
    <div className={`flex ${role === "user" ? "justify-end" : "justify-start"} animate-hero-bubble-in`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          role === "user"
            ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-br-sm"
            : "bg-white/10 text-white/90 backdrop-blur-sm rounded-bl-sm"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

function DemoConversation() {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setCycle((c) => c + 1), 8000);
    return () => clearTimeout(timer);
  }, [cycle]);

  return (
    <div className="space-y-3" key={cycle}>
      {DEMO_MESSAGES.map((msg, i) => (
        <DemoBubble key={i} role={msg.role} text={msg.text} delay={i * 1500} />
      ))}
    </div>
  );
}

export function Hero() {
  return (
    <section
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* Gradient mesh overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.4) 0%, transparent 50%), radial-gradient(ellipse at 80% 20%, rgba(6, 182, 212, 0.3) 0%, transparent 50%), radial-gradient(ellipse at 60% 80%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 w-full">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-center">
          {/* Left side -- text + CTA */}
          <div className="md:col-span-3 space-y-6">
            <p className="font-bengali text-2xl font-bold gradient-text tracking-wide">
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
              className="inline-flex items-center gap-2 rounded-xl gradient-button px-8 py-4 text-lg font-semibold text-white transition-all hover:scale-[1.02] shadow-lg shadow-primary-500/25 min-h-[44px]"
            >
              <span className="font-bengali">শুরু করো</span>
              <span className="text-white/50">|</span>
              <span>Start Now</span>
            </Link>
          </div>

          {/* Right side -- demo conversation */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex justify-center">
              <DemoOrb />
            </div>
            <div className="rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 p-4 space-y-3">
              <DemoConversation />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
