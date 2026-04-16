import { randomBytes } from "crypto";
import { get, query, run } from "@/lib/db";

export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

function rowToNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: row.is_public === 1,
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

export type NoteStub = { id: string; userId: string; title: string; updatedAt: string };

export function getNotesByUser(userId: string): NoteStub[] {
  return query<Pick<NoteRow, "id" | "user_id" | "title" | "updated_at">>(
    `SELECT id, user_id, title, updated_at FROM notes WHERE user_id = ? ORDER BY updated_at DESC`,
    [userId]
  ).map((r) => ({ id: r.id, userId: r.user_id, title: r.title, updatedAt: r.updated_at }));
}

export function getNoteById(id: string, userId: string): Note | undefined {
  const row = get<NoteRow>(
    `SELECT * FROM notes WHERE id = ? AND user_id = ?`,
    [id, userId]
  );
  return row ? rowToNote(row) : undefined;
}

export function updateNote(
  id: string,
  userId: string,
  data: { title?: string; contentJson?: string }
): Note | undefined {
  const fields: string[] = [];
  const values: unknown[] = [];

  if (data.title !== undefined) {
    fields.push("title = ?");
    values.push(data.title);
  }
  if (data.contentJson !== undefined) {
    fields.push("content_json = ?");
    values.push(data.contentJson);
  }
  if (fields.length === 0) return getNoteById(id, userId);

  fields.push("updated_at = datetime('now')");
  values.push(id, userId);

  run(`UPDATE notes SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`, values);
  return getNoteById(id, userId);
}

export function deleteNote(id: string, userId: string): void {
  run(`DELETE FROM notes WHERE id = ? AND user_id = ?`, [id, userId]);
}

export function setNotePublic(id: string, userId: string, isPublic: boolean): Note | undefined {
  if (isPublic) {
    const slug = randomBytes(12).toString("base64url");
    run(
      `UPDATE notes SET is_public = 1, public_slug = COALESCE(public_slug, ?), updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
      [slug, id, userId]
    );
  } else {
    run(
      `UPDATE notes SET is_public = 0, public_slug = NULL, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
  }
  return getNoteById(id, userId);
}

export function getNoteByPublicSlug(slug: string): Note | undefined {
  const row = get<NoteRow>(
    `SELECT * FROM notes WHERE public_slug = ? AND is_public = 1`,
    [slug]
  );
  return row ? rowToNote(row) : undefined;
}

export function createNote(
  userId: string,
  data: { title?: string; contentJson?: string } = {}
): Note {
  const id = crypto.randomUUID();
  const title = data.title ?? "Untitled note";
  const contentJson = data.contentJson ?? JSON.stringify(EMPTY_DOC);

  run(
    `INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)`,
    [id, userId, title, contentJson]
  );

  const row = get<NoteRow>(`SELECT * FROM notes WHERE id = ? AND user_id = ?`, [
    id,
    userId,
  ]);

  return rowToNote(row!);
}
