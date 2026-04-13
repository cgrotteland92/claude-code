"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  Code,
  CodeXml,
  Minus,
  Pilcrow,
} from "lucide-react";

type Props = {
  initialContent?: object;
  onChange?: (json: object) => void;
};

type ToolbarButton = {
  icon: React.ReactNode;
  title: string;
  action: (e: NonNullable<ReturnType<typeof useEditor>>) => void;
  isActive: (e: NonNullable<ReturnType<typeof useEditor>>) => boolean;
};

type ToolbarGroup = ToolbarButton[];

function btn(
  icon: React.ReactNode,
  title: string,
  action: (e: NonNullable<ReturnType<typeof useEditor>>) => void,
  isActive: (e: NonNullable<ReturnType<typeof useEditor>>) => boolean = () => false,
): ToolbarButton {
  return { icon, title, action, isActive };
}

const TOOLBAR_GROUPS: ToolbarGroup[] = [
  [
    btn(<Pilcrow size={15} />, "Normal text",
      (e) => e.chain().focus().clearNodes().setParagraph().run(),
      (e) => e.isActive("paragraph") && !e.isActive("heading")),
    btn(<Heading1 size={15} />, "Heading 1",
      (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
      (e) => e.isActive("heading", { level: 1 })),
    btn(<Heading2 size={15} />, "Heading 2",
      (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
      (e) => e.isActive("heading", { level: 2 })),
    btn(<Heading3 size={15} />, "Heading 3",
      (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
      (e) => e.isActive("heading", { level: 3 })),
  ],
  [
    btn(<Bold size={15} />, "Bold",
      (e) => e.chain().focus().toggleBold().run(),
      (e) => e.isActive("bold")),
    btn(<Italic size={15} />, "Italic",
      (e) => e.chain().focus().toggleItalic().run(),
      (e) => e.isActive("italic")),
  ],
  [
    btn(<List size={15} />, "Bullet list",
      (e) => e.chain().focus().toggleBulletList().run(),
      (e) => e.isActive("bulletList")),
    btn(<Code size={15} />, "Inline code",
      (e) => e.chain().focus().toggleCode().run(),
      (e) => e.isActive("code")),
    btn(<CodeXml size={15} />, "Code block",
      (e) => e.chain().focus().toggleCodeBlock().run(),
      (e) => e.isActive("codeBlock")),
    btn(<Minus size={15} />, "Horizontal rule",
      (e) => e.chain().focus().setHorizontalRule().run()),
  ],
];

export default function NoteEditor({ initialContent, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
    ],
    content: initialContent ?? { type: "doc", content: [{ type: "paragraph" }] },
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor }) => onChange?.(editor.getJSON()),
  });

  if (!editor) return null;

  return (
    <div className="rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 overflow-hidden">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 px-2 py-1.5">
        {TOOLBAR_GROUPS.map((group, gi) => (
          <span key={gi} className="contents">
            {gi > 0 && (
              <span className="mx-1.5 h-5 w-px bg-neutral-300 dark:bg-neutral-600 self-center" />
            )}
            {group.map(({ icon, title, action, isActive }) => (
              <button
                key={title}
                type="button"
                title={title}
                onClick={() => action(editor)}
                aria-pressed={isActive(editor)}
                className={`rounded p-1.5 transition-colors ${
                  isActive(editor)
                    ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                    : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                }`}
              >
                {icon}
              </button>
            ))}
          </span>
        ))}
      </div>
      <EditorContent
        editor={editor}
        className="p-4 text-neutral-900 dark:text-neutral-100 [&_.ProseMirror]:min-h-48 [&_.ProseMirror]:outline-none [&_.ProseMirror_h1]:text-2xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-bold [&_.ProseMirror_h3]:text-lg [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:bg-neutral-100 dark:[&_.ProseMirror_code]:bg-neutral-800 [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:font-mono [&_.ProseMirror_code]:text-sm [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:bg-neutral-100 dark:[&_.ProseMirror_pre]:bg-neutral-800 [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_hr]:my-4 [&_.ProseMirror_hr]:border-neutral-300 dark:[&_.ProseMirror_hr]:border-neutral-600"
      />
    </div>
  );
}
