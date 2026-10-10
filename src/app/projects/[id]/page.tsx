'use client';

import React, { useState, Suspense } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { TaskList } from '@/components/tasks/TaskList';
import { Card, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { formatNiceDate } from '@/lib/utils/date';
import { FolderKanban, Plus, Calendar, CheckSquare, Trash2, ArrowLeft, FileText, Users } from 'lucide-react';
import Link from 'next/link';

function ProjectDetailContent() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || '';

  const { projects, tasks, notes, meetings, deleteProject, openQuickAdd, isLoading } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const project = projects.find((p) => p.id === projectId);
  const projectTasks = tasks.filter((t) => t.projectId === projectId);
  const projectNotes = notes.filter((n) => n.projectId === projectId);
  const projectMeetings = meetings.filter((m) => m.projectId === projectId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="p-8 text-center space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Project Not Found</h3>
        <p className="text-xs text-slate-500">The requested project ID does not exist or was deleted.</p>
        <Button onClick={() => router.push('/projects')}>Back to Projects</Button>
      </div>
    );
  }

  const completedCount = projectTasks.filter((t) => t.status === 'completed').length;
  const totalCount = projectTasks.length;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleDelete = async () => {
    await deleteProject(project.id);
    router.push('/projects');
  };

  return (
    <div className="space-y-6">
      {/* Back Link */}
      <div>
        <Link href="/projects" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Projects
        </Link>
      </div>

      {/* Project Banner Header */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: project.color || '#6366f1' }} />
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{project.name}</h2>
              {project.targetDate && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" /> Target Date: {formatNiceDate(project.targetDate)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => openQuickAdd({ projectId: project.id })}
              variant="primary"
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-500"
              icon={<Plus className="w-4 h-4" />}
            >
              Add Task to Project
            </Button>

            {confirmDelete ? (
              <div className="flex items-center gap-1.5 bg-rose-50 p-1 rounded-lg border border-rose-200">
                <span className="text-xs font-semibold text-rose-700 px-1">Delete project?</span>
                <Button size="sm" variant="danger" onClick={handleDelete}>Yes</Button>
                <Button size="sm" variant="outline" onClick={() => setConfirmDelete(false)}>No</Button>
              </div>
            ) : (
              <Button size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDelete(true)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>

        {project.description && (
          <p className="text-xs text-slate-600">{project.description}</p>
        )}

        {/* Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-700">
              Task Completion ({completedCount} of {totalCount})
            </span>
            <span className="text-indigo-600 font-bold">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      {/* Project Tasks */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Project Tasks</h3>
        <TaskList tasks={projectTasks} showFilters={true} />
      </div>

      {/* Associated Notes & Meetings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-500" /> Linked Notes ({projectNotes.length})
            </CardTitle>
          </CardHeader>
          {projectNotes.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No notes linked to this project.</p>
          ) : (
            <div className="space-y-2">
              {projectNotes.map((n) => (
                <Link key={n.id} href={`/notes?id=${n.id}`} className="block p-2.5 bg-slate-50 rounded-lg hover:border-slate-300">
                  <h4 className="text-xs font-semibold text-slate-900">{n.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{n.content}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" /> Meeting Records ({projectMeetings.length})
            </CardTitle>
          </CardHeader>
          {projectMeetings.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No meetings logged for this project.</p>
          ) : (
            <div className="space-y-2">
              {projectMeetings.map((m) => (
                <Link key={m.id} href={`/meetings?id=${m.id}`} className="block p-2.5 bg-slate-50 rounded-lg hover:border-slate-300">
                  <h4 className="text-xs font-semibold text-slate-900">{m.title}</h4>
                  <p className="text-[11px] text-slate-500">{m.date} · {m.participants.join(', ')}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading project...</div>}>
      <ProjectDetailContent />
    </Suspense>
  );
}
