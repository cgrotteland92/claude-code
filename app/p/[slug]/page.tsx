import { getNoteByPublicSlug } from "@/lib/notes";
import NoteRenderer from "@/components/NoteRenderer";
import { notFound } from "next/navigation";

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNoteByPublicSlug(slug);
  if (!note) notFound();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-8">
        {note.title}
      </h1>
      <NoteRenderer content={note.contentJson} />
    </main>
  );
}
