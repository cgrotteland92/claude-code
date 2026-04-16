"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NoteEditor from "@/components/NoteEditor";
import { EMPTY_DOC } from "@/lib/notes";

export default function NewNoteForm() {
  const router = useRouter();
  const [form, setForm] = useState<{ title: string; contentJson: object }>({
    title: "",
    contentJson: EMPTY_DOC,
  });
  const [status, setStatus] = useState<{ submitting: boolean; error: string | null }>({
    submitting: false,
    error: null,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus({ submitting: true, error: null });

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          contentJson: form.contentJson,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to create note.");
      }

      const note = await res.json();
      router.push(`/notes/${note.id}`);
    } catch (err) {
      setStatus({
        submitting: false,
        error: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label htmlFor="title" className="sr-only">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          placeholder="Untitled note"
          className="w-full rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-2.5 text-xl font-semibold text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:border-neutral-400 dark:focus:border-neutral-500 focus:outline-none"
        />
      </div>

      <NoteEditor onChange={(content) => setForm((f) => ({ ...f, contentJson: content }))} />

      {status.error && (
        <p role="alert" className="text-sm text-red-600">
          {status.error}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={status.submitting}
          className="rounded-lg bg-neutral-900 dark:bg-neutral-100 px-5 py-2.5 text-sm font-medium text-white dark:text-neutral-900 transition-colors hover:bg-neutral-700 dark:hover:bg-neutral-300 disabled:opacity-50"
        >
          {status.submitting ? "Saving…" : "Save note"}
        </button>
      </div>
    </form>
  );
}
