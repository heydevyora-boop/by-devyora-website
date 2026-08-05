"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect } from "react";
import { ImageUploader } from "./image-uploader";

type RichEditorProps = {
  value: string; // HTML
  onChange: (html: string) => void;
};

const toolbarBtn = (active: boolean): React.CSSProperties => ({
  padding: "6px 10px",
  fontSize: 12,
  border: `1px solid ${active ? "#121110" : "#E4E1DC"}`,
  background: active ? "#121110" : "#FFFFFF",
  color: active ? "#FFFFFF" : "#121110",
  cursor: "pointer",
  fontFamily: "Archivo, sans-serif",
});

/**
 * Loaded via next/dynamic(..., { ssr: false }) wherever it's used (see
 * blog-post-form.tsx) — Tiptap touches the DOM on init and is only needed on
 * the admin's post editor route, so there's no reason to ship it in the
 * initial bundle for any other page.
 */
export function RichEditor({ value, onChange }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        style: "min-height: 320px; padding: 16px; outline: none; font-size: 15px; line-height: 1.7;",
      },
    },
    immediatelyRender: false,
  });

  // Keep the editor in sync if `value` changes from outside (e.g. loading a different post)
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return <div style={{ padding: 16, color: "#6B6862", fontSize: 13 }}>Loading editor…</div>;

  return (
    <div style={{ border: "1px solid #E4E1DC" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 10, borderBottom: "1px solid #E4E1DC", background: "#F6F4F1" }}>
        <button type="button" style={toolbarBtn(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button type="button" style={toolbarBtn(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button type="button" style={toolbarBtn(editor.isActive("heading", { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
        <button type="button" style={toolbarBtn(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
        <button type="button" style={toolbarBtn(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>• List</button>
        <button type="button" style={toolbarBtn(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>1. List</button>
        <button type="button" style={toolbarBtn(editor.isActive("blockquote"))} onClick={() => editor.chain().focus().toggleBlockquote().run()}>&ldquo; Quote</button>
        <button
          type="button"
          style={toolbarBtn(editor.isActive("link"))}
          onClick={() => {
            const url = window.prompt("Link URL");
            if (url) editor.chain().focus().setLink({ href: url }).run();
            else editor.chain().focus().unsetLink().run();
          }}
        >
          Link
        </button>
        <button type="button" style={toolbarBtn(false)} onClick={() => editor.chain().focus().undo().run()}>Undo</button>
        <button type="button" style={toolbarBtn(false)} onClick={() => editor.chain().focus().redo().run()}>Redo</button>
      </div>

      <div style={{ padding: "10px 10px 0" }}>
        <ImageUploader onUploaded={(url) => editor.chain().focus().setImage({ src: url }).run()} />
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
