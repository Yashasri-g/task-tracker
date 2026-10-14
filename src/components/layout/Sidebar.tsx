'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { selectOverdueTasks } from '@/lib/selectors';
import {
  Sun,
  CheckSquare,
  FileText,
  RotateCw,
  Settings,
  Plus,
  Compass,
  X,
} from 'lucide-react';
import { Button } from '@/components/common/Button';

export function Sidebar() {
  const pathname = usePathname();
  const { tasks, isSidebarOpen, closeSidebar, openQuickAdd } = useApp();

  const overdueCount = selectOverdueTasks(tasks).length;

  const coreNav = [
    { label: 'My Day', href: '/', icon: Sun },
    { label: 'Tasks', href: '/tasks', icon: CheckSquare, count: overdueCount > 0 ? overdueCount : undefined, countVariant: 'rose' },
    { label: 'Notes & Docs', href: '/notes', icon: FileText },
  ];

  const systemNav = [
    { label: 'Weekly Review', href: '/weekly-review', icon: RotateCw },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 text-slate-700 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="flex flex-col h-full">
          {/* Executive Brand Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="p-1.5 bg-indigo-600 rounded-lg text-white shadow-xs group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-slate-900 tracking-wide leading-tight">Command Center</h1>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Personal Work</p>
              </div>
            </Link>
            <button onClick={closeSidebar} className="md:hidden text-slate-400 hover:text-slate-600 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Add CTA */}
          <div className="p-3">
            <Button
              onClick={() => openQuickAdd()}
              variant="primary"
              className="w-full justify-start py-2 px-3 text-sm gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              icon={<Plus className="w-4 h-4" />}
            >
              Quick Add Task <span className="ml-auto text-[10px] bg-indigo-700 px-1.5 py-0.5 rounded font-mono">C</span>
            </Button>
          </div>

          {/* Core Navigation Section */}
          <div className="flex-1 px-3 py-2 space-y-6 overflow-y-auto custom-scrollbar">
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Workspace
              </div>
              <nav className="space-y-0.5">
                {coreNav.map((item) => {
                  const isActive =
                    item.href === '/'
                      ? pathname === '/'
                      : pathname.startsWith(item.href) ||
                        (item.href === '/tasks' && ['/upcoming', '/waiting-for', '/completed'].some((p) => pathname.startsWith(p))) ||
                        (item.href === '/notes' && ['/meetings', '/journal'].some((p) => pathname.startsWith(p)));

                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 768) closeSidebar();
                      }}
                      className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200/80 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.count !== undefined && item.count > 0 && (
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                            item.countVariant === 'rose'
                              ? 'bg-rose-100 text-rose-700 border border-rose-200'
                              : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                System
              </div>
              <nav className="space-y-0.5">
                {systemNav.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (window.innerWidth < 768) closeSidebar();
                      }}
                      className={`group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                        isActive
                          ? 'bg-slate-100 text-slate-900 font-semibold border border-slate-200'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              IndexedDB Storage
            </span>
            <span className="text-[10px] font-mono text-slate-400">v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
}
