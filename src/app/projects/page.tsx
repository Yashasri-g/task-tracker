'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Modal } from '@/components/common/Modal';
import { EmptyState } from '@/components/common/EmptyState';
import { formatNiceDate } from '@/lib/utils/date';
import { FolderKanban, Plus, Calendar, CheckSquare, ArrowRight } from 'lucide-react';

export default function ProjectsPage() {
  const { projects, tasks, createProject, isLoading } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#6366f1');
  const [targetDate, setTargetDate] = useState('');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createProject({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      targetDate: targetDate || undefined,
      status: 'active',
      tags: [],
      links: [],
    });

    setName('');
    setDescription('');
    setIsModalOpen(false);
  };

  const presetColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-indigo-500" />
            Projects ({projects.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize work initiatives, link tasks, and monitor project completion progress.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          size="sm"
          className="bg-indigo-600 hover:bg-indigo-500"
          icon={<Plus className="w-4 h-4" />}
        >
          Create Project
        </Button>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-6 h-6 text-indigo-500" />}
          title="No projects yet"
          description="Create your first initiative to group related tasks, deadlines, and notes."
          actionLabel="Create Project"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const completedCount = projectTasks.filter((t) => t.status === 'completed').length;
            const totalCount = projectTasks.length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card hoverable className="h-full flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: project.color || '#6366f1' }} />
                        <h3 className="text-base font-bold text-slate-900 truncate">{project.name}</h3>
                      </div>
                      <Badge variant="neutral" size="sm">{project.status}</Badge>
                    </div>

                    {project.description && (
                      <p className="text-xs text-slate-500 line-clamp-2">{project.description}</p>
                    )}
                  </div>

                  {/* Progress & Stats */}
                  <div className="space-y-2 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <CheckSquare className="w-3.5 h-3.5 text-slate-400" />
                        {completedCount} of {totalCount} Tasks Done
                      </span>
                      <span className="font-bold text-indigo-600">{progress}%</span>
                    </div>

                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${progress}%` }} />
                    </div>

                    {project.targetDate && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 pt-1">
                        <Calendar className="w-3 h-3" /> Target Date: {formatNiceDate(project.targetDate)}
                      </div>
                    )}
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Project Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Q4 Security Audit & SOC2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Project goals & context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Target Completion Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Color Tag</label>
              <div className="flex items-center gap-2 pt-1">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-6 h-6 rounded-full transition-transform ${color === c ? 'ring-2 ring-indigo-500 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-500">
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
