import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));
vi.mock("@/lib/notes", () => ({
  setNotePublic: vi.fn(),
}));
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

import { auth } from "@/lib/auth";
import { setNotePublic } from "@/lib/notes";
import { POST } from "@/app/api/notes/[id]/share/route";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockSetNotePublic = vi.mocked(setNotePublic);

const fakeSession = { user: { id: "user-1" } };

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/notes/note-1/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function makeParams(id: string) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/notes/[id]/share", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await POST(makeRequest({ isPublic: true }), makeParams("note-1"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when isPublic is not a boolean", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    const res = await POST(makeRequest({ isPublic: "yes" }), makeParams("note-1"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/boolean/);
  });

  it("returns 400 when isPublic is missing", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    const res = await POST(makeRequest({}), makeParams("note-1"));
    expect(res.status).toBe(400);
  });

  it("returns 404 when note not found", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockSetNotePublic.mockReturnValue(undefined);
    const res = await POST(makeRequest({ isPublic: true }), makeParams("note-1"));
    expect(res.status).toBe(404);
  });

  it("returns 200 with share info when making public", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockSetNotePublic.mockReturnValue({
      id: "note-1",
      userId: "user-1",
      title: "T",
      contentJson: "{}",
      isPublic: true,
      publicSlug: "abc123",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    });
    const res = await POST(makeRequest({ isPublic: true }), makeParams("note-1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "note-1", isPublic: true, publicSlug: "abc123" });
    expect(mockSetNotePublic).toHaveBeenCalledWith("note-1", "user-1", true);
  });

  it("returns 200 with null slug when making private", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockSetNotePublic.mockReturnValue({
      id: "note-1",
      userId: "user-1",
      title: "T",
      contentJson: "{}",
      isPublic: false,
      publicSlug: null,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    });
    const res = await POST(makeRequest({ isPublic: false }), makeParams("note-1"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ id: "note-1", isPublic: false, publicSlug: null });
  });
});
