'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Search, Plus, Menu, DatabaseCheck, Shield } from 'lucide-react';
import { Button } from '@/components/common/Button';

export function Header() {
  const pathname = usePathname();
  const { toggleSidebar, openCommandPalette, openQuickAdd } = useApp();

  const getBreadcrumbTitle = (path: string) => {
    if (path === '/') return 'My Day';
    if (path === '/inbox') return 'Inbox';
    if (path === '/tasks') return 'Task Management Hub';
    if (path === '/projects') return 'Projects';
    if (path.startsWith('/projects/')) return 'Project Overview';
    if (path === '/notes') return 'Knowledge & Journal Hub';
    if (path === '/weekly-review') return 'Guided Weekly Review';
    if (path === '/settings') return 'Settings & Backup';
    return 'Workspace';
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
            <span>Search tasks, projects, notes...</span>
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
          <span>Local IndexedDB</span>
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
