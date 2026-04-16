import { Fragment, ReactNode } from "react";

type Mark = { type: string };

type TipTapNode = {
  type: string;
  text?: string;
  marks?: Mark[];
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
};

function applyMarks(text: string, marks: Mark[]): ReactNode {
  return marks.reduce<ReactNode>((node, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{node}</strong>;
      case "italic":
        return <em>{node}</em>;
      case "code":
        return (
          <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded font-mono text-sm">
            {node}
          </code>
        );
      default:
        return node;
    }
  }, text);
}

function renderNode(node: TipTapNode, index: number): ReactNode {
  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case "doc":
      return <>{children}</>;
    case "paragraph":
      return (
        <p key={index} className="mb-3 leading-relaxed">
          {children}
        </p>
      );
    case "heading": {
      const level = (node.attrs?.level as number) ?? 1;
      const classes: Record<number, string> = {
        1: "text-2xl font-bold mb-4 mt-6",
        2: "text-xl font-bold mb-3 mt-5",
        3: "text-lg font-semibold mb-2 mt-4",
      };
      const Tag = `h${level}` as "h1" | "h2" | "h3";
      return (
        <Tag key={index} className={classes[level]}>
          {children}
        </Tag>
      );
    }
    case "bulletList":
      return (
        <ul key={index} className="list-disc pl-5 mb-3 space-y-1">
          {children}
        </ul>
      );
    case "listItem":
      return <li key={index}>{children}</li>;
    case "codeBlock":
      return (
        <pre
          key={index}
          className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-3 mb-3 font-mono text-sm overflow-x-auto"
        >
          {children}
        </pre>
      );
    case "horizontalRule":
      return <hr key={index} className="my-4 border-neutral-300 dark:border-neutral-600" />;
    case "text":
      if (node.marks && node.marks.length > 0) {
        return (
          <Fragment key={index}>{applyMarks(node.text ?? "", node.marks)}</Fragment>
        );
      }
      return node.text ?? null;
    default:
      return <>{children}</>;
  }
}

export default function NoteRenderer({ content }: { content: string }) {
  let doc: TipTapNode;
  try {
    doc = JSON.parse(content) as TipTapNode;
  } catch {
    return <p className="text-neutral-500">Unable to render note content.</p>;
  }

  return (
    <div className="prose-neutral text-neutral-900 dark:text-neutral-100">
      {renderNode(doc, 0)}
    </div>
  );
}
