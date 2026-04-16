"use client";

import { useState, useTransition } from "react";

type Props = {
  noteId: string;
  initialIsPublic: boolean;
  initialSlug: string | null;
};

export default function ShareToggle({ noteId, initialIsPublic, initialSlug }: Props) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [slug, setSlug] = useState(initialSlug);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/notes/${noteId}/share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      if (res.ok) {
        const data = await res.json() as { isPublic: boolean; publicSlug: string | null };
        setIsPublic(data.isPublic);
        setSlug(data.publicSlug);
      } else {
        setError("Failed to update sharing. Please try again.");
      }
    });
  }

  function copyLink() {
    if (!slug) return;
    navigator.clipboard.writeText(`${window.location.origin}/p/${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isPublic}
          onClick={toggle}
          disabled={isPending}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
            isPublic
              ? "bg-neutral-900 dark:bg-neutral-100"
              : "bg-neutral-300 dark:bg-neutral-600"
          }`}
        >
          <span
            className={`inline-block h-3.5 w-3.5 rounded-full bg-white dark:bg-neutral-900 transition-transform ${
              isPublic ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <span className="text-sm text-neutral-700 dark:text-neutral-300">
          {isPublic ? "Public" : "Private"}
        </span>
      </div>
      {error && (
        <p role="alert" className="text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
      {isPublic && slug && (
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={`/p/${slug}`}
            className="flex-1 rounded border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2 py-1 text-xs font-mono text-neutral-600 dark:text-neutral-400"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <button
            type="button"
            onClick={copyLink}
            className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors whitespace-nowrap"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
