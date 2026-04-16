import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));
vi.mock("@/lib/notes", () => ({
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
}));
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

import { auth } from "@/lib/auth";
import { updateNote, deleteNote } from "@/lib/notes";
import { PUT, DELETE } from "@/app/api/notes/[id]/route";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockUpdateNote = vi.mocked(updateNote);
const mockDeleteNote = vi.mocked(deleteNote);

const fakeSession = { user: { id: "user-1" } };
const fakeNote = {
  id: "note-1",
  userId: "user-1",
  title: "Updated",
  contentJson: "{}",
  isPublic: false,
  publicSlug: null,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-02",
};

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("PUT /api/notes/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request("http://localhost/api/notes/note-1", {
      method: "PUT",
      body: JSON.stringify({ title: "x", contentJson: { type: "doc" } }),
    });
    const res = await PUT(req, makeParams("note-1"));
    expect(res.status).toBe(401);
  });

  it("returns 404 when note not found", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockUpdateNote.mockReturnValue(undefined);
    const req = new Request("http://localhost/api/notes/note-1", {
      method: "PUT",
      body: JSON.stringify({ title: "x", contentJson: { type: "doc" } }),
    });
    const res = await PUT(req, makeParams("note-1"));
    expect(res.status).toBe(404);
  });

  it("returns 200 with updated note on success", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockUpdateNote.mockReturnValue(fakeNote);
    const req = new Request("http://localhost/api/notes/note-1", {
      method: "PUT",
      body: JSON.stringify({ title: "Updated", contentJson: { type: "doc" } }),
    });
    const res = await PUT(req, makeParams("note-1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual(fakeNote);
  });

  it("passes undefined title when title is not a string", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockUpdateNote.mockReturnValue(fakeNote);
    const req = new Request("http://localhost/api/notes/note-1", {
      method: "PUT",
      body: JSON.stringify({ title: 42, contentJson: { type: "doc" } }),
    });
    await PUT(req, makeParams("note-1"));
    expect(mockUpdateNote).toHaveBeenCalledWith(
      "note-1",
      "user-1",
      expect.objectContaining({ title: undefined })
    );
  });

  it("passes undefined contentJson when it is an array", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockUpdateNote.mockReturnValue(fakeNote);
    const req = new Request("http://localhost/api/notes/note-1", {
      method: "PUT",
      body: JSON.stringify({ title: "x", contentJson: [] }),
    });
    await PUT(req, makeParams("note-1"));
    expect(mockUpdateNote).toHaveBeenCalledWith(
      "note-1",
      "user-1",
      expect.objectContaining({ contentJson: undefined })
    );
  });
});

describe("DELETE /api/notes/[id]", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const req = new Request("http://localhost/api/notes/note-1", { method: "DELETE" });
    const res = await DELETE(req, makeParams("note-1"));
    expect(res.status).toBe(401);
  });

  it("calls deleteNote with correct id and userId", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    const req = new Request("http://localhost/api/notes/note-1", { method: "DELETE" });
    await DELETE(req, makeParams("note-1"));
    expect(mockDeleteNote).toHaveBeenCalledWith("note-1", "user-1");
  });

  it("returns 204 with no body", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    const req = new Request("http://localhost/api/notes/note-1", { method: "DELETE" });
    const res = await DELETE(req, makeParams("note-1"));
    expect(res.status).toBe(204);
    expect(await res.text()).toBe("");
  });
});
