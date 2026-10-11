'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskBoard } from '@/components/tasks/TaskBoard';
import { Button } from '@/components/common/Button';
import { Card, CardHeader, CardTitle } from '@/components/common/Card';
import { TaskItem } from '@/components/tasks/TaskItem';
import { EmptyState } from '@/components/common/EmptyState';
import { isOverdue, isDueToday, isDueTomorrow, isDueInNext7Days, formatNiceDate } from '@/lib/utils/date';
import { List, LayoutGrid, Plus, CheckSquare, Calendar, Clock, CheckCircle2, Trash2 } from 'lucide-react';

export default function TasksPage() {
  const { tasks, followUps, updateFollowUp, deleteFollowUp, isLoading, openQuickAdd } = useApp();
  
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'waiting' | 'completed'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  const activeTasks = tasks;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  // Sub-tab calculations
  const overdueTasks = activeTasks.filter((t) => isOverdue(t.dueDate, t.status));
  const todayTasks = activeTasks.filter((t) => isDueToday(t.dueDate));
  const tomorrowTasks = activeTasks.filter((t) => isDueTomorrow(t.dueDate));
  const next7DaysTasks = activeTasks.filter((t) => isDueInNext7Days(t.dueDate) && !isDueTomorrow(t.dueDate));
  const laterTasks = activeTasks.filter(
    (t) => t.dueDate && !isOverdue(t.dueDate, t.status) && !isDueToday(t.dueDate) && !isDueTomorrow(t.dueDate) && !isDueInNext7Days(t.dueDate)
  );

  const pendingFollowUps = followUps.filter((f) => f.status === 'pending');
  const completedTasks = tasks.filter((t) => t.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Navigation Tabs Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-500" />
            Task Management Hub
          </h2>

          {/* Sub-Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                activeTab === 'all'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Tasks ({activeTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                activeTab === 'upcoming'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Deadlines & Upcoming
            </button>
            <button
              onClick={() => setActiveTab('waiting')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                activeTab === 'waiting'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Waiting For ({pendingFollowUps.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors shrink-0 ${
                activeTab === 'completed'
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Completed ({completedTasks.length})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeTab === 'all' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 text-xs rounded-md ${viewMode === 'list' ? 'bg-white text-indigo-600' : 'text-slate-400'}`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('board')}
                className={`p-1.5 text-xs rounded-md ${viewMode === 'board' ? 'bg-white text-indigo-600' : 'text-slate-400'}`}
                title="Board View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          )}

          <Button
            onClick={() => openQuickAdd()}
            variant="primary"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500"
            icon={<Plus className="w-4 h-4" />}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Tab 1: All Tasks */}
      {activeTab === 'all' && (
        viewMode === 'list' ? <TaskList tasks={activeTasks} /> : <TaskBoard tasks={activeTasks} />
      )}

      {/* Tab 2: Upcoming & Deadlines */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {overdueTasks.length > 0 && (
            <Card className="border-rose-300 bg-rose-50/20">
              <CardHeader>
                <CardTitle className="text-rose-600">Overdue Tasks ({overdueTasks.length})</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle>Today ({todayTasks.length})</CardTitle></CardHeader>
            {todayTasks.length === 0 ? <p className="text-xs text-slate-400">No tasks due today.</p> : (
              <div className="space-y-2">{todayTasks.map((t) => <TaskItem key={t.id} task={t} />)}</div>
            )}
          </Card>

          <Card>
            <CardHeader><CardTitle>Tomorrow ({tomorrowTasks.length})</CardTitle></CardHeader>
            {tomorrowTasks.length === 0 ? <p className="text-xs text-slate-400">No tasks due tomorrow.</p> : (
              <div className="space-y-2">{tomorrowTasks.map((t) => <TaskItem key={t.id} task={t} />)}</div>
            )}
          </Card>

          <Card>
            <CardHeader><CardTitle>Next 7 Days ({next7DaysTasks.length})</CardTitle></CardHeader>
            {next7DaysTasks.length === 0 ? <p className="text-xs text-slate-400">No tasks due in next 7 days.</p> : (
              <div className="space-y-2">{next7DaysTasks.map((t) => <TaskItem key={t.id} task={t} />)}</div>
            )}
          </Card>
        </div>
      )}

      {/* Tab 3: Waiting For */}
      {activeTab === 'waiting' && (
        <div className="space-y-3">
          {pendingFollowUps.length === 0 ? (
            <EmptyState
              icon={<Clock className="w-6 h-6 text-amber-500" />}
              title="No pending follow-ups"
              description="You are not currently waiting on responses or deliverables from colleagues."
            />
          ) : (
            pendingFollowUps.map((item) => (
              <Card key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                      Waiting on {item.person}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">Requested: {formatNiceDate(item.requestedDate)} · Next Follow-up: {formatNiceDate(item.nextFollowUpDate)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateFollowUp(item.id, { status: 'received' })}>
                    Mark Received
                  </Button>
                  <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => deleteFollowUp(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Tab 4: Completed */}
      {activeTab === 'completed' && (
        <div className="space-y-2">
          {completedTasks.length === 0 ? (
            <EmptyState title="No completed tasks" description="Completed tasks will be archived here." />
          ) : (
            completedTasks.map((t) => <TaskItem key={t.id} task={t} />)
          )}
        </div>
      )}
    </div>
  );
}
