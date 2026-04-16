import { auth } from "@/lib/auth";
import { getNotesByUser } from "@/lib/notes";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const notes = getNotesByUser(session.user.id);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My notes</h1>
        <Link
          href="/notes/new"
          className="rounded-lg bg-neutral-900 dark:bg-neutral-100 px-4 py-2 text-sm font-medium text-white dark:text-neutral-900 transition-colors hover:bg-neutral-700 dark:hover:bg-neutral-300"
        >
          New note
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700 p-12 text-center">
          <p className="text-neutral-500 dark:text-neutral-400 mb-4">No notes yet.</p>
          <Link
            href="/notes/new"
            className="text-sm font-medium text-neutral-900 dark:text-white underline underline-offset-2"
          >
            Create your first note
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="group rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-4 transition-colors hover:border-neutral-400 dark:hover:border-neutral-500"
            >
              <p className="font-medium text-neutral-900 dark:text-white truncate mb-1">
                {note.title}
              </p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-neutral-400 dark:text-neutral-500">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
                {note.isPublic && (
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Public
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
