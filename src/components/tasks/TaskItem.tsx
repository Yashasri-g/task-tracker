'use client';

import React from 'react';
import type { Task } from '@/types';
import { useApp } from '@/context/AppContext';
import { formatNiceDate, isOverdue } from '@/lib/utils/date';
import { Badge } from '@/components/common/Badge';
import {
  CheckCircle2,
  Circle,
  Clock,
  User,
  AlertTriangle,
  CheckSquare,
  Link as LinkIcon,
  Flame,
  Repeat,
} from 'lucide-react';

interface TaskItemProps {
  task: Task;
  showProject?: boolean;
}

export function TaskItem({ task, showProject = true }: TaskItemProps) {
  const { toggleTaskCompletion, openTaskDetail, projects } = useApp();

  const isCompleted = task.status === 'completed';
  const overdue = isOverdue(task.dueDate, task.status);
  const project = projects.find((p) => p.id === task.projectId);

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'urgent';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'neutral';
    }
  };

  const completedChecklistCount = task.checklist.filter((c) => c.completed).length;

  return (
    <div
      onClick={() => openTaskDetail(task.id)}
      className={`group flex items-start justify-between p-3.5 sm:px-4 bg-white border ${
        overdue
          ? 'border-rose-200 bg-rose-50/40 hover:border-rose-300'
          : 'border-slate-200/80 hover:border-slate-300'
      } rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer`}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* Completion Checkbox */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleTaskCompletion(task);
          }}
          className="mt-0.5 shrink-0 text-slate-300 hover:text-emerald-600 transition-colors"
          aria-label={isCompleted ? 'Mark task as incomplete' : 'Mark task as complete'}
        >
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
          ) : (
            <Circle className="w-5 h-5 hover:scale-110 transition-transform" />
          )}
        </button>

        {/* Task Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={`text-sm font-semibold ${
                isCompleted
                  ? 'line-through text-slate-400'
                  : 'text-slate-900'
              }`}
            >
              {task.title}
            </h4>

            {/* Status Indicator */}
            {task.status === 'waiting' && <Badge variant="warning">Waiting</Badge>}
            {task.status === 'blocked' && <Badge variant="urgent">Blocked</Badge>}
            {task.status === 'in-progress' && <Badge variant="info">In Progress</Badge>}
            {task.recurringPattern && task.recurringPattern !== 'none' && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 font-semibold px-1.5 py-0.5 rounded border border-indigo-200 capitalize">
                <Repeat className="w-3 h-3 text-indigo-600" />
                {task.recurringPattern}
              </span>
            )}
          </div>

          {/* Task Metadata Row */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-slate-500">
            {/* Project Badge */}
            {showProject && project && (
              <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color || '#6366f1' }} />
                {project.name}
              </span>
            )}

            {/* Deadline / Time */}
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 ${
                  overdue
                    ? 'text-rose-600 font-bold'
                    : 'text-slate-500'
                }`}
              >
                {overdue ? <AlertTriangle className="w-3.5 h-3.5 text-rose-500" /> : <Clock className="w-3.5 h-3.5" />}
                {formatNiceDate(task.dueDate)} {task.dueTime ? `@ ${task.dueTime}` : ''}
              </span>
            )}

            {/* Person Involved */}
            {task.personInvolved && (
              <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                <User className="w-3.5 h-3.5 text-slate-400" />
                {task.personInvolved}
              </span>
            )}

            {/* Checklist / Subtasks count */}
            {task.checklist.length > 0 && (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-slate-600 font-medium">
                <CheckSquare className="w-3.5 h-3.5 text-indigo-500" />
                <span>{completedChecklistCount}/{task.checklist.length} subtasks</span>
              </span>
            )}

            {/* Links count */}
            {task.links.length > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <LinkIcon className="w-3.5 h-3.5 text-slate-400" />
                {task.links.length}
              </span>
            )}

            {/* Tags */}
            {task.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-0.5 text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium border border-slate-200/60">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Badge */}
      {task.priority !== 'none' && (
        <div className="shrink-0 ml-3">
          <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
            {task.priority === 'urgent' && <Flame className="w-3 h-3 mr-1" />}
            {task.priority}
          </Badge>
        </div>
      )}
    </div>
  );
}
