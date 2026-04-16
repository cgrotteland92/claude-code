import { auth } from "@/lib/auth";
import { deleteNote, updateNote } from "@/lib/notes";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { title, contentJson } = body as Record<string, unknown>;
  const { id } = await params;

  const safeTitle =
    typeof title === "string" && title.trim().length > 0
      ? title.trim().slice(0, 500)
      : undefined;

  const safeContentJson =
    typeof contentJson === "object" && contentJson !== null && !Array.isArray(contentJson)
      ? JSON.stringify(contentJson)
      : undefined;

  const note = updateNote(id, session.user.id, {
    title: safeTitle,
    contentJson: safeContentJson,
  });

  if (!note) return NextResponse.json({ error: "Note not found." }, { status: 404 });
  return NextResponse.json(note);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  deleteNote(id, session.user.id);
  return new NextResponse(null, { status: 204 });
}
