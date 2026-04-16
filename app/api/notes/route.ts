import { auth } from "@/lib/auth";
import { createNote } from "@/lib/notes";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const safeTitle =
    typeof title === "string" && title.trim().length > 0
      ? title.trim().slice(0, 500)
      : "Untitled note";

  if (typeof contentJson !== "object" || contentJson === null || Array.isArray(contentJson)) {
    return NextResponse.json({ error: "Invalid note content." }, { status: 400 });
  }

  try {
    const note = await createNote(session.user.id, {
      title: safeTitle,
      contentJson: JSON.stringify(contentJson),
    });
    return NextResponse.json(note, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to save note. Please try again." },
      { status: 500 },
    );
  }
}
