'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { TaskItem } from '@/components/tasks/TaskItem';
import { Card, CardHeader, CardTitle } from '@/components/common/Card';
import { isOverdue, isDueToday, isDueTomorrow, isDueInNext7Days } from '@/lib/utils/date';
import { Calendar, AlertTriangle, Clock, AlertCircle } from 'lucide-react';

export default function UpcomingPage() {
  const { tasks, isLoading } = useApp();

  const activeTasks = tasks.filter((t) => !t.inInbox && t.status !== 'completed');

  const overdueTasks = activeTasks.filter((t) => isOverdue(t.dueDate, t.status));
  const todayTasks = activeTasks.filter((t) => isDueToday(t.dueDate));
  const tomorrowTasks = activeTasks.filter((t) => isDueTomorrow(t.dueDate));
  const next7DaysTasks = activeTasks.filter((t) => isDueInNext7Days(t.dueDate) && !isDueTomorrow(t.dueDate));
  const laterTasks = activeTasks.filter(
    (t) => t.dueDate && !isOverdue(t.dueDate, t.status) && !isDueToday(t.dueDate) && !isDueTomorrow(t.dueDate) && !isDueInNext7Days(t.dueDate)
  );
  const noDeadlineTasks = activeTasks.filter((t) => !t.dueDate);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          Deadlines & Upcoming Schedule
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Chronologically grouped view of upcoming commitments, deadlines, and overdue tasks.
        </p>
      </div>

      {/* Overdue Section */}
      {overdueTasks.length > 0 && (
        <Card className="border-rose-300 bg-rose-50/20">
          <CardHeader>
            <CardTitle className="text-rose-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Overdue & At Risk ({overdueTasks.length})
            </CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {overdueTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </Card>
      )}

      {/* Today */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-600">
            <Clock className="w-4 h-4" /> Today ({todayTasks.length})
          </CardTitle>
        </CardHeader>
        {todayTasks.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No tasks due today.</p>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </Card>

      {/* Tomorrow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Tomorrow ({tomorrowTasks.length})</CardTitle>
        </CardHeader>
        {tomorrowTasks.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No tasks due tomorrow.</p>
        ) : (
          <div className="space-y-2">
            {tomorrowTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </Card>

      {/* Next 7 Days */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">Next 7 Days ({next7DaysTasks.length})</CardTitle>
        </CardHeader>
        {next7DaysTasks.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No tasks scheduled for the next 7 days.</p>
        ) : (
          <div className="space-y-2">
            {next7DaysTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        )}
      </Card>

      {/* Later */}
      {laterTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Later ({laterTasks.length})</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {laterTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </Card>
      )}

      {/* No Deadline */}
      {noDeadlineTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-slate-500">No Deadline Assigned ({noDeadlineTasks.length})</CardTitle>
          </CardHeader>
          <div className="space-y-2">
            {noDeadlineTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
