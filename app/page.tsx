import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-4">
        Rich-text notes, simply stored.
      </h1>
      <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-8">
        Create, edit, and share notes with a powerful rich-text editor.
      </p>
      <div className="flex justify-center gap-3">
        <Link
          href="/authenticate"
          className="rounded-lg bg-neutral-900 dark:bg-neutral-100 px-5 py-2.5 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
        >
          Get started
        </Link>
        <Link
          href="/authenticate"
          className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
