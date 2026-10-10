'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { EmptyState } from '@/components/common/EmptyState';
import { getTodayString } from '@/lib/utils/date';
import type { Meeting, MeetingActionItem } from '@/types';
import { Users, Plus, Calendar, CheckSquare, Trash2, CheckCircle2 } from 'lucide-react';

export default function MeetingsPage() {
  const { meetings, projects, createMeeting, deleteMeeting, updateMeeting, createTask, isLoading } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [participants, setParticipants] = useState('');
  const [agenda, setAgenda] = useState('');
  const [notes, setNotes] = useState('');
  const [decisions, setDecisions] = useState('');
  const [actionItemInput, setActionItemInput] = useState('');
  const [actionItems, setActionItems] = useState<MeetingActionItem[]>([]);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    setDate(getTodayString());
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const handleAddActionItem = () => {
    if (!actionItemInput.trim()) return;
    const item: MeetingActionItem = {
      id: `act_${Date.now()}`,
      title: actionItemInput.trim(),
      completed: false,
    };
    setActionItems([...actionItems, item]);
    setActionItemInput('');
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const partArr = participants
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const decArr = decisions
      .split('\n')
      .map((d) => d.trim())
      .filter((d) => d.length > 0);

    await createMeeting({
      title: title.trim(),
      date: date || getTodayString(),
      time: time || undefined,
      participants: partArr,
      agenda: agenda.trim() || undefined,
      notes: notes.trim(),
      decisions: decArr,
      actionItems,
      projectId: projectId || undefined,
    });

    setTitle('');
    setNotes('');
    setParticipants('');
    setDecisions('');
    setActionItems([]);
    setIsModalOpen(false);
  };

  const handleConvertActionItemToTask = async (meeting: Meeting, actionItem: MeetingActionItem) => {
    const task = await createTask({
      title: actionItem.title,
      description: `Action item from meeting "${meeting.title}" on ${meeting.date}`,
      dueDate: getTodayString(),
      priority: 'high',
      taskType: 'task',
      status: 'not-started',
      projectId: meeting.projectId,
      links: [],
      checklist: [],
      dependencies: [],
      tags: ['Meeting Action'],
      inInbox: false,
    });

    const updatedActionItems = meeting.actionItems.map((a) =>
      a.id === actionItem.id ? { ...a, convertedTaskId: task.id } : a
    );

    await updateMeeting(meeting.id, { actionItems: updatedActionItems });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Meeting Notes & Action Items ({meetings.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log meeting agendas, decisions, and turn action items into executable tasks with one click.
          </p>
        </div>

        <Button
          onClick={() => setIsModalOpen(true)}
          variant="primary"
          size="sm"
          className="bg-purple-600 hover:bg-purple-500 text-white"
          icon={<Plus className="w-4 h-4" />}
        >
          Log Meeting
        </Button>
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-purple-500" />}
          title="No meetings logged yet"
          description="Keep track of key discussions, decisions, and action items from team syncs."
          actionLabel="Log Meeting"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <Card key={meeting.id} className="p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{meeting.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    <span>{meeting.date} {meeting.time ? `@ ${meeting.time}` : ''}</span>
                    {meeting.participants.length > 0 && (
                      <span>Participants: <strong className="text-slate-700">{meeting.participants.join(', ')}</strong></span>
                    )}
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50"
                  onClick={() => deleteMeeting(meeting.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {meeting.notes && (
                  <div className="space-y-1">
                    <h4 className="font-semibold text-slate-700">Notes & Discussion</h4>
                    <p className="p-3 bg-slate-50 rounded-xl whitespace-pre-wrap text-slate-600">{meeting.notes}</p>
                  </div>
                )}

                {meeting.decisions.length > 0 && (
                  <div className="space-y-1">
                    <h4 className="font-semibold text-purple-700">Key Decisions Made</h4>
                    <ul className="p-3 bg-purple-50/50 rounded-xl space-y-1 text-purple-900">
                      {meeting.decisions.map((d, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="font-bold">•</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {meeting.actionItems.length > 0 && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700">Action Items</h4>
                  <div className="space-y-1.5">
                    {meeting.actionItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs">
                        <span className="font-medium text-slate-800">{item.title}</span>
                        {item.convertedTaskId ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Converted to Task
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleConvertActionItemToTask(meeting, item)}
                            className="text-[11px] gap-1 py-1"
                          >
                            <CheckSquare className="w-3 h-3 text-indigo-500" /> Convert to Task
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Log Meeting Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Meeting Record" maxWidth="xl">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Meeting Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Q4 Executive Alignment & Product Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Participants (Comma-separated)</label>
              <input
                type="text"
                placeholder="Alex, Jordan, Marcus"
                value={participants}
                onChange={(e) => setParticipants(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Meeting Notes</label>
            <textarea
              rows={3}
              placeholder="Main discussion points..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Key Decisions Made (One per line)</label>
            <textarea
              rows={2}
              placeholder="- Approved full design system overhaul"
              value={decisions}
              onChange={(e) => setDecisions(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Action Items</label>
            <div className="space-y-1 mb-2">
              {actionItems.map((item) => (
                <div key={item.id} className="p-2 bg-slate-100 text-xs rounded-lg">
                  {item.title}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Add action item..."
                value={actionItemInput}
                onChange={(e) => setActionItemInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
              <Button type="button" size="sm" variant="secondary" onClick={handleAddActionItem}>
                Add Action
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
              Save Meeting Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
