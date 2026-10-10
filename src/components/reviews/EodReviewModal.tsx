'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { getTodayString } from '@/lib/utils/date';
import { format, addDays } from 'date-fns';
import { CheckCircle2, Moon, Calendar, ArrowRight, CheckSquare, Plus } from 'lucide-react';

export function EodReviewModal() {
  const {
    isEodReviewOpen,
    closeEodReview,
    tasks,
    followUps,
    toggleTaskCompletion,
    updateTask,
    createTask,
    updatePreferences,
    showToast,
  } = useApp();

  const [step, setStep] = useState(1);
  const [newQuickTitle, setNewQuickTitle] = useState('');
  const [today, setToday] = useState('');
  const [tomorrow, setTomorrow] = useState('');

  useEffect(() => {
    if (isEodReviewOpen) {
      const todayStr = getTodayString();
      setToday(todayStr);
      setTomorrow(format(addDays(new Date(), 1), 'yyyy-MM-dd'));
    }
  }, [isEodReviewOpen]);

  const todaysUnfinishedTasks = tasks.filter(
    (t) => !t.inInbox && t.status !== 'completed' && t.dueDate === today
  );

  if (!isEodReviewOpen) return null;

  const handleCarryForwardTomorrow = async (taskId: string) => {
    await updateTask(taskId, { dueDate: tomorrow });
    showToast('Task Rescheduled', 'Carried forward to tomorrow.');
  };

  const handleCompleteReview = async () => {
    await updatePreferences({ lastEodReviewDate: today });
    showToast('End-of-Day Review Complete', 'Great job today! Priorities prepared for tomorrow.', 'success');
    closeEodReview();
    setStep(1);
  };

  const handleAddTrackedItem = async () => {
    if (!newQuickTitle.trim()) return;
    await createTask({
      title: newQuickTitle.trim(),
      status: 'completed',
      priority: 'medium',
      taskType: 'task',
      completedAt: new Date().toISOString(),
      dueDate: today,
      links: [],
      checklist: [],
      dependencies: [],
      tags: [],
      inInbox: false,
    });
    setNewQuickTitle('');
  };

  return (
    <Modal
      isOpen={isEodReviewOpen}
      onClose={closeEodReview}
      title="End-of-Day Work Review"
      description="Reflect on today's progress and clear your mental slate for tomorrow."
      maxWidth="xl"
    >
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
          <span className="font-bold uppercase tracking-wider text-indigo-600">
            Step {step} of 3: {step === 1 ? "Today's Unfinished Work" : step === 2 ? "Log Missed Accomplishments" : "Tomorrow's Priorities"}
          </span>
          <span className="text-slate-400">5-minute evening routine</span>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Review tasks that were scheduled for today but remain unfinished. Mark them complete or carry them forward to tomorrow.
            </p>

            {todaysUnfinishedTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl font-medium">
                ✨ Excellent! You have no unfinished tasks scheduled for today.
              </div>
            ) : (
              <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar">
                {todaysUnfinishedTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <button onClick={() => toggleTaskCompletion(task)} className="text-slate-400 hover:text-emerald-600">
                        <CheckSquare className="w-4 h-4" />
                      </button>
                      <span className="font-medium text-slate-900 truncate">{task.title}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCarryForwardTomorrow(task.id)}
                      className="text-[11px] gap-1 shrink-0"
                    >
                      <Calendar className="w-3 h-3" /> Carry to Tomorrow
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Did you complete any unrecorded tasks, meetings, or commitments today? Add them now so your work history remains complete.
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Completed item title..."
                value={newQuickTitle}
                onChange={(e) => setNewQuickTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTrackedItem();
                  }
                }}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button size="sm" variant="secondary" onClick={handleAddTrackedItem} icon={<Plus className="w-3.5 h-3.5" />}>
                Record Completed
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              You are all set for tomorrow. Review your top priorities for tomorrow morning.
            </p>

            <div className="p-4 bg-indigo-50/80 border border-indigo-100 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-600" /> Mental Slate Cleared
              </h4>
              <p className="text-xs text-indigo-700">
                Shut down work with confidence knowing all your commitments, follow-ups, and daily notes are safely saved in local storage.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
              Previous
            </Button>
          ) : <span />}

          {step < 3 ? (
            <Button variant="primary" size="sm" onClick={() => setStep(step + 1)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Next Step <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={handleCompleteReview} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Complete EOD Review
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
