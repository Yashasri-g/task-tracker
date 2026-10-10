'use client';

import React from 'react';
import {
  getTodayString,
  getTomorrowString,
  getNextMondayString,
  getInOneWeekString,
} from '@/lib/utils/date';
import { Calendar, X } from 'lucide-react';

interface QuickDateSelectorProps {
  value: string;
  onChange: (newDate: string) => void;
  label?: string;
}

export function QuickDateSelector({ value, onChange, label = 'Due Date' }: QuickDateSelectorProps) {
  const today = getTodayString();
  const tomorrow = getTomorrowString();
  const nextMonday = getNextMondayString();
  const inOneWeek = getInOneWeekString();

  const presets = [
    { label: 'Today', value: today },
    { label: 'Tomorrow', value: tomorrow },
    { label: 'Next Mon', value: nextMonday },
    { label: 'In 1 Wk', value: inOneWeek },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-600 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-indigo-600" />
          {label}
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-0.5 transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Quick Preset Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {presets.map((preset) => {
          const isActive = value === preset.value;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onChange(preset.value)}
              className={`px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs font-semibold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Native Calendar Input */}
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs"
      />
    </div>
  );
}
