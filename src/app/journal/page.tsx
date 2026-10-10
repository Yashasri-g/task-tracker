'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { getTodayString, formatNiceDate } from '@/lib/utils/date';
import type { JournalEntry } from '@/types';
import { BookOpen, Calendar, Save, Sparkles } from 'lucide-react';

export default function JournalPage() {
  const { journalEntries, saveJournalEntry, isLoading } = useApp();

  const [selectedDate, setSelectedDate] = useState('');
  const [workCompleted, setWorkCompleted] = useState('');
  const [importantDecisions, setImportantDecisions] = useState('');
  const [challenges, setChallenges] = useState('');
  const [accomplishments, setAccomplishments] = useState('');
  const [notesForTomorrow, setNotesForTomorrow] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSelectedDate(getTodayString());
  }, []);

  const currentEntry = journalEntries.find((j) => j.date === selectedDate);

  useEffect(() => {
    if (currentEntry) {
      setWorkCompleted(currentEntry.workCompleted || '');
      setImportantDecisions(currentEntry.importantDecisions || '');
      setChallenges(currentEntry.challenges || '');
      setAccomplishments(currentEntry.accomplishments || '');
      setNotesForTomorrow(currentEntry.notesForTomorrow || '');
    } else {
      setWorkCompleted('');
      setImportantDecisions('');
      setChallenges('');
      setAccomplishments('');
      setNotesForTomorrow('');
    }
  }, [selectedDate, currentEntry]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const handleSave = async () => {
    if (!selectedDate) return;
    setIsSaving(true);
    await saveJournalEntry(selectedDate, {
      workCompleted,
      importantDecisions,
      challenges,
      accomplishments,
      notesForTomorrow,
    });
    setTimeout(() => setIsSaving(false), 300);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-500" />
            Daily Work Journal
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Private daily log of accomplishments, decisions, challenges, and notes for manager 1-on-1s.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold bg-transparent text-slate-900 focus:outline-none"
            />
          </div>

          <Button onClick={handleSave} variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-500 text-white" icon={<Save className="w-4 h-4" />}>
            {isSaving ? 'Saving...' : 'Save Journal'}
          </Button>
        </div>
      </div>

      {/* Main Journal Form */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-500" />
            Entry for {formatNiceDate(selectedDate)}
          </span>
          {currentEntry && (
            <span className="text-xs text-emerald-600 font-medium">Saved to IndexedDB</span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Key Work Completed Today
            </label>
            <textarea
              rows={4}
              value={workCompleted}
              onChange={(e) => setWorkCompleted(e.target.value)}
              onBlur={handleSave}
              placeholder="What deliverables, code commits, or tasks were finished?"
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Accomplishments & Wins
            </label>
            <textarea
              rows={4}
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              onBlur={handleSave}
              placeholder="Wins to highlight during manager syncs or performance reviews..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Important Architectural & Strategic Decisions
            </label>
            <textarea
              rows={3}
              value={importantDecisions}
              onChange={(e) => setImportantDecisions(e.target.value)}
              onBlur={handleSave}
              placeholder="Decisions made on architecture, specs, or priority trade-offs..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Challenges & Blockers Experienced
            </label>
            <textarea
              rows={3}
              value={challenges}
              onChange={(e) => setChallenges(e.target.value)}
              onBlur={handleSave}
              placeholder="Technical bottlenecks, vendor delays, or unblocked issues..."
              className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700">
            Notes & Top Priorities for Tomorrow
          </label>
          <textarea
            rows={3}
            value={notesForTomorrow}
            onChange={(e) => setNotesForTomorrow(e.target.value)}
            onBlur={handleSave}
            placeholder="Head start notes for tomorrow morning..."
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
          />
        </div>
      </Card>
    </div>
  );
}
