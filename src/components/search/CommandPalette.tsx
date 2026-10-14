'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/common/Modal';
import { performGlobalSearch, type SearchResult } from '@/lib/selectors';
import { Search, CheckSquare, FileText, Users, BookOpen, Clock, ArrowRight } from 'lucide-react';

export function CommandPalette() {
  const router = useRouter();
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    tasks,
    notes,
    meetings,
    journalEntries,
    followUps,
    openTaskDetail,
  } = useApp();

  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    return performGlobalSearch(query, tasks, [], notes, meetings, journalEntries, followUps);
  }, [query, tasks, notes, meetings, journalEntries, followUps]);

  if (!isCommandPaletteOpen) return null;

  const handleSelectResult = (result: SearchResult) => {
    closeCommandPalette();
    if (result.type === 'task') {
      openTaskDetail(result.id);
    } else {
      router.push(result.linkUrl);
    }
  };

  const getResultIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'task': return <CheckSquare className="w-4 h-4 text-indigo-500" />;
      case 'note': return <FileText className="w-4 h-4 text-sky-500" />;
      case 'meeting': return <Users className="w-4 h-4 text-purple-500" />;
      case 'journal': return <BookOpen className="w-4 h-4 text-amber-500" />;
      case 'followup': return <Clock className="w-4 h-4 text-rose-500" />;
      default: return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <Modal isOpen={isCommandPaletteOpen} onClose={closeCommandPalette} maxWidth="xl">
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            autoFocus
            placeholder="Type to search tasks, notes, meetings, journal..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
          />
        </div>

        {/* Search Results */}
        <div className="max-h-[350px] overflow-y-auto space-y-1 custom-scrollbar">
          {query.trim().length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Type a title, keyword, or tag to search your entire workspace.
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No matching items found for &quot;{query}&quot;.
            </div>
          ) : (
            searchResults.map((res) => (
              <div
                key={`${res.type}_${res.id}`}
                onClick={() => handleSelectResult(res)}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 cursor-pointer group transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="p-2 rounded-lg bg-white border border-slate-200/80 shrink-0">
                    {getResultIcon(res.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-slate-900 truncate">
                        {res.title}
                      </h4>
                      {res.badge && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase rounded bg-slate-200/60 text-slate-600">
                          {res.badge}
                        </span>
                      )}
                    </div>
                    {res.subtitle && (
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {res.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0 ml-2" />
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
}
