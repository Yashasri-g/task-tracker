'use client';

import React, { useState, useMemo } from 'react';
import type { Task } from '@/types';
import { useApp } from '@/context/AppContext';
import { TaskItem } from './TaskItem';
import { EmptyState } from '@/components/common/EmptyState';
import { isOverdue } from '@/lib/utils/date';
import { ArrowUpDown, CheckSquare, Search } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  showFilters?: boolean;
}

export function TaskList({
  tasks,
  title,
  emptyTitle = 'No tasks found',
  emptyDescription = 'You have no tasks matching this view.',
  showFilters = true,
}: TaskListProps) {
  const { projects, openQuickAdd } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'created' | 'alphabetical'>('deadline');

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchNotes = t.notes?.toLowerCase().includes(q);
        const matchPerson = t.personInvolved?.toLowerCase().includes(q);
        const matchTags = t.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchNotes && !matchPerson && !matchTags) return false;
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'overdue') {
          if (!isOverdue(t.dueDate, t.status)) return false;
        } else if (t.status !== statusFilter) {
          return false;
        }
      }

      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (projectFilter !== 'all' && t.projectId !== projectFilter) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'deadline') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      } else if (sortBy === 'priority') {
        const priorityWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 };
        return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      } else if (sortBy === 'created') {
        return b.createdAt.localeCompare(a.createdAt);
      } else if (sortBy === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, projectFilter, sortBy]);

  return (
    <div className="space-y-4">
      {showFilters && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Filter tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {title && <h3 className="text-sm font-bold text-slate-900 shrink-0">{title} ({filteredTasks.length})</h3>}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="blocked">Blocked</option>
              <option value="overdue">Overdue</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 max-w-[140px] truncate"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1 shrink-0 text-xs text-slate-500">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-700"
              >
                <option value="deadline">Deadline</option>
                <option value="priority">Priority</option>
                <option value="created">Recently Created</option>
                <option value="alphabetical">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="w-6 h-6" />}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel="Create Task"
          onAction={() => openQuickAdd()}
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
