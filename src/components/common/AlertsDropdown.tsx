'use client';

import React, { useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Volume2,
  X,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Flame,
} from 'lucide-react';
import { Button } from './Button';
import { formatNiceDate } from '@/lib/utils/date';
import type { Task, FollowUp } from '@/types';

interface AlertsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  overdueTasks: Task[];
  dueTodayTasks: Task[];
  reminderTasks: Task[];
  dueFollowUps: FollowUp[];
  notificationPermission: NotificationPermission | 'unsupported';
  onRequestPermission: () => Promise<void>;
  onTestNotification: () => void;
}

export function AlertsDropdown({
  isOpen,
  onClose,
  overdueTasks,
  dueTodayTasks,
  reminderTasks,
  dueFollowUps,
  notificationPermission,
  onRequestPermission,
  onTestNotification,
}: AlertsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { openTaskDetail, toggleTaskCompletion } = useApp();

  const totalAlerts =
    overdueTasks.length + dueTodayTasks.length + reminderTasks.length + dueFollowUps.length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800"
    >
      {/* Dropdown Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-600">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 leading-tight">
              Alerts & Notifications
            </h3>
            <p className="text-[10px] text-slate-500">
              {totalAlerts} {totalAlerts === 1 ? 'item requires' : 'items require'} attention
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onTestNotification}
            title="Ring alert bell (Test sound)"
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Desktop Notification Banner */}
      {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
        <div className="p-3 bg-amber-50/80 border-b border-amber-200/80 flex items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <span className="font-semibold text-amber-900 block text-[11px]">
              Enable Desktop Alerts
            </span>
            <span className="text-[10px] text-amber-700">
              Get notified when tasks and reminders are due.
            </span>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={onRequestPermission}
            className="text-[10px] py-1 px-2.5 bg-amber-600 hover:bg-amber-700 text-white shrink-0"
          >
            Enable
          </Button>
        </div>
      )}

      {notificationPermission === 'granted' && (
        <div className="px-4 py-1.5 bg-emerald-50/60 border-b border-emerald-100 flex items-center justify-between text-[11px] text-emerald-800">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            System Notifications Active
          </span>
          <button
            onClick={onTestNotification}
            className="text-[10px] font-semibold text-emerald-700 hover:underline"
          >
            Test Chime
          </button>
        </div>
      )}

      {/* Alert Content Scroll Area */}
      <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 custom-scrollbar text-xs">
        {totalAlerts === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">All Clear!</h4>
            <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
              No overdue deadlines, pending reminders, or waiting follow-ups right now.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Overdue Items */}
            {overdueTasks.length > 0 && (
              <div className="p-3 space-y-1.5 bg-rose-50/30">
                <div className="flex items-center justify-between text-[11px] font-bold text-rose-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                    Overdue ({overdueTasks.length})
                  </span>
                </div>
                {overdueTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 bg-white border border-rose-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-rose-300 transition-colors cursor-pointer group"
                    onClick={() => {
                      onClose();
                      openTaskDetail(task.id);
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <h5 className="font-semibold text-slate-900 truncate group-hover:text-rose-600">
                        {task.title}
                      </h5>
                      <span className="text-[10px] text-rose-600 font-bold">
                        Was due {formatNiceDate(task.dueDate)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskCompletion(task);
                      }}
                      className="text-[10px] px-2 py-1 bg-rose-50 text-rose-700 hover:bg-emerald-600 hover:text-white rounded-lg border border-rose-200 transition-colors font-medium"
                    >
                      Done
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 2. Tasks with Custom Reminders */}
            {reminderTasks.length > 0 && (
              <div className="p-3 space-y-1.5 bg-amber-50/30">
                <div className="flex items-center justify-between text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Bell className="w-3.5 h-3.5 text-amber-600" />
                    Scheduled Reminders ({reminderTasks.length})
                  </span>
                </div>
                {reminderTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 bg-white border border-amber-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-amber-300 transition-colors cursor-pointer group"
                    onClick={() => {
                      onClose();
                      openTaskDetail(task.id);
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <h5 className="font-semibold text-slate-900 truncate group-hover:text-amber-700">
                        {task.title}
                      </h5>
                      <span className="text-[10px] text-amber-700 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Alert: {task.reminder?.time || 'Today'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskCompletion(task);
                      }}
                      className="text-[10px] px-2 py-1 bg-amber-50 text-amber-800 hover:bg-emerald-600 hover:text-white rounded-lg border border-amber-200 transition-colors font-medium"
                    >
                      Done
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 3. Due Today */}
            {dueTodayTasks.length > 0 && (
              <div className="p-3 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Due Today ({dueTodayTasks.length})
                  </span>
                </div>
                {dueTodayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="p-2.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-2 shadow-2xs hover:border-indigo-300 transition-colors cursor-pointer group"
                    onClick={() => {
                      onClose();
                      openTaskDetail(task.id);
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <h5 className="font-semibold text-slate-900 truncate group-hover:text-indigo-600">
                        {task.title}
                      </h5>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.priority === 'urgent' && (
                          <span className="text-[10px] font-bold text-rose-600 flex items-center gap-0.5">
                            <Flame className="w-3 h-3" /> Urgent
                          </span>
                        )}
                        {task.dueTime && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            @{task.dueTime}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTaskCompletion(task);
                      }}
                      className="text-[10px] px-2 py-1 bg-slate-50 text-slate-700 hover:bg-emerald-600 hover:text-white rounded-lg border border-slate-200 transition-colors font-medium"
                    >
                      Done
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 4. Due Follow-ups */}
            {dueFollowUps.length > 0 && (
              <div className="p-3 space-y-1.5 bg-purple-50/30">
                <div className="flex items-center justify-between text-[11px] font-bold text-purple-700 uppercase tracking-wider">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-purple-500" />
                    Pending Follow-Ups ({dueFollowUps.length})
                  </span>
                </div>
                {dueFollowUps.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 bg-white border border-purple-200 rounded-xl shadow-2xs"
                  >
                    <h5 className="font-semibold text-slate-900">{item.title}</h5>
                    <p className="text-[10px] text-purple-600 font-medium">
                      Waiting for: {item.person} • Due {item.nextFollowUpDate}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
        <span>Audible + desktop alerts supported</span>
        <button
          onClick={onClose}
          className="text-xs font-semibold text-indigo-600 hover:underline"
        >
          Close
        </button>
      </div>
    </div>
  );
}
