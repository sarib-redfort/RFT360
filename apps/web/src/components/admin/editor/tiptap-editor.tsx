'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import ImageExt from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { useCallback, useState } from 'react';
import { MediaPickerDialog } from '../media/media-picker-dialog';

export interface RichTextValue {
  json: unknown;
  html: string;
}

/**
 * Tiptap-based rich-text editor for the CMS (blog posts, job descriptions,
 * pages). Emits `{ json, html }`: the JSON is stored as the editable source of
 * truth, the HTML is re-sanitised server-side before persistence. Images are
 * inserted from the media library.
 */
export function TiptapEditor({
  value,
  onChange,
  placeholder = 'Write something…',
}: {
  value?: RichTextValue | null;
  onChange: (value: RichTextValue) => void;
  placeholder?: string;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Underline,
      Link.configure({ openOnClick: false, autolink: true }),
      ImageExt.configure({ inline: false, HTMLAttributes: { class: 'rounded-lg' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: (value?.json as object) ?? value?.html ?? '',
    editorProps: {
      attributes: {
        class:
          'prose-rft min-h-[300px] max-w-none px-4 py-3 focus:outline-none [&_*]:text-[var(--text-primary)]',
      },
    },
    onUpdate: ({ editor }) => onChange({ json: editor.getJSON(), html: editor.getHTML() }),
  });

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('Link URL');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return <div className="h-80 rounded-lg border border-[var(--border)]" />;

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-card)]">
      <Toolbar editor={editor} onLink={addLink} onImage={() => setPickerOpen(true)} />
      <EditorContent editor={editor} />
      {pickerOpen && (
        <MediaPickerDialog
          onClose={() => setPickerOpen(false)}
          onSelect={(media) => {
            const url = media.url;
            if (url) editor.chain().focus().setImage({ src: url, alt: media.alt ?? '' }).run();
            setPickerOpen(false);
          }}
        />
      )}
    </div>
  );
}

function Toolbar({
  editor,
  onLink,
  onImage,
}: {
  editor: Editor;
  onLink: () => void;
  onImage: () => void;
}) {
  const Btn = ({
    icon,
    label,
    active,
    onClick,
  }: {
    icon: string;
    label: string;
    active?: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded text-sm ${
        active ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
      }`}
    >
      <i className={icon} aria-hidden />
    </button>
  );

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1.5">
      <Btn icon="fa-solid fa-bold" label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
      <Btn icon="fa-solid fa-italic" label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
      <Btn icon="fa-solid fa-underline" label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
      <Btn icon="fa-solid fa-strikethrough" label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
      <Divider />
      <Btn icon="fa-solid fa-heading" label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} />
      <Btn icon="fa-solid fa-h" label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} />
      <Divider />
      <Btn icon="fa-solid fa-list-ul" label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
      <Btn icon="fa-solid fa-list-ol" label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
      <Btn icon="fa-solid fa-quote-right" label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()} />
      <Btn icon="fa-solid fa-code" label="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()} />
      <Divider />
      <Btn icon="fa-solid fa-link" label="Link" active={editor.isActive('link')} onClick={onLink} />
      <Btn icon="fa-solid fa-image" label="Image" onClick={onImage} />
      <Divider />
      <Btn icon="fa-solid fa-rotate-left" label="Undo" onClick={() => editor.chain().focus().undo().run()} />
      <Btn icon="fa-solid fa-rotate-right" label="Redo" onClick={() => editor.chain().focus().redo().run()} />
    </div>
  );
}

function Divider() {
  return <span className="mx-1 h-5 w-px bg-[var(--border)]" />;
}
