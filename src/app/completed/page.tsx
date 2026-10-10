'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TaskItem } from '@/components/tasks/TaskItem';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { formatNiceDate, formatDateTime } from '@/lib/utils/date';
import { CheckCircle2, Search, Download, Sparkles, Filter, Copy } from 'lucide-react';

export default function CompletedPage() {
  const { tasks, projects, showToast, isLoading } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === 'completed');

  const filteredTasks = completedTasks.filter((t) => {
    if (projectFilter !== 'all' && t.projectId !== projectFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        (t.notes && t.notes.toLowerCase().includes(q)) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return true;
  }).sort((a, b) => (b.completedAt || b.updatedAt).localeCompare(a.completedAt || a.updatedAt));

  const handleCopySummary = () => {
    const summaryText = filteredTasks
      .map((t) => `• [COMPLETED ${formatNiceDate(t.completedAt)}] ${t.title}${t.notes ? ` - ${t.notes}` : ''}`)
      .join('\n');

    navigator.clipboard.writeText(summaryText);
    showToast('Executive Summary Copied', 'Copied completed items to clipboard for manager sync.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            Completed Work Archive ({completedTasks.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Searchable historical record of accomplishments and deliverables for 1-on-1s and performance reviews.
          </p>
        </div>

        <Button
          onClick={handleCopySummary}
          variant="secondary"
          size="sm"
          className="gap-1.5"
          icon={<Copy className="w-4 h-4 text-emerald-500" />}
        >
          Copy Summary Text
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-slate-200 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search completed tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
        >
          <option value="all">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* List of Completed Items */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-6 h-6 text-slate-400" />}
          title="No completed items found"
          description="Tasks marked as completed will automatically appear in this archive."
        />
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}
