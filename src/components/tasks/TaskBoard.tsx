'use client';

import React from 'react';
import type { Task, TaskStatus } from '@/types';
import { useApp } from '@/context/AppContext';
import { TaskItem } from './TaskItem';
import { Plus } from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
}

export function TaskBoard({ tasks }: TaskBoardProps) {
  const { openQuickAdd } = useApp();

  const columns: Array<{ id: TaskStatus; title: string; color: string }> = [
    { id: 'not-started', title: 'Not Started', color: 'border-slate-300' },
    { id: 'in-progress', title: 'In Progress', color: 'border-indigo-500' },
    { id: 'waiting', title: 'Waiting', color: 'border-amber-500' },
    { id: 'blocked', title: 'Blocked', color: 'border-rose-500' },
    { id: 'completed', title: 'Completed', color: 'border-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col bg-slate-50 border border-slate-200 rounded-xl p-3 min-h-[500px]"
          >
            <div className={`flex items-center justify-between pb-3 mb-3 border-b-2 ${col.color}`}>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  {col.title}
                </h4>
                <span className="px-1.5 py-0.5 text-[11px] font-semibold bg-white border border-slate-200 rounded-full text-slate-600">
                  {colTasks.length}
                </span>
              </div>
              <button
                onClick={() => openQuickAdd({ status: col.id })}
                className="text-slate-400 hover:text-slate-600 p-1"
                title={`Add task to ${col.title}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 space-y-2.5 overflow-y-auto">
              {colTasks.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                  No tasks
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
