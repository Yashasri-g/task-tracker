'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { TaskItem } from '@/components/tasks/TaskItem';
import { selectOverdueTasks } from '@/lib/selectors';
import { getTodayString } from '@/lib/utils/date';
import { RotateCw, CheckCircle2, AlertTriangle, Clock, Sparkles, Copy, ArrowRight } from 'lucide-react';

export default function WeeklyReviewPage() {
  const { tasks, followUps, showToast, updatePreferences, isLoading } = useApp();
  const [step, setStep] = useState(1);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const overdueTasks = selectOverdueTasks(tasks);
  const pendingFollowUps = followUps.filter((f) => f.status === 'pending');

  const handleCopyWeeklySummary = () => {
    const text = `=== EXECUTIVE WEEKLY WORK SUMMARY ===
Date: ${getTodayString()}

1. KEY COMPLETED DELIVERABLES (${completedTasks.length})
${completedTasks.map((t) => ` - ${t.title}`).join('\n')}

2. OPEN FOLLOW-UPS & WAITING ITEMS (${pendingFollowUps.length})
${pendingFollowUps.map((f) => ` - Waiting on ${f.person}: ${f.title}`).join('\n')}

3. OUTSTANDING PRIORITIES FOR NEXT WEEK (${overdueTasks.length + 3})
${overdueTasks.map((t) => ` - [OVERDUE] ${t.title}`).join('\n')}`;

    navigator.clipboard.writeText(text);
    showToast('Weekly Summary Copied', 'Executive summary text ready for email or Slack update.');
  };

  const handleFinishReview = async () => {
    await updatePreferences({ lastReviewDate: getTodayString() });
    showToast('Weekly Review Complete', 'Workspace priorities aligned for next week.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Executive Light Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-50/90 via-white to-slate-50 text-slate-900 rounded-2xl shadow-2xs border border-indigo-100">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
          <RotateCw className="w-4 h-4" />
          <span>Guided Productivity Workflow</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight mt-1 text-slate-900">Guided Weekly Review</h2>
        <p className="text-xs text-slate-600 mt-1 max-w-xl">
          Derived from actual stored items in your IndexedDB workspace. Clean up past work and set clear focus for the upcoming week.
        </p>
      </div>

      {/* Wizard Step Navigation */}
      <div className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl text-xs font-semibold">
        <button
          onClick={() => setStep(1)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            step === 1 ? 'bg-indigo-100 text-indigo-800 font-bold border border-indigo-200' : 'text-slate-500'
          }`}
        >
          1. Completed Work ({completedTasks.length})
        </button>
        <button
          onClick={() => setStep(2)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            step === 2 ? 'bg-indigo-100 text-indigo-800 font-bold border border-indigo-200' : 'text-slate-500'
          }`}
        >
          2. Overdue Triage ({overdueTasks.length})
        </button>
        <button
          onClick={() => setStep(3)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            step === 3 ? 'bg-indigo-100 text-indigo-800 font-bold border border-indigo-200' : 'text-slate-500'
          }`}
        >
          3. Follow-ups ({pendingFollowUps.length})
        </button>
        <button
          onClick={() => setStep(4)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            step === 4 ? 'bg-indigo-100 text-indigo-800 font-bold border border-indigo-200' : 'text-slate-500'
          }`}
        >
          4. Executive Summary
        </button>
      </div>

      {/* Step Contents */}
      <Card className="p-6 space-y-4">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" /> 1. Celebrate & Review Completed Deliverables
            </h3>
            <p className="text-xs text-slate-500">
              Here are all the items completed in your workspace. Acknowledge your team accomplishments before setting next week&apos;s targets.
            </p>
            <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
              {completedTasks.map((t) => (
                <TaskItem key={t.id} task={t} />
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" /> 2. Process Overdue & Unfinished Tasks
            </h3>
            <p className="text-xs text-slate-500">
              Triage tasks that missed their target deadlines. Reschedule, reprioritize, or mark them done.
            </p>
            {overdueTasks.length === 0 ? (
              <p className="text-xs text-emerald-600 font-medium p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                ✨ No overdue tasks! All commitments are up to date.
              </p>
            ) : (
              <div className="space-y-2 max-h-[350px] overflow-y-auto custom-scrollbar">
                {overdueTasks.map((t) => (
                  <TaskItem key={t.id} task={t} />
                ))}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> 3. Check Waiting For & Outstanding Follow-ups
            </h3>
            <p className="text-xs text-slate-500">
              Review commitments pending response from colleagues.
            </p>
            <div className="space-y-2">
              {pendingFollowUps.map((f) => (
                <div key={f.id} className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl text-xs flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-slate-900">{f.title}</h4>
                    <p className="text-slate-500">Waiting on {f.person} · Follow-up {f.nextFollowUpDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" /> 4. Executive Weekly Work Summary
            </h3>
            <p className="text-xs text-slate-500">
              Copy a concise, professional summary derived from your actual stored data to share with your manager or team.
            </p>
            <div className="p-4 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-xs font-mono whitespace-pre-wrap">
              {`=== EXECUTIVE WEEKLY WORK SUMMARY ===
Date: ${getTodayString()}

1. KEY COMPLETED DELIVERABLES (${completedTasks.length})
${completedTasks.map((t) => ` - ${t.title}`).join('\n')}

2. OPEN FOLLOW-UPS & WAITING ITEMS (${pendingFollowUps.length})
${pendingFollowUps.map((f) => ` - Waiting on ${f.person}: ${f.title}`).join('\n')}

3. OUTSTANDING PRIORITIES FOR NEXT WEEK (${overdueTasks.length + 3})
${overdueTasks.map((t) => ` - [OVERDUE] ${t.title}`).join('\n')}`}
            </div>
            <div className="flex gap-2">
              <Button variant="primary" size="sm" onClick={handleCopyWeeklySummary} className="bg-indigo-600 hover:bg-indigo-700 text-white" icon={<Copy className="w-4 h-4" />}>
                Copy Executive Summary Text
              </Button>
              <Button variant="secondary" size="sm" onClick={handleFinishReview}>
                Complete Weekly Review
              </Button>
            </div>
          </div>
        )}

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <Button variant="outline" size="sm" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : <span />}

          {step < 4 && (
            <Button variant="primary" size="sm" onClick={() => setStep(step + 1)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              Next Step <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
