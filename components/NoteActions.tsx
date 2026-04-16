"use client";

import Link from "next/link";
import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

export default function NoteActions({ noteId }: { noteId: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function confirmDelete() {
    startTransition(async () => {
      await fetch(`/api/notes/${noteId}`, { method: "DELETE" });
      router.push("/dashboard");
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Link
          href={`/notes/${noteId}/edit`}
          className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-3 py-1.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500 transition-colors"
        >
          Edit
        </Link>
        <button
          onClick={() => dialogRef.current?.showModal()}
          className="rounded-lg border border-red-200 dark:border-red-900 px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:border-red-400 dark:hover:border-red-600 transition-colors"
        >
          Delete
        </button>
      </div>

      <dialog
        ref={dialogRef}
        className="m-auto rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-6 shadow-xl backdrop:bg-black/40 w-full max-w-sm"
      >
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white mb-2">
          Delete note?
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
          This cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => dialogRef.current?.close()}
            className="rounded-lg border border-neutral-200 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:border-neutral-400 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={confirmDelete}
            disabled={isPending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {isPending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </dialog>
    </>
  );
}
