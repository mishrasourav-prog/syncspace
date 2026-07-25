import { EditorContent, type Editor } from "@tiptap/react";

interface DocumentEditorProps {
  editor: Editor | null;
  mode: "editing" | "preview";
}

const EDITOR_FRAME_CLASS =
  "tiptap-prose min-h-[50vh] border border-b-0 border-border bg-background/40 px-4 py-6 sm:px-6";

export function DocumentEditor({ editor, mode }: DocumentEditorProps) {
  if (!editor) {
    return <div className={`${EDITOR_FRAME_CLASS} ${mode === "preview" ? "rounded-t-xl" : "border-t-0"}`} />;
  }

  if (mode === "preview") {
    return (
      <div
        className={`${EDITOR_FRAME_CLASS} rounded-t-xl`}
        // This HTML is generated from the sanitized Tiptap document schema,
        // never from an arbitrary server HTML string.
        dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
      />
    );
  }

  return <EditorContent editor={editor} className={`${EDITOR_FRAME_CLASS} border-t-0`} />;
}
