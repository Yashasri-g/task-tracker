'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { getTodayString } from '@/lib/utils/date';
import type { TaskPriority, TaskStatus, TaskType, RecurringPattern } from '@/types';
import { ChevronDown, ChevronUp, Repeat, Plus, X } from 'lucide-react';
import { QuickDateSelector } from '@/components/common/QuickDateSelector';

export function QuickAddModal() {
  const { isQuickAddOpen, closeQuickAdd, quickAddDefaults, createTask } = useApp();

  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [reminderTime, setReminderTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [status, setStatus] = useState<TaskStatus>('not-started');
  const [taskType, setTaskType] = useState<TaskType>('task');
  const [personInvolved, setPersonInvolved] = useState('');
  const [notes, setNotes] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [recurringPattern, setRecurringPattern] = useState<RecurringPattern>('none');

  const [subtaskInputs, setSubtaskInputs] = useState<string[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const [showMoreFields, setShowMoreFields] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isQuickAddOpen) {
      setTitle(quickAddDefaults?.title || '');
      setDueDate(quickAddDefaults?.dueDate || getTodayString());
      setReminderTime(quickAddDefaults?.reminder?.time || quickAddDefaults?.dueTime || '');
      setPriority(quickAddDefaults?.priority || 'medium');
      setStatus(quickAddDefaults?.status || 'not-started');
      setTaskType(quickAddDefaults?.taskType || 'task');
      setPersonInvolved(quickAddDefaults?.personInvolved || '');
      setNotes(quickAddDefaults?.notes || '');
      setLinkUrl('');
      setRecurringPattern('none');
      setSubtaskInputs([]);
      setNewSubtaskTitle('');
      setShowMoreFields(false);

      setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
    }
  }, [isQuickAddOpen, quickAddDefaults]);

  const handleAddSubtaskInput = () => {
    if (!newSubtaskTitle.trim()) return;
    setSubtaskInputs([...subtaskInputs, newSubtaskTitle.trim()]);
    setNewSubtaskTitle('');
  };

  const handleRemoveSubtaskInput = (index: number) => {
    setSubtaskInputs(subtaskInputs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const links = linkUrl.trim()
      ? [{ id: `link_${Date.now()}`, title: 'Reference', url: linkUrl.trim() }]
      : [];

    const checklist = subtaskInputs.map((stTitle, i) => ({
      id: `chk_${Date.now()}_${i}`,
      title: stTitle,
      completed: false,
    }));

    const reminder = reminderTime
      ? {
          date: dueDate || getTodayString(),
          time: reminderTime,
          dismissed: false,
        }
      : undefined;

    await createTask({
      title: title.trim(),
      dueDate: dueDate || undefined,
      dueTime: reminderTime || undefined,
      reminder,
      priority,
      status,
      taskType,
      personInvolved: personInvolved.trim() || undefined,
      notes: notes.trim() || undefined,
      links,
      checklist,
      dependencies: [],
      tags: [],
      recurringPattern,
      inInbox: false,
    });

    closeQuickAdd();
  };

  return (
    <Modal
      isOpen={isQuickAddOpen}
      onClose={closeQuickAdd}
      title="Quick Capture Task"
      description="Capture a task or commitment immediately. Save now, organize details later."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            ref={titleInputRef}
            type="text"
            required
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3.5 py-2.5 text-base font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder-slate-400"
          />
        </div>

        {/* Date Selector with Presets */}
        <QuickDateSelector value={dueDate} onChange={setDueDate} />

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="urgent">🔴 Urgent</option>
              <option value="high">🟠 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🔵 Low</option>
              <option value="none">⚪ None</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <span>🔔 Reminder Alert</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
              {reminderTime && (
                <button
                  type="button"
                  onClick={() => setReminderTime('')}
                  title="Clear Reminder Alert"
                  className="px-1.5 py-1 text-[11px] text-slate-400 hover:text-rose-600 rounded border border-slate-200 hover:border-rose-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <Repeat className="w-3 h-3 text-indigo-600" />
              Recurrence
            </label>
            <select
              value={recurringPattern}
              onChange={(e) => setRecurringPattern(e.target.value as RecurringPattern)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Every day (Daily)</option>
              <option value="weekly">Every week (Weekly)</option>
              <option value="monthly">Every month (Monthly)</option>
            </select>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowMoreFields(!showMoreFields)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:underline focus:outline-none"
          >
            {showMoreFields ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {showMoreFields ? 'Hide additional fields' : 'Add subtasks, person involved, notes, or reference link'}
          </button>
        </div>

        {showMoreFields && (
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3 animate-in fade-in duration-150">
            {/* Subtasks / Checklist builder */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600">Subtasks & Steps</label>
              {subtaskInputs.length > 0 && (
                <div className="space-y-1">
                  {subtaskInputs.map((sub, index) => (
                    <div key={index} className="flex items-center justify-between px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs text-slate-800">
                      <span>• {sub}</span>
                      <button type="button" onClick={() => handleRemoveSubtaskInput(index)} className="text-slate-400 hover:text-rose-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Add a subtask step..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtaskInput();
                    }
                  }}
                  className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button type="button" size="sm" variant="outline" onClick={handleAddSubtaskInput} icon={<Plus className="w-3.5 h-3.5" />}>
                  Add Step
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Person Involved / Assignee</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={personInvolved}
                  onChange={(e) => setPersonInvolved(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Task Type</label>
                <select
                  value={taskType}
                  onChange={(e) => setTaskType(e.target.value as TaskType)}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="task">Standard Task</option>
                  <option value="commitment">Commitment</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="idea">Idea / Note</option>
                  <option value="deliverable">Major Deliverable</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Reference Link URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Notes / Context</label>
              <textarea
                rows={2}
                placeholder="Additional details..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={closeQuickAdd}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
            Save Task
          </Button>
        </div>
      </form>
    </Modal>
  );
}
