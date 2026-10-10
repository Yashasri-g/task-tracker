'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { Modal } from '@/components/common/Modal';
import { getTodayString, formatNiceDate } from '@/lib/utils/date';
import type { FollowUp } from '@/types';
import { Clock, CheckCircle2, User, Plus, Calendar, ArrowRight, Trash2 } from 'lucide-react';

export default function WaitingForPage() {
  const { followUps, createFollowUp, updateFollowUp, deleteFollowUp, isLoading } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [person, setPerson] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setNextFollowUpDate(getTodayString());
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const pendingFollowUps = followUps.filter((f) => f.status === 'pending');
  const receivedFollowUps = followUps.filter((f) => f.status === 'received');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !person.trim()) return;

    await createFollowUp({
      title: title.trim(),
      person: person.trim(),
      requestedDate: getTodayString(),
      expectedResponseDate: expectedDate || undefined,
      nextFollowUpDate: nextFollowUpDate || getTodayString(),
      status: 'pending',
      notes: notes.trim() || undefined,
      links: [],
    });

    setTitle('');
    setPerson('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            Waiting For & Follow-ups ({pendingFollowUps.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track deliverables and responses promised by colleagues so nothing slips through the cracks.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          variant="primary"
          size="sm"
          className="bg-amber-600 hover:bg-amber-500 text-white"
          icon={<Plus className="w-4 h-4" />}
        >
          Track New Follow-up
        </Button>
      </div>

      {/* Pending Items */}
      {pendingFollowUps.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
          title="No pending follow-ups"
          description="You are not currently waiting on any pending responses or deliverables from colleagues."
          actionLabel="Track New Follow-up"
          onAction={() => setIsAddModalOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {pendingFollowUps.map((item) => (
            <Card key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                    Waiting on {item.person}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>Requested: {formatNiceDate(item.requestedDate)}</span>
                  <span>Next Follow-up: <strong className="text-amber-600">{formatNiceDate(item.nextFollowUpDate)}</strong></span>
                </div>

                {item.notes && <p className="text-xs text-slate-600 font-mono mt-1">{item.notes}</p>}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-emerald-700 hover:bg-emerald-50 border-emerald-300"
                  onClick={() => updateFollowUp(item.id, { status: 'received' })}
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  Mark Received
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="text-rose-600 hover:bg-rose-50"
                  onClick={() => deleteFollowUp(item.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Completed/Received History */}
      {receivedFollowUps.length > 0 && (
        <Card className="p-4 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recently Resolved Follow-ups ({receivedFollowUps.length})</h3>
          <div className="space-y-2">
            {receivedFollowUps.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg text-xs opacity-75">
                <span className="line-through text-slate-500">{item.title} (With {item.person})</span>
                <span className="text-emerald-600 font-medium">Received</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Follow-up Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Track Waiting Item / Follow-up">
        <form onSubmit={handleCreate} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">What are you waiting for?</label>
            <input
              type="text"
              required
              placeholder="e.g. Approved Q4 budget spreadsheet"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Person / Team</label>
              <input
                type="text"
                required
                placeholder="e.g. Jordan (Finance)"
                value={person}
                onChange={(e) => setPerson(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Next Follow-up Date</label>
              <input
                type="date"
                value={nextFollowUpDate}
                onChange={(e) => setNextFollowUpDate(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1">Notes / Context</label>
            <textarea
              rows={2}
              placeholder="Details on request..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" className="bg-amber-600 hover:bg-amber-500 text-white">
              Save Follow-up
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
