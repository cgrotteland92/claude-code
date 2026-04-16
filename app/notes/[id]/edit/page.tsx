import { auth } from "@/lib/auth";
import { getNoteById } from "@/lib/notes";
import EditNoteForm from "@/components/EditNoteForm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

export default async function NoteEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const { id } = await params;
  const note = getNoteById(id, session.user.id);
  if (!note) notFound();

  const initialContent = JSON.parse(note.contentJson) as object;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/notes/${id}`}
          className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
        >
          ← Back to note
        </Link>
      </div>
      <EditNoteForm
        noteId={id}
        initialTitle={note.title}
        initialContent={initialContent}
        initialIsPublic={note.isPublic}
        initialSlug={note.publicSlug}
      />
    </main>
  );
}
