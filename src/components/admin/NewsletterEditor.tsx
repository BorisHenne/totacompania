'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, Quote, Minus, Link2, Image as ImageIcon, Undo, Redo,
  AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Type, Palette,
  Highlighter, Code, Columns, LayoutTemplate
} from 'lucide-react';
import { useState } from 'react';

const BRAND_COLORS = [
  '#5b21b6', '#844cfc', '#dbcbff', '#1e40af', '#dc2626',
  '#059669', '#d97706', '#000000', '#374151', '#6b7280',
  '#ffffff', '#f3f4f6',
];

const EMAIL_TEMPLATES = [
  {
    name: 'Vide',
    html: '<p></p>',
  },
  {
    name: 'Spectacle',
    html: `<div style="text-align: center;"><h1 style="color: #5b21b6;">Nouveau spectacle !</h1><p>Cher(e) {{prenom}},</p><p>Nous avons le plaisir de vous annoncer notre prochain spectacle :</p><h2 style="color: #844cfc;">[Nom du spectacle]</h2><p><strong>Date :</strong> [date]<br><strong>Lieu :</strong> Centre Culturel Vauban, Toul</p><p>Nous esperons vous y voir nombreux !</p><p><em>L'equipe Tota Compania</em></p></div>`,
  },
  {
    name: 'Stage enfants',
    html: `<div style="text-align: center;"><h1 style="color: #5b21b6;">Stage de theatre pour enfants</h1><p>Bonjour {{prenom}},</p><p>Les inscriptions sont ouvertes pour notre prochain stage :</p><h2 style="color: #844cfc;">[Titre du stage]</h2><p><strong>Dates :</strong> [dates]<br><strong>Ages :</strong> 6-12 ans<br><strong>Lieu :</strong> Centre Culturel Vauban, Toul<br><strong>Tarif :</strong> [prix]</p><p>Inscrivez-vous sur <a href="https://totacompania.fr/stages">notre site</a> !</p><p><em>L'equipe Tota Compania</em></p></div>`,
  },
  {
    name: 'Newsletter',
    html: `<div><h1 style="color: #5b21b6; text-align: center;">La lettre de Tota Compania</h1><hr><h2 style="color: #844cfc;">Les actualites</h2><p>[Votre texte ici]</p><hr><h2 style="color: #844cfc;">Prochains evenements</h2><ul><li>[Evenement 1]</li><li>[Evenement 2]</li></ul><hr><p style="text-align: center;"><em>Tota Compania - Theatre pour ici et maintenant</em><br>Centre Culturel Vauban - 3 rue des Anciens Combattants - 54200 TOUL</p></div>`,
  },
];

interface NewsletterEditorProps {
  content: string;
  onChange: (html: string) => void;
}

function ToolbarButton({ onClick, active, title, children }: { onClick: () => void; active?: boolean; title: string; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded transition-colors ${active ? 'bg-[#844cfc] text-white' : 'hover:bg-gray-200 text-gray-700'}`}
    >
      {children}
    </button>
  );
}

export default function NewsletterEditor({ content, onChange }: NewsletterEditorProps) {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showImageUrl, setShowImageUrl] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { style: 'color: #844cfc; text-decoration: underline;' } }),
      Image.configure({ HTMLAttributes: { style: 'max-width: 100%; height: auto; border-radius: 8px;' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: 'Composez votre newsletter...' }),
    ],
    content: content || '<p></p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] px-6 py-4',
        style: 'font-family: Arial, sans-serif;',
      },
    },
  });

  if (!editor) return null;

  const addLink = () => {
    const url = prompt('URL du lien :', 'https://');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageUrl(false);
    }
  };

  const insertVariable = (variable: string) => {
    editor.chain().focus().insertContent(`{{${variable}}}`).run();
  };

  const applyTemplate = (html: string) => {
    editor.commands.setContent(html);
    onChange(html);
    setShowTemplates(false);
  };

  return (
    <div className="border border-gray-300 rounded-xl overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-gray-200 bg-gray-50 p-2">
        {/* Row 1: Templates + Variables */}
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-200">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#844cfc] text-white rounded-lg hover:bg-[#7338e8] transition-colors"
            >
              <LayoutTemplate className="w-4 h-4" /> Templates
            </button>
            {showTemplates && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
                {EMAIL_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    type="button"
                    onClick={() => applyTemplate(tpl.html)}
                    className="w-full text-left px-4 py-2.5 hover:bg-[#f5f0ff] text-sm transition-colors first:rounded-t-lg last:rounded-b-lg"
                  >
                    {tpl.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="w-px h-6 bg-gray-300" />
          <span className="text-xs text-gray-500">Variables :</span>
          {['prenom', 'nom', 'email'].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => insertVariable(v)}
              className="px-2 py-1 text-xs bg-amber-100 text-amber-800 rounded hover:bg-amber-200 transition-colors font-mono"
            >
              {`{{${v}}}`}
            </button>
          ))}
        </div>

        {/* Row 2: Formatting */}
        <div className="flex flex-wrap items-center gap-0.5">
          <ToolbarButton onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive('paragraph')} title="Paragraphe"><Type className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })} title="Titre 1"><Heading1 className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Titre 2"><Heading2 className="w-4 h-4" /></ToolbarButton>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Gras"><Bold className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italique"><Italic className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Souligne"><UnderlineIcon className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Barre"><Strikethrough className="w-4 h-4" /></ToolbarButton>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <div className="relative">
            <ToolbarButton onClick={() => setShowColorPicker(!showColorPicker)} title="Couleur du texte"><Palette className="w-4 h-4" /></ToolbarButton>
            {showColorPicker && (
              <div className="absolute left-0 top-full mt-1 p-2 bg-white border border-gray-200 rounded-lg shadow-xl z-20 flex flex-wrap gap-1 w-40">
                {BRAND_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => { editor.chain().focus().setColor(color).run(); setShowColorPicker(false); }}
                    className="w-7 h-7 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            )}
          </div>
          <ToolbarButton onClick={() => editor.chain().focus().toggleHighlight({ color: '#dbcbff' }).run()} active={editor.isActive('highlight')} title="Surligner"><Highlighter className="w-4 h-4" /></ToolbarButton>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Aligner a gauche"><AlignLeft className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Centrer"><AlignCenter className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Aligner a droite"><AlignRight className="w-4 h-4" /></ToolbarButton>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Liste a puces"><List className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Liste numerotee"><ListOrdered className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Citation"><Quote className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Separateur"><Minus className="w-4 h-4" /></ToolbarButton>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Lien"><Link2 className="w-4 h-4" /></ToolbarButton>
          <div className="relative">
            <ToolbarButton onClick={() => setShowImageUrl(!showImageUrl)} title="Image"><ImageIcon className="w-4 h-4" /></ToolbarButton>
            {showImageUrl && (
              <div className="absolute right-0 top-full mt-1 p-3 bg-white border border-gray-200 rounded-lg shadow-xl z-20 w-72">
                <label className="block text-xs font-medium text-gray-600 mb-1">URL de l&apos;image</label>
                <div className="flex gap-2">
                  <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://..." className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#844cfc] outline-none" />
                  <button type="button" onClick={addImage} className="px-3 py-1 text-sm bg-[#844cfc] text-white rounded hover:bg-[#7338e8]">OK</button>
                </div>
              </div>
            )}
          </div>
          <div className="w-px h-6 bg-gray-300 mx-1" />
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Annuler"><Undo className="w-4 h-4" /></ToolbarButton>
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Refaire"><Redo className="w-4 h-4" /></ToolbarButton>
        </div>
      </div>

      {/* Editor Area */}
      <div className="bg-white" style={{ background: 'repeating-conic-gradient(#f9f9f9 0% 25%, transparent 0% 50%) 50% / 20px 20px' }}>
        <div className="max-w-[600px] mx-auto bg-white shadow-sm my-4 rounded-lg border border-gray-100">
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
