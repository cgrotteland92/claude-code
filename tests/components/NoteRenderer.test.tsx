// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import NoteRenderer from "@/components/NoteRenderer";

function doc(...content: object[]) {
  return JSON.stringify({ type: "doc", content });
}

describe("NoteRenderer", () => {
  it("renders a paragraph", () => {
    const { container } = render(
      <NoteRenderer content={doc({ type: "paragraph", content: [{ type: "text", text: "Hello" }] })} />
    );
    expect(container.querySelector("p")).toHaveTextContent("Hello");
  });

  it("renders h1, h2, h3 headings", () => {
    const { container } = render(
      <NoteRenderer
        content={doc(
          { type: "heading", attrs: { level: 1 }, content: [{ type: "text", text: "H1" }] },
          { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "H2" }] },
          { type: "heading", attrs: { level: 3 }, content: [{ type: "text", text: "H3" }] }
        )}
      />
    );
    expect(container.querySelector("h1")).toHaveTextContent("H1");
    expect(container.querySelector("h2")).toHaveTextContent("H2");
    expect(container.querySelector("h3")).toHaveTextContent("H3");
  });

  it("renders bold text as <strong>", () => {
    const { container } = render(
      <NoteRenderer
        content={doc({
          type: "paragraph",
          content: [{ type: "text", text: "bold", marks: [{ type: "bold" }] }],
        })}
      />
    );
    expect(container.querySelector("strong")).toHaveTextContent("bold");
  });

  it("renders italic text as <em>", () => {
    const { container } = render(
      <NoteRenderer
        content={doc({
          type: "paragraph",
          content: [{ type: "text", text: "italic", marks: [{ type: "italic" }] }],
        })}
      />
    );
    expect(container.querySelector("em")).toHaveTextContent("italic");
  });

  it("renders inline code mark as <code>", () => {
    const { container } = render(
      <NoteRenderer
        content={doc({
          type: "paragraph",
          content: [{ type: "text", text: "snippet", marks: [{ type: "code" }] }],
        })}
      />
    );
    expect(container.querySelector("code")).toHaveTextContent("snippet");
  });

  it("renders bullet list and list items", () => {
    const { container } = render(
      <NoteRenderer
        content={doc({
          type: "bulletList",
          content: [
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Item 1" }] }] },
            { type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "Item 2" }] }] },
          ],
        })}
      />
    );
    expect(container.querySelector("ul")).not.toBeNull();
    expect(container.querySelectorAll("li")).toHaveLength(2);
  });

  it("renders code block as <pre>", () => {
    const { container } = render(
      <NoteRenderer
        content={doc({
          type: "codeBlock",
          content: [{ type: "text", text: "const x = 1;" }],
        })}
      />
    );
    expect(container.querySelector("pre")).toHaveTextContent("const x = 1;");
  });

  it("renders horizontal rule as <hr>", () => {
    const { container } = render(
      <NoteRenderer content={doc({ type: "horizontalRule" })} />
    );
    expect(container.querySelector("hr")).not.toBeNull();
  });

  it("shows fallback message on invalid JSON", () => {
    render(<NoteRenderer content="not valid json{{" />);
    expect(screen.getByText(/unable to render/i)).toBeInTheDocument();
  });

  it("renders empty doc without crashing", () => {
    const { container } = render(
      <NoteRenderer content={doc()} />
    );
    expect(container).toBeInTheDocument();
  });
});
