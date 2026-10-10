'use client';

import React, { Suspense } from 'react';
import { AppProvider } from '@/context/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ToastContainer } from '@/components/common/Toast';
import { QuickAddModal } from '@/components/tasks/QuickAddModal';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { CommandPalette } from '@/components/search/CommandPalette';
import { EodReviewModal } from '@/components/reviews/EodReviewModal';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <Suspense fallback={<div className="h-16 border-b border-slate-200 bg-white" />}>
          <Sidebar />
          <div className="md:pl-64 flex flex-col flex-1 min-h-screen">
            <Header />
            <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
              {children}
            </main>
          </div>
        </Suspense>

        {/* Modals & Overlays */}
        <QuickAddModal />
        <TaskDetailModal />
        <Suspense fallback={null}>
          <CommandPalette />
        </Suspense>
        <EodReviewModal />
        <ToastContainer />
      </div>
    </AppProvider>
  );
}
