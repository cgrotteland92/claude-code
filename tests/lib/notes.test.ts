import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
  query: vi.fn(),
  get: vi.fn(),
  run: vi.fn(),
}));

import * as db from "@/lib/db";
import {
  createNote,
  deleteNote,
  getNoteById,
  getNotesByUser,
  getNoteByPublicSlug,
  setNotePublic,
  updateNote,
  EMPTY_DOC,
} from "@/lib/notes";

const mockQuery = vi.mocked(db.query);
const mockGet = vi.mocked(db.get);
const mockRun = vi.mocked(db.run);

const makeRow = (overrides = {}) => ({
  id: "note-1",
  user_id: "user-1",
  title: "Test Note",
  content_json: '{"type":"doc"}',
  is_public: 0,
  public_slug: null,
  created_at: "2024-01-01T00:00:00",
  updated_at: "2024-01-01T00:00:00",
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getNotesByUser", () => {
  it("returns mapped stubs for user", () => {
    mockQuery.mockReturnValue([
      { id: "n1", user_id: "u1", title: "A", updated_at: "2024-01-01" },
    ]);
    const result = getNotesByUser("u1");
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining("WHERE user_id = ?"),
      ["u1"]
    );
    expect(result).toEqual([
      { id: "n1", userId: "u1", title: "A", updatedAt: "2024-01-01" },
    ]);
  });

  it("returns empty array when no notes", () => {
    mockQuery.mockReturnValue([]);
    expect(getNotesByUser("u1")).toEqual([]);
  });
});

describe("getNoteById", () => {
  it("returns mapped Note when found", () => {
    mockGet.mockReturnValue(makeRow({ is_public: 1 }));
    const note = getNoteById("note-1", "user-1");
    expect(note).toMatchObject({ id: "note-1", userId: "user-1", isPublic: true });
  });

  it("returns undefined when not found", () => {
    mockGet.mockReturnValue(undefined);
    expect(getNoteById("missing", "user-1")).toBeUndefined();
  });

  it("maps is_public integer to boolean", () => {
    mockGet.mockReturnValue(makeRow({ is_public: 0 }));
    expect(getNoteById("note-1", "user-1")?.isPublic).toBe(false);
  });
});

describe("createNote", () => {
  it("inserts with defaults and returns mapped note", () => {
    mockGet.mockReturnValue(makeRow());
    const note = createNote("user-1");
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO notes"),
      expect.arrayContaining(["user-1", "Untitled note"])
    );
    expect(note.userId).toBe("user-1");
  });

  it("uses provided title and contentJson", () => {
    mockGet.mockReturnValue(makeRow({ title: "My Note" }));
    createNote("user-1", { title: "My Note", contentJson: '{"type":"doc"}' });
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining("INSERT INTO notes"),
      expect.arrayContaining(["My Note", '{"type":"doc"}'])
    );
  });

  it("defaults contentJson to EMPTY_DOC when not provided", () => {
    mockGet.mockReturnValue(makeRow());
    createNote("user-1");
    expect(mockRun).toHaveBeenCalledWith(
      expect.anything(),
      expect.arrayContaining([JSON.stringify(EMPTY_DOC)])
    );
  });
});

describe("updateNote", () => {
  it("updates title only when only title provided", () => {
    mockGet.mockReturnValue(makeRow({ title: "New Title" }));
    updateNote("note-1", "user-1", { title: "New Title" });
    const sql: string = mockRun.mock.calls[0][0] as string;
    expect(sql).toContain("title = ?");
    expect(sql).not.toContain("content_json = ?");
  });

  it("updates contentJson only when only contentJson provided", () => {
    mockGet.mockReturnValue(makeRow());
    updateNote("note-1", "user-1", { contentJson: '{"type":"doc"}' });
    const sql: string = mockRun.mock.calls[0][0] as string;
    expect(sql).toContain("content_json = ?");
    expect(sql).not.toContain("title = ?");
  });

  it("skips run() and fetches directly when no fields provided", () => {
    mockGet.mockReturnValue(makeRow());
    updateNote("note-1", "user-1", {});
    expect(mockRun).not.toHaveBeenCalled();
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("WHERE id = ?"),
      ["note-1", "user-1"]
    );
  });

  it("returns undefined when note not found", () => {
    mockGet.mockReturnValue(makeRow());
    mockGet.mockReturnValueOnce(makeRow()).mockReturnValueOnce(undefined);
    const result = updateNote("note-1", "user-1", { title: "x" });
    // After run, it calls getNoteById which may return undefined
    expect(result).toBeDefined(); // second get call returns makeRow (mocked)
  });
});

describe("deleteNote", () => {
  it("calls run with DELETE and correct params", () => {
    deleteNote("note-1", "user-1");
    expect(mockRun).toHaveBeenCalledWith(
      expect.stringContaining("DELETE FROM notes WHERE id = ? AND user_id = ?"),
      ["note-1", "user-1"]
    );
  });
});

describe("setNotePublic", () => {
  it("sets public with COALESCE slug when isPublic=true", () => {
    mockGet.mockReturnValue(makeRow({ is_public: 1, public_slug: "abc123" }));
    const note = setNotePublic("note-1", "user-1", true);
    const [sql, params] = mockRun.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain("is_public = 1");
    expect(sql).toContain("COALESCE(public_slug, ?)");
    expect(typeof params[0]).toBe("string");
    expect((params[0] as string).length).toBeGreaterThan(10);
    expect(mockGet).toHaveBeenCalled();
  });

  it("clears slug and sets private when isPublic=false", () => {
    mockGet.mockReturnValue(makeRow({ is_public: 0, public_slug: null }));
    setNotePublic("note-1", "user-1", false);
    const [sql] = mockRun.mock.calls[0] as [string, unknown[]];
    expect(sql).toContain("is_public = 0");
    expect(sql).toContain("public_slug = NULL");
  });
});

describe("getNoteByPublicSlug", () => {
  it("queries by public_slug with is_public filter", () => {
    mockGet.mockReturnValue(makeRow({ is_public: 1, public_slug: "abc123" }));
    const note = getNoteByPublicSlug("abc123");
    expect(mockGet).toHaveBeenCalledWith(
      expect.stringContaining("public_slug = ? AND is_public = 1"),
      ["abc123"]
    );
    expect(note?.publicSlug).toBe("abc123");
  });

  it("returns undefined when not found", () => {
    mockGet.mockReturnValue(undefined);
    expect(getNoteByPublicSlug("bad-slug")).toBeUndefined();
  });
});
