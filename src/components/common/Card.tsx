import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export function Card({ children, className, hoverable = false, ...props }: CardProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs transition-all',
          hoverable && 'hover:border-slate-300 hover:shadow-xs cursor-pointer',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={twMerge('flex items-center justify-between pb-3 border-b border-slate-100 mb-3', className)}>{children}</div>;
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={twMerge('text-sm font-bold text-slate-900 tracking-tight', className)}>{children}</h3>;
}
