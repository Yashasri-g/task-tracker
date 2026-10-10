'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { selectInboxTasks } from '@/lib/selectors';
import { TaskItem } from '@/components/tasks/TaskItem';
import { EmptyState } from '@/components/common/EmptyState';
import { Button } from '@/components/common/Button';
import { Inbox as InboxIcon, Plus, CheckCircle2, Sparkles } from 'lucide-react';

export default function InboxPage() {
  const { tasks, isLoading, openQuickAdd } = useApp();
  const inboxTasks = selectInboxTasks(tasks);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
            <InboxIcon className="w-4 h-4" />
            <span>Capture First, Organize Later</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">Inbox ({inboxTasks.length})</h2>
          <p className="text-xs text-slate-500">
            Unprocessed notes, quick captures, and commitments waiting for triage.
          </p>
        </div>

        <Button
          onClick={() => openQuickAdd({ inInbox: true })}
          variant="primary"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500"
          icon={<Plus className="w-4 h-4" />}
        >
          Capture to Inbox
        </Button>
      </div>

      {inboxTasks.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
          title="Inbox Zero!"
          description="All captured items have been triaged, scheduled, or assigned to projects."
          actionLabel="Quick Capture Task"
          onAction={() => openQuickAdd({ inInbox: true })}
        />
      ) : (
        <div className="space-y-3">
          <div className="p-3 bg-indigo-50/60 border border-indigo-200/60 rounded-xl text-xs text-indigo-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Click any item below to add a due date, project, priority, or checklist.</span>
          </div>

          <div className="space-y-2">
            {inboxTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
