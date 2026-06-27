import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <footer className="bg-page-mesh py-8 text-center text-sm text-stone-400">
        February
      </footer>
    </main>
  );
}
