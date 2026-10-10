'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { selectMyDayStats, selectMyDayTasks, selectOverdueTasks, selectWaitingForTasks } from '@/lib/selectors';
import { getGreeting, getTodayString, getTimeOfDay, type TimeOfDay } from '@/lib/utils/date';
import { TaskItem } from '@/components/tasks/TaskItem';
import { Card, CardHeader, CardTitle } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { EmptyState } from '@/components/common/EmptyState';
import { format } from 'date-fns';
import {
  Sun,
  Sunset,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  Moon,
  ArrowRight,
  Flame,
  Calendar,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';

export default function MyDayPage() {
  const { tasks, followUps, isLoading, openQuickAdd, openEodReview } = useApp();

  const [formattedTodayDate, setFormattedTodayDate] = useState('Today');
  const [greeting, setGreeting] = useState('Good morning');
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [todayStr, setTodayStr] = useState('');

  useEffect(() => {
    setFormattedTodayDate(format(new Date(), 'EEEE, MMMM d, yyyy'));
    setGreeting(getGreeting());
    setTimeOfDay(getTimeOfDay());
    setTodayStr(getTodayString());
  }, []);

  const stats = selectMyDayStats(tasks, followUps);
  const priorityTasks = selectMyDayTasks(tasks);
  const overdueTasks = selectOverdueTasks(tasks);
  const waitingItems = selectWaitingForTasks(tasks);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Executive Light Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-indigo-50/90 via-white to-slate-50 text-slate-900 rounded-2xl border border-indigo-100/80 shadow-2xs relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
            {timeOfDay === 'morning' && <Sun className="w-4 h-4 text-amber-500 animate-pulse" />}
            {timeOfDay === 'afternoon' && <Sun className="w-4 h-4 text-amber-600" />}
            {timeOfDay === 'evening' && <Sunset className="w-4 h-4 text-amber-500" />}
            <span>{formattedTodayDate}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            {greeting}.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
            You have <span className="font-bold text-slate-900">{stats.dueTodayCount} tasks</span> due today and{' '}
            <span className="font-bold text-rose-600">{stats.overdueCount} overdue items</span> requiring attention.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0">
          <Button
            onClick={openEodReview}
            variant="outline"
            size="sm"
            className="bg-white hover:bg-slate-50 text-slate-700 border-slate-300"
            icon={<Moon className="w-4 h-4 text-indigo-600" />}
          >
            End-of-Day Review
          </Button>
          <Button
            onClick={() => openQuickAdd()}
            variant="primary"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            icon={<Plus className="w-4 h-4" />}
          >
            Quick Add Task
          </Button>
        </div>
      </div>

      {/* Work Overview Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Due Today</span>
            <Calendar className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{stats.dueTodayCount}</span>
            <span className="text-[11px] text-slate-400">Scheduled today</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Completed Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-emerald-600">{stats.completedTodayCount}</span>
            <span className="text-[11px] text-emerald-600 font-medium">Logged & Done</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-rose-600">{stats.overdueCount}</span>
            <span className="text-[11px] text-rose-600 font-medium">Needs Attention</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between p-4">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Pending Follow-ups</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-amber-600">{stats.followUpCount}</span>
            <span className="text-[11px] text-slate-400">Waiting on others</span>
          </div>
        </Card>
      </div>

      {/* Daily Progress Bar */}
      <div className="p-4 bg-white border border-slate-200/90 rounded-xl shadow-2xs space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-800 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" /> Daily Target Completion Progress
          </span>
          <span className="text-indigo-600 font-bold">{stats.progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-500 rounded-full"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-400">
          {stats.dueTodayCount + stats.completedTodayCount === 0
            ? 'No target tasks scheduled for today.'
            : `Calculated from ${stats.completedTodayCount} completed of ${stats.dueTodayCount + stats.completedTodayCount} total target tasks today.`}
        </p>
      </div>

      {/* Priority Tasks & Overdue Items */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-indigo-600" />
              Today&apos;s Priority Work
            </h3>
            <Link href="/tasks" className="text-xs font-semibold text-indigo-600 hover:underline flex items-center gap-1">
              View All Tasks <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {priorityTasks.length === 0 ? (
            <EmptyState
              icon={<Sun className="w-6 h-6 text-indigo-600" />}
              title="No pending tasks for today"
              description="Your schedule for today is clear! Add a new task or review upcoming work."
              actionLabel="Add Task for Today"
              onAction={() => openQuickAdd({ dueDate: todayStr })}
            />
          ) : (
            <div className="space-y-2.5">
              {priorityTasks.map((task) => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b-0 mb-0">
              <CardTitle className="text-sm text-rose-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Overdue Tasks ({overdueTasks.length})
              </CardTitle>
            </CardHeader>
            {overdueTasks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No overdue tasks. Clean slate!</p>
            ) : (
              <div className="space-y-2 mt-2">
                {overdueTasks.slice(0, 4).map((task) => (
                  <TaskItem key={task.id} task={task} showProject={false} />
                ))}
              </div>
            )}
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b-0 mb-0">
              <CardTitle className="text-sm flex items-center gap-1.5 text-amber-600">
                <Clock className="w-4 h-4 text-amber-500" />
                Waiting On Colleagues ({waitingItems.length})
              </CardTitle>
            </CardHeader>
            {waitingItems.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No pending follow-ups waiting on others.</p>
            ) : (
              <div className="space-y-2 mt-2">
                {waitingItems.slice(0, 3).map((task) => (
                  <div key={task.id} className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span className="truncate">{task.title}</span>
                    </div>
                    {task.waitingForDetails && (
                      <p className="text-slate-500">
                        Waiting on <span className="font-semibold text-slate-700">{task.waitingForDetails.person}</span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
