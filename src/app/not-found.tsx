import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">
          Page not found
        </h1>
        <p className="font-bengali text-stone-600 mb-4">
          এই পেজটা খুঁজে পাওয়া যায়নি
        </p>
        <Link
          href="/"
          className="rounded-lg bg-brand-600 px-6 py-2 text-white hover:bg-brand-700"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}
