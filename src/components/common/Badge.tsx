import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'urgent' | 'high' | 'medium' | 'low' | 'success' | 'warning' | 'info' | 'neutral' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  const variantStyles = {
    default: 'bg-indigo-100 text-indigo-800 border border-indigo-200/60',
    urgent: 'bg-rose-100 text-rose-800 border border-rose-200/60 font-bold',
    high: 'bg-amber-100 text-amber-800 border border-amber-200/60',
    medium: 'bg-blue-100 text-blue-800 border border-blue-200/60',
    low: 'bg-slate-100 text-slate-700 border border-slate-200/60',
    success: 'bg-emerald-100 text-emerald-800 border border-emerald-200/60',
    warning: 'bg-orange-100 text-orange-800 border border-orange-200/60',
    info: 'bg-sky-100 text-sky-800 border border-sky-200/60',
    neutral: 'bg-slate-100 text-slate-600 border border-slate-200/60',
    outline: 'border border-slate-300 text-slate-700 bg-white',
  };

  return (
    <span className={twMerge(clsx(baseStyles, sizeStyles[size], variantStyles[variant], className))}>
      {children}
    </span>
  );
}
