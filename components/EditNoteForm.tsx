"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import NoteEditor from "@/components/NoteEditor";
import ShareToggle from "@/components/ShareToggle";

type Props = {
  noteId: string;
  initialTitle: string;
  initialContent: object;
  initialIsPublic: boolean;
  initialSlug: string | null;
};

export default function EditNoteForm({ noteId, initialTitle, initialContent, initialIsPublic, initialSlug }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [contentJson, setContentJson] = useState<object>(initialContent);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, contentJson }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Failed to save.");
        return;
      }

      router.push(`/notes/${noteId}`);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label htmlFor="title" className="sr-only">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled note"
          className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-xl font-semibold text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <NoteEditor initialContent={initialContent} onChange={setContentJson} />

      <ShareToggle noteId={noteId} initialIsPublic={initialIsPublic} initialSlug={initialSlug} />

      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => router.push(`/notes/${noteId}`)}
          className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-neutral-900 dark:bg-neutral-100 px-5 py-2 text-sm font-medium text-white dark:text-neutral-900 hover:bg-neutral-700 dark:hover:bg-neutral-300 disabled:opacity-50 transition-colors"
        >
          {isPending ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
