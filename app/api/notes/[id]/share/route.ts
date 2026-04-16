import { auth } from "@/lib/auth";
import { setNotePublic } from "@/lib/notes";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { isPublic } = body as Record<string, unknown>;
  if (typeof isPublic !== "boolean") {
    return NextResponse.json({ error: "isPublic must be a boolean." }, { status: 400 });
  }

  const { id } = await params;
  const note = setNotePublic(id, session.user.id, isPublic);
  if (!note) return NextResponse.json({ error: "Note not found." }, { status: 404 });

  return NextResponse.json({ id: note.id, isPublic: note.isPublic, publicSlug: note.publicSlug });
}
