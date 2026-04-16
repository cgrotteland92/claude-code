import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));
vi.mock("@/lib/notes", () => ({
  createNote: vi.fn(),
}));
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

import { auth } from "@/lib/auth";
import { createNote } from "@/lib/notes";
import { POST } from "@/app/api/notes/route";

const mockGetSession = vi.mocked(auth.api.getSession);
const mockCreateNote = vi.mocked(createNote);

const fakeSession = { user: { id: "user-1" } };
const fakeNote = {
  id: "n1",
  userId: "user-1",
  title: "Test",
  contentJson: "{}",
  isPublic: false,
  publicSlug: null,
  createdAt: "2024-01-01",
  updatedAt: "2024-01-01",
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/notes", () => {
  it("returns 401 when unauthenticated", async () => {
    mockGetSession.mockResolvedValue(null);
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is malformed JSON", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    const req = new Request("http://localhost/api/notes", {
      method: "POST",
      body: "not-json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when contentJson is an array", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    const res = await POST(makeRequest({ contentJson: [1, 2] }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when contentJson is null", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    const res = await POST(makeRequest({ contentJson: null }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when contentJson is a string", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    const res = await POST(makeRequest({ contentJson: "string" }));
    expect(res.status).toBe(400);
  });

  it("defaults title to 'Untitled note' when blank", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockCreateNote.mockReturnValue(fakeNote);
    await POST(makeRequest({ title: "   ", contentJson: { type: "doc" } }));
    expect(mockCreateNote).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ title: "Untitled note" })
    );
  });

  it("trims and truncates title to 500 chars", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockCreateNote.mockReturnValue(fakeNote);
    const longTitle = "a".repeat(600);
    await POST(makeRequest({ title: `  ${longTitle}  `, contentJson: { type: "doc" } }));
    const [, data] = mockCreateNote.mock.calls[0];
    expect(data.title?.length).toBe(500);
  });

  it("returns 201 with note on success", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockCreateNote.mockReturnValue(fakeNote);
    const res = await POST(makeRequest({ title: "My Note", contentJson: { type: "doc" } }));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual(fakeNote);
  });

  it("returns 500 when createNote throws", async () => {
    mockGetSession.mockResolvedValue(fakeSession as never);
    mockCreateNote.mockImplementation(() => { throw new Error("DB error"); });
    const res = await POST(makeRequest({ title: "x", contentJson: { type: "doc" } }));
    expect(res.status).toBe(500);
  });
});
