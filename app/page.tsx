import Link from "next/link";

const features = [
  {
    title: "Rich-text editing",
    description: "Bold, italic, lists, headings — a real editor, not a textarea.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
      </svg>
    ),
  },
  {
    title: "Shareable links",
    description: "Toggle a public link for any note in one click.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    ),
  },
  {
    title: "Fast & private",
    description: "Stored locally on your server. No analytics, no ads, no tracking.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
      </svg>
    ),
  },
];

export default function LandingPage() {
  return (
    <main className="mx-auto max-w-4xl px-4">
      {/* Hero */}
      <section className="py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 px-3 py-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-8">
          <span className="size-1.5 rounded-full bg-emerald-400 inline-block" />
          Open source · Self-hostable
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-neutral-900 dark:text-white mb-5 leading-tight">
          Your notes,{" "}
          <span className="bg-gradient-to-r from-neutral-900 to-neutral-500 dark:from-white dark:to-neutral-400 bg-clip-text text-transparent">
            beautifully written.
          </span>
        </h1>
        <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-10 max-w-xl mx-auto">
          A focused note-taking app with a real rich-text editor, instant sharing, and zero distractions.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/authenticate"
            className="rounded-lg bg-neutral-900 dark:bg-neutral-100 px-5 py-2.5 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-300 transition-colors"
          >
            Get started free
          </Link>
          <Link
            href="/authenticate"
            className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-5 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-dashed border-neutral-200 dark:border-neutral-800 mb-16" />

      {/* Features */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-24">
        {features.map((f) => (
          <div
            key={f.title}
            className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 text-left"
          >
            <div className="mb-4 inline-flex size-10 items-center justify-center rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
              {f.icon}
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">{f.title}</h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">{f.description}</p>
          </div>
        ))}
      </section>

      {/* Footer strip */}
      <div className="border-t border-neutral-100 dark:border-neutral-900 py-6 text-center text-xs text-neutral-400 dark:text-neutral-600">
        Free. No tracking. Your notes, your way.
      </div>
    </main>
  );
}
