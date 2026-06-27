import { Hero } from "@/components/landing/hero";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <footer className="bg-page-mesh py-10 text-center">
        <Link
          href="https://cognidrift.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-slate-400 hover:text-primary-600 transition-colors duration-200 tracking-[-0.03em]"
        >
          CogniDrift
        </Link>
      </footer>
    </main>
  );
}
