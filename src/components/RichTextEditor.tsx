import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Highlight } from '@tiptap/extension-highlight';
import { TextAlign } from '@tiptap/extension-text-align';
import styles from './RichTextEditor.module.css';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

function MenuBar({ editor }: { editor: ReturnType<typeof useEditor> }) {
  if (!editor) return null;

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolGroup}>
        <button
          type="button"
          className={editor.isActive('heading', { level: 3 }) ? styles.toolBtnActive : styles.toolBtn}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Heading"
        >
          H3
        </button>
        <button
          type="button"
          className={editor.isActive('heading', { level: 4 }) ? styles.toolBtnActive : styles.toolBtn}
          onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
          title="Subheading"
        >
          H4
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.toolGroup}>
        <button
          type="button"
          className={editor.isActive('bold') ? styles.toolBtnActive : styles.toolBtn}
          onClick={() => editor.chain().focus().toggleBold().run()}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className={editor.isActive('italic') ? styles.toolBtnActive : styles.toolBtn}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className={editor.isActive('highlight') ? styles.toolBtnActive : styles.toolBtn}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          title="Highlight"
        >
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>ink_highlighter</span>
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.toolGroup}>
        <button
          type="button"
          className={editor.isActive('bulletList') ? styles.toolBtnActive : styles.toolBtn}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          title="Bullet List"
        >
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>format_list_bulleted</span>
        </button>
        <button
          type="button"
          className={editor.isActive('orderedList') ? styles.toolBtnActive : styles.toolBtn}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          title="Numbered List"
        >
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>format_list_numbered</span>
        </button>
      </div>

      <div className={styles.divider} />

      <div className={styles.toolGroup}>
        <button
          type="button"
          className={styles.toolBtn}
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
          title="Insert Table"
        >
          <span className="material-symbols-rounded" style={{ fontSize: 16 }}>table</span>
        </button>
        {editor.isActive('table') && (
          <>
            <button
              type="button"
              className={styles.toolBtn}
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              title="Add Column"
            >
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>add</span>Col
            </button>
            <button
              type="button"
              className={styles.toolBtn}
              onClick={() => editor.chain().focus().addRowAfter().run()}
              title="Add Row"
            >
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>add</span>Row
            </button>
            <button
              type="button"
              className={styles.toolBtnDanger}
              onClick={() => editor.chain().focus().deleteTable().run()}
              title="Delete Table"
            >
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>delete</span>
            </button>
          </>
        )}
      </div>

      <div className={styles.divider} />

      <div className={styles.toolGroup}>
        <button
          type="button"
          className={styles.toolBtn}
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          ―
        </button>
      </div>
    </div>
  );
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  return (
    <div className={styles.editor}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className={styles.content} />
    </div>
  );
}
