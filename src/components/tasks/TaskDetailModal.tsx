'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { formatDateTime } from '@/lib/utils/date';
import type { TaskPriority, TaskStatus, TaskType, ChecklistItem, LinkItem, RecurringPattern } from '@/types';
import {
  CheckCircle2,
  Trash2,
  X,
  ExternalLink,
  Clock,
  Repeat,
  CheckSquare,
} from 'lucide-react';
import { QuickDateSelector } from '@/components/common/QuickDateSelector';

export function TaskDetailModal() {
  const { activeTaskId, closeTaskDetail, tasks, updateTask, deleteTask, toggleTaskCompletion } = useApp();

  const task = tasks.find((t) => t.id === activeTaskId);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('not-started');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [taskType, setTaskType] = useState<TaskType>('task');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [personInvolved, setPersonInvolved] = useState('');
  const [assignedBy, setAssignedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>('none');
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [waitingPerson, setWaitingPerson] = useState('');
  const [waitingNote, setWaitingNote] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setStatus(task.status);
      setPriority(task.priority);
      setTaskType(task.taskType);
      setDueDate(task.dueDate || '');
      setDueTime(task.reminder?.time || task.dueTime || '');
      setPersonInvolved(task.personInvolved || '');
      setAssignedBy(task.assignedBy || '');
      setNotes(task.notes || '');
      setTagsInput(task.tags.join(', '));
      setRecurringPattern(task.recurringPattern || 'none');
      setChecklist(task.checklist || []);
      setLinks(task.links || []);
      setWaitingPerson(task.waitingForDetails?.person || '');
      setWaitingNote(task.waitingForDetails?.note || '');
      setConfirmDelete(false);
    }
  }, [task]);

  if (!activeTaskId || !task) return null;

  const handleSave = async () => {
    const tagsArr = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const waitingForDetails =
      status === 'waiting' || waitingPerson.trim()
        ? {
            person: waitingPerson.trim() || personInvolved.trim() || 'Colleague',
            requestedDate: task.waitingForDetails?.requestedDate || new Date().toISOString().slice(0, 10),
            note: waitingNote.trim() || undefined,
          }
        : undefined;

    const reminder = dueTime
      ? {
          date: dueDate || new Date().toISOString().slice(0, 10),
          time: dueTime,
          dismissed: false,
        }
      : undefined;

    await updateTask(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      taskType,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      reminder,
      personInvolved: personInvolved.trim() || undefined,
      assignedBy: assignedBy.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: tagsArr,
      recurringPattern,
      checklist,
      links,
      waitingForDetails,
      inInbox: false,
    });

    closeTaskDetail();
  };

  const handleAddChecklistItem = () => {
    if (!newChecklistTitle.trim()) return;
    const item: ChecklistItem = {
      id: `chk_${Date.now()}`,
      title: newChecklistTitle.trim(),
      completed: false,
    };
    setChecklist([...checklist, item]);
    setNewChecklistTitle('');
  };

  const handleToggleChecklist = (id: string) => {
    setChecklist(
      checklist.map((c) => (c.id === id ? { ...c, completed: !c.completed } : c))
    );
  };

  const handleRemoveChecklist = (id: string) => {
    setChecklist(checklist.filter((c) => c.id !== id));
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim()) return;
    const link: LinkItem = {
      id: `lnk_${Date.now()}`,
      title: newLinkTitle.trim() || 'Resource Link',
      url: newLinkUrl.trim(),
    };
    setLinks([...links, link]);
    setNewLinkTitle('');
    setNewLinkUrl('');
  };

  const handleRemoveLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  const handleDelete = async () => {
    await deleteTask(task.id);
    closeTaskDetail();
  };

  return (
    <Modal isOpen={!!activeTaskId} onClose={closeTaskDetail} maxWidth="2xl">
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleTaskCompletion(task)}
              className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              {task.status === 'completed' ? 'Completed (Click to reopen)' : 'Mark as Complete'}
            </button>

            {task.completedAt && (
              <span className="text-xs text-slate-400">
                Completed {formatDateTime(task.completedAt)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {confirmDelete ? (
              <div className="flex items-center gap-1.5 bg-rose-50 p-1 rounded-lg border border-rose-200">
                <span className="text-xs font-semibold text-rose-700 px-1">Confirm delete?</span>
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

        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xl font-bold bg-transparent border-b border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none text-slate-900 py-1"
          />
        </div>

        {/* Date Selector with Presets */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <QuickDateSelector value={dueDate} onChange={setDueDate} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="not-started">Not Started</option>
              <option value="in-progress">In Progress</option>
              <option value="waiting">Waiting</option>
              <option value="blocked">Blocked</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🔵 Low</option>
              <option value="none">⚪ None</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
              <span>🔔 Reminder Alert</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
              />
              {dueTime && (
                <button
                  type="button"
                  onClick={() => setDueTime('')}
                  title="Clear Reminder Alert"
                  className="px-1.5 py-1 text-[11px] text-slate-400 hover:text-rose-600 rounded border border-slate-200 hover:border-rose-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
              <Repeat className="w-3 h-3 text-indigo-600" />
              Recurrence
            </label>
            <select
              value={recurringPattern}
              onChange={(e) => setRecurringPattern(e.target.value as RecurringPattern)}
              className="w-full px-2 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Every day (Daily)</option>
              <option value="weekly">Every week (Weekly)</option>
              <option value="monthly">Every month (Monthly)</option>
            </select>
          </div>
        </div>

        {status === 'waiting' && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> Waiting For Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Person waiting on (e.g. Sarah in Design)"
                value={waitingPerson}
                onChange={(e) => setWaitingPerson(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-amber-200 rounded-lg text-slate-900"
              />
              <input
                type="text"
                placeholder="Notes on request / expected date"
                value={waitingNote}
                onChange={(e) => setWaitingNote(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white border border-amber-200 rounded-lg text-slate-900"
              />
            </div>
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description & Overview</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this task about?"
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Notes, Information & Context</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes, background info, links, thoughts..."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-slate-900"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-indigo-600" />
              Subtasks & Steps
            </label>
            {checklist.length > 0 && (
              <span className="text-[11px] font-semibold text-slate-500">
                {checklist.filter((c) => c.completed).length} of {checklist.length} ({Math.round((checklist.filter((c) => c.completed).length / checklist.length) * 100)}%)
              </span>
            )}
          </div>

          {checklist.length > 0 && (
            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2.5 overflow-hidden">
              <div
                className="bg-indigo-600 h-full transition-all duration-200"
                style={{
                  width: `${Math.round((checklist.filter((c) => c.completed).length / checklist.length) * 100)}%`,
                }}
              />
            </div>
          )}

          <div className="space-y-1.5 mb-2">
            {checklist.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <label className="flex items-center gap-2 cursor-pointer min-w-0 flex-1">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleChecklist(item.id)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className={item.completed ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                    {item.title}
                  </span>
                </label>
                <button type="button" onClick={() => handleRemoveChecklist(item.id)} className="text-slate-400 hover:text-rose-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add subtask item..."
              value={newChecklistTitle}
              onChange={(e) => setNewChecklistTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChecklistItem();
                }
              }}
              className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
            />
            <Button size="sm" variant="secondary" onClick={handleAddChecklistItem}>
              Add Item
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-2">Reference Links</label>
          <div className="space-y-1.5 mb-2">
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-indigo-600 hover:underline font-semibold truncate"
                >
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                  {link.title || link.url}
                </a>
                <button onClick={() => handleRemoveLink(link.id)} className="text-slate-400 hover:text-rose-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Link title"
              value={newLinkTitle}
              onChange={(e) => setNewLinkTitle(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
            />
            <input
              type="url"
              placeholder="https://..."
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
            />
            <Button size="sm" variant="secondary" onClick={handleAddLink}>
              Add Link
            </Button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Tags (Comma-separated)</label>
          <input
            type="text"
            placeholder="Strategy, Review, Q4"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-slate-200">
          <span className="text-[11px] text-slate-400">
            Created {formatDateTime(task.createdAt)}
          </span>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={closeTaskDetail}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
