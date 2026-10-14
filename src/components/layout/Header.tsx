'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Search, Plus, Menu, DatabaseCheck, Bell } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { AlertsDropdown } from '@/components/common/AlertsDropdown';
import { getTodayString } from '@/lib/utils/date';

export function Header() {
  const pathname = usePathname();
  const {
    tasks,
    followUps,
    toggleSidebar,
    openCommandPalette,
    openQuickAdd,
    notificationPermission,
    requestAlertPermission,
    triggerTestNotification,
  } = useApp();

  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // Compute active alert items
  const todayStr = getTodayString();
  const overdueTasks = tasks.filter((t) => t.status !== 'completed' && t.dueDate && t.dueDate < todayStr);
  const dueTodayTasks = tasks.filter((t) => t.status !== 'completed' && t.dueDate === todayStr);
  const reminderTasks = tasks.filter((t) => t.status !== 'completed' && t.reminder && !t.reminder.dismissed);
  const dueFollowUps = followUps.filter((f) => f.status === 'pending' && f.nextFollowUpDate && f.nextFollowUpDate <= todayStr);

  const totalAlerts = overdueTasks.length + dueTodayTasks.length + reminderTasks.length + dueFollowUps.length;

  const getBreadcrumbTitle = (path: string) => {
    if (path === '/') return 'My Day';
    if (path === '/tasks') return 'Task Management Hub';
    if (path === '/completed') return 'Completed Tasks Archive';
    if (path === '/notes') return 'Knowledge & Journal Hub';
    if (path === '/weekly-review') return 'Guided Weekly Review';
    if (path === '/settings') return 'Settings & Backup';
    return 'Executive Workspace';
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between transition-colors">
      {/* Left: Mobile Menu & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle Navigation Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base font-bold text-slate-900 tracking-tight">
            {getBreadcrumbTitle(pathname)}
          </h1>
        </div>
      </div>

      {/* Middle: Global Search Trigger */}
      <div className="hidden sm:flex flex-1 max-w-md mx-6">
        <button
          onClick={openCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 bg-slate-100/80 border border-slate-200 rounded-lg hover:border-indigo-400 hover:text-slate-600 transition-all shadow-2xs"
        >
          <span className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search tasks, notes, meetings...</span>
          </span>
          <kbd className="px-1.5 py-0.5 font-mono text-[10px] text-slate-500 bg-white border border-slate-200 rounded shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Local Save Status Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full">
          <DatabaseCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Local Offline DB</span>
        </div>

        {/* Alerts & Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setIsAlertsOpen((prev) => !prev)}
            aria-label="View notifications and alerts"
            className={`relative p-2 rounded-xl border transition-all ${
              isAlertsOpen
                ? 'bg-indigo-50 border-indigo-300 text-indigo-600'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
            }`}
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-red-600 rounded-full ring-2 ring-white animate-pulse">
                {totalAlerts > 99 ? '99+' : totalAlerts}
              </span>
            )}
          </button>

          <AlertsDropdown
            isOpen={isAlertsOpen}
            onClose={() => setIsAlertsOpen(false)}
            overdueTasks={overdueTasks}
            dueTodayTasks={dueTodayTasks}
            reminderTasks={reminderTasks}
            dueFollowUps={dueFollowUps}
            notificationPermission={notificationPermission}
            onRequestPermission={requestAlertPermission}
            onTestNotification={triggerTestNotification}
          />
        </div>

        {/* Quick Add Button */}
        <Button
          onClick={() => openQuickAdd()}
          variant="primary"
          size="sm"
          className="gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
          icon={<Plus className="w-4 h-4" />}
        >
          <span className="hidden sm:inline">Add Task</span>
        </Button>

        {/* Workspace Profile Icon */}
        <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-xs font-bold text-indigo-700 shadow-2xs">
            EX
          </div>
        </div>
      </div>
    </header>
  );
}

