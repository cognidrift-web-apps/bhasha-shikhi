"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-2">
          Something went wrong
        </h1>
        <p className="font-bengali text-stone-600 mb-4">
          কিছু ভুল হয়েছে। আবার চেষ্টা করুন।
        </p>
        <button
          onClick={reset}
          className="rounded-lg bg-primary-500 px-6 py-2 text-white hover:bg-primary-600"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}
