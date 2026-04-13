import { auth } from "@/lib/auth";
import { createNote } from "@/lib/notes";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const note = await createNote(session.user.id, {
    title: body.title,
    contentJson: body.contentJson,
  });

  return NextResponse.json(note, { status: 201 });
}
