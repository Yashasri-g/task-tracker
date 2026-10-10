import React from 'react';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-dashed border-slate-200/90 rounded-2xl ${className}`}>
      {icon && <div className="p-3 mb-3 bg-white rounded-xl text-slate-500 shadow-2xs border border-slate-200/80">{icon}</div>}
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-4">
          <Button onClick={onAction} size="sm">{actionLabel}</Button>
        </div>
      )}
    </div>
  );
}
