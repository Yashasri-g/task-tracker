'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { formatNiceDate } from '@/lib/utils/date';
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Save,
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  CheckSquare,
  Code,
  Download,
  FileDown,
  Check,
} from 'lucide-react';

// Convert raw markdown text to rich HTML for initial load
function markdownToHtml(md: string): string {
  if (!md) return '<p><br/></p>';
  if (/<[a-z][\s\S]*>/i.test(md)) {
    return md;
  }

  const lines = md.split('\n');
  let html = '';
  let inCode = false;
  let codeBuf: string[] = [];

  lines.forEach((line) => {
    if (line.trim().startsWith('```')) {
      if (inCode) {
        html += `<pre class="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs my-3 shadow-xs"><code>${codeBuf.join('\n')}</code></pre><p><br/></p>`;
        codeBuf = [];
        inCode = false;
      } else {
        inCode = true;
      }
      return;
    }

    if (inCode) {
      codeBuf.push(line);
      return;
    }

    if (line.startsWith('# ')) {
      html += `<h1 class="text-2xl font-bold text-slate-900 border-b border-slate-200 pb-2 mt-4 mb-2">${formatInlineHtml(line.slice(2))}</h1>`;
    } else if (line.startsWith('## ')) {
      html += `<h2 class="text-lg font-bold text-slate-800 mt-3 mb-1">${formatInlineHtml(line.slice(3))}</h2>`;
    } else if (line.startsWith('- [ ] ') || line.startsWith('- [x] ')) {
      const checked = line.startsWith('- [x] ');
      html += `<div class="flex items-center gap-2 my-1 text-slate-800"><input type="checkbox" ${checked ? 'checked' : ''} class="w-4 h-4 rounded border-slate-300 text-indigo-600"/><span>${formatInlineHtml(line.slice(6))}</span></div>`;
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      html += `<ul class="list-disc ml-5 my-1"><li>${formatInlineHtml(line.slice(2))}</li></ul>`;
    } else if (line.trim() === '') {
      html += '<p><br/></p>';
    } else {
      html += `<p class="my-1 text-slate-800 leading-relaxed">${formatInlineHtml(line)}</p>`;
    }
  });

  if (inCode && codeBuf.length > 0) {
    html += `<pre class="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs my-3 shadow-xs"><code>${codeBuf.join('\n')}</code></pre><p><br/></p>`;
  }

  return html;
}

function formatInlineHtml(str: string): string {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-xs border border-slate-200">$1</code>');
}

export default function NotesPage() {
  const {
    notes,
    createNote,
    updateNote,
    deleteNote,
    isLoading,
  } = useApp();

  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Note State
  const [title, setTitle] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  // Input refs
  const titleInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const activeNote = notes.find((n) => n.id === activeNoteId);

  // Sync state when active note changes
  useEffect(() => {
    if (activeNote) {
      setTitle(activeNote.title);
      const converted = markdownToHtml(activeNote.content);
      setHtmlContent(converted);
      if (canvasRef.current) {
        canvasRef.current.innerHTML = converted;
      }
    } else if (notes.length > 0 && !activeNoteId) {
      setActiveNoteId(notes[0].id);
    }
  }, [activeNoteId, activeNote, notes]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleCreateNewNote = async () => {
    const newNote = await createNote({
      title: 'Untitled Document',
      content: '<p><br/></p>',
      tags: [],
      relatedTaskIds: [],
    });
    setActiveNoteId(newNote.id);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 50);
  };

  const handleSaveActiveNote = async () => {
    if (!activeNoteId) return;
    setSaveStatus('saving');
    const currentHtml = canvasRef.current ? canvasRef.current.innerHTML : htmlContent;
    await updateNote(activeNoteId, {
      title: title.trim() || 'Untitled Document',
      content: currentHtml,
    });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  // Rich Text Editing Commands
  const execFormat = (command: string, value: string | undefined = undefined) => {
    if (canvasRef.current) {
      canvasRef.current.focus();
    }
    document.execCommand(command, false, value);
    if (canvasRef.current) {
      setHtmlContent(canvasRef.current.innerHTML);
    }
  };

  const insertChecklist = () => {
    if (canvasRef.current) {
      canvasRef.current.focus();
    }
    document.execCommand(
      'insertHTML',
      false,
      '<div class="flex items-center gap-2 my-1.5"><input type="checkbox" class="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"/> <span class="text-slate-800">Checklist item</span></div><p><br/></p>'
    );
    if (canvasRef.current) {
      setHtmlContent(canvasRef.current.innerHTML);
    }
  };

  const insertCodeBlock = () => {
    if (canvasRef.current) {
      canvasRef.current.focus();
    }
    document.execCommand(
      'insertHTML',
      false,
      '<pre class="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs my-3 shadow-xs"><code>// Type code here</code></pre><p><br/></p>'
    );
    if (canvasRef.current) {
      setHtmlContent(canvasRef.current.innerHTML);
    }
  };

  const handleDownloadPdf = (noteTitle: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const bodyHtml = canvasRef.current ? canvasRef.current.innerHTML : htmlContent;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${noteTitle || 'Document'}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 50px; color: #0f172a; line-height: 1.7; font-size: 14px; }
            h1 { font-size: 26px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 24px; font-weight: 700; }
            h2 { font-size: 20px; color: #1e293b; margin-top: 20px; font-weight: 700; }
            pre { background: #0f172a; color: #34d399; padding: 18px; border-radius: 12px; font-family: monospace; font-size: 13px; }
            .footer { margin-top: 60px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px; }
          </style>
        </head>
        <body>
          <h1>${noteTitle || 'Untitled Document'}</h1>
          <div>${bodyHtml}</div>
          <div class="footer">Exported from Executive Command Center · ${new Date().toLocaleDateString()}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  const handleDownloadDocx = (noteTitle: string) => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' "+
          "xmlns:w='urn:schemas-microsoft-com:office:word' "+
          "xmlns='http://www.w3.org/TR/REC-html40'>"+
          "<head><meta charset='utf-8'><title>"+ (noteTitle || 'Document') +"</title></head><body>";
    const footer = "</body></html>";
    const bodyHtml = canvasRef.current ? canvasRef.current.innerHTML : htmlContent;
    const html = header + "<h1 style='font-family: Arial, sans-serif; color: #0f172a;'>" + (noteTitle || 'Untitled Document') + "</h1><div style='font-family: Arial, sans-serif; font-size: 14px; line-height: 1.6;'>" + bodyHtml + "</div>" + footer;

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(noteTitle || 'Document').replace(/[^a-z0-9]/gi, '_')}.docx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteActiveNote = async () => {
    if (!activeNoteId) return;
    const nextId = notes.find((n) => n.id !== activeNoteId)?.id || null;
    await deleteNote(activeNoteId);
    setActiveNoteId(nextId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            Notes & Documentation Hub
          </h2>
          <p className="text-xs text-slate-500">
            Scratchpad documentation, technical specifications, and executive meeting notes.
          </p>
        </div>

        <Button
          onClick={handleCreateNewNote}
          variant="primary"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500 text-white shrink-0"
          icon={<Plus className="w-4 h-4" />}
        >
          New Note
        </Button>
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Document List Sidebar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700">Documents ({filteredNotes.length})</span>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div className="space-y-2 max-h-[580px] overflow-y-auto custom-scrollbar">
            {filteredNotes.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="font-semibold text-slate-600 mb-1">No notes found</p>
                <p className="text-[11px] text-slate-400">Click &quot;New Note&quot; above to create a document.</p>
              </div>
            ) : (
              filteredNotes.map((n) => (
                <div
                  key={n.id}
                  onClick={() => setActiveNoteId(n.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    n.id === activeNoteId
                      ? 'bg-indigo-50/80 border-indigo-300 shadow-2xs'
                      : 'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <h4 className="text-xs font-bold text-slate-900 truncate">{n.title || 'Untitled Document'}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {n.content ? n.content.replace(/<[^>]*>/g, ' ').slice(0, 100) : 'No content yet...'}
                  </p>
                  <div className="text-[10px] text-slate-400 mt-2 font-medium">
                    {formatNiceDate(n.updatedAt)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Google Docs Style Rich WYSIWYG Canvas */}
        <div className="md:col-span-2">
          {activeNote ? (
            <div className="space-y-3">
              {/* Google Docs Header Toolbar & Controls */}
              <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-2xs flex flex-wrap items-center justify-between gap-3">
                {/* Formatting Tools */}
                <div className="flex items-center gap-1 bg-slate-50 p-1 border border-slate-200/80 rounded-xl flex-wrap">
                  <button
                    type="button"
                    onClick={() => execFormat('bold')}
                    className="p-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded font-bold"
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execFormat('italic')}
                    className="p-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded italic"
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => execFormat('formatBlock', '<h1>')}
                    className="p-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded font-bold"
                    title="Title Heading (H1)"
                  >
                    <Heading1 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => execFormat('formatBlock', '<h2>')}
                    className="p-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded font-bold"
                    title="Subtitle (H2)"
                  >
                    <Heading2 className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-slate-200 mx-1" />
                  <button
                    type="button"
                    onClick={() => execFormat('insertUnorderedList')}
                    className="p-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded"
                    title="Bulleted List"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={insertChecklist}
                    className="p-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded"
                    title="Checklist Item"
                  >
                    <CheckSquare className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={insertCodeBlock}
                    className="p-1.5 text-xs text-slate-700 hover:bg-slate-200 rounded"
                    title="Code Block"
                  >
                    <Code className="w-4 h-4" />
                  </button>
                </div>

                {/* Document Actions & Auto-Save Status */}
                <div className="flex items-center gap-2 shrink-0">
                  {saveStatus === 'saving' && (
                    <span className="text-[11px] text-slate-400 font-medium">Saving...</span>
                  )}
                  {saveStatus === 'saved' && (
                    <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> Saved
                    </span>
                  )}

                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleSaveActiveNote}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1"
                    icon={<Save className="w-3.5 h-3.5" />}
                  >
                    Save
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadDocx(title)}
                    title="Export as Word DOCX"
                    className="gap-1 text-slate-700"
                  >
                    <Download className="w-3.5 h-3.5 text-indigo-600" /> DOCX
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownloadPdf(title)}
                    title="Export as PDF"
                    className="gap-1 text-slate-700"
                  >
                    <FileDown className="w-3.5 h-3.5 text-slate-600" /> PDF
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDeleteActiveNote}
                    className="text-rose-600 hover:bg-rose-50"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Single Google Docs Sheet Paper Canvas */}
              <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs p-6 md:p-10 space-y-4 min-h-[560px]">
                {/* Document Title Input */}
                <input
                  ref={titleInputRef}
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleSaveActiveNote}
                  placeholder="Untitled Document"
                  className="w-full text-2xl font-bold bg-transparent border-b border-slate-100 pb-3 text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                />

                {/* Real WYSIWYG ContentEditable Document Canvas */}
                <div
                  ref={canvasRef}
                  contentEditable={true}
                  suppressContentEditableWarning={true}
                  onInput={() => {
                    if (canvasRef.current) {
                      setHtmlContent(canvasRef.current.innerHTML);
                    }
                  }}
                  onBlur={handleSaveActiveNote}
                  className="w-full min-h-[460px] text-sm text-slate-900 bg-transparent focus:outline-none leading-relaxed font-sans placeholder:text-slate-300 prose max-w-none"
                />
              </div>
            </div>
          ) : (
            <Card className="p-8 text-center flex flex-col items-center justify-center min-h-[580px] space-y-2 border-dashed border-slate-200">
              <FileText className="w-12 h-12 text-slate-300" />
              <h3 className="text-base font-bold text-slate-900">No Document Selected</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                Click &quot;New Note&quot; in the top right to start writing.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
