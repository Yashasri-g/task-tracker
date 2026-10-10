import {
  format,
  parseISO,
  isToday as isTodayFns,
  isTomorrow as isTomorrowFns,
  addDays,
  addMonths,
  isValid,
} from 'date-fns';

export function getTodayString(): string {
  if (typeof window === 'undefined') {
    return '2026-10-10';
  }
  return format(new Date(), 'yyyy-MM-dd');
}

export function getTomorrowString(): string {
  if (typeof window === 'undefined') return '2026-10-11';
  return format(addDays(new Date(), 1), 'yyyy-MM-dd');
}

export function getNextMondayString(): string {
  if (typeof window === 'undefined') return '2026-10-12';
  const now = new Date();
  const day = now.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  return format(addDays(now, daysUntilMonday), 'yyyy-MM-dd');
}

export function getInOneWeekString(): string {
  if (typeof window === 'undefined') return '2026-10-17';
  return format(addDays(new Date(), 7), 'yyyy-MM-dd');
}

export function calculateNextOccurrenceDate(baseDateStr?: string, pattern: 'daily' | 'weekly' | 'monthly' = 'daily'): string {
  const baseDate = baseDateStr && isValid(parseISO(baseDateStr + 'T00:00:00'))
    ? parseISO(baseDateStr + 'T00:00:00')
    : new Date();

  if (pattern === 'daily') {
    return format(addDays(baseDate, 1), 'yyyy-MM-dd');
  }
  if (pattern === 'weekly') {
    return format(addDays(baseDate, 7), 'yyyy-MM-dd');
  }
  if (pattern === 'monthly') {
    return format(addMonths(baseDate, 1), 'yyyy-MM-dd');
  }
  return format(addDays(baseDate, 1), 'yyyy-MM-dd');
}

export function formatNiceDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const d = dateStr.length === 10 ? parseISO(dateStr + 'T00:00:00') : parseISO(dateStr);
    if (!isValid(d)) return dateStr;
    if (isTodayFns(d)) return 'Today';
    if (isTomorrowFns(d)) return 'Tomorrow';
    return format(d, 'MMM d, yyyy');
  } catch {
    return dateStr;
  }
}

export function formatDateTime(isoStr?: string): string {
  if (!isoStr) return '';
  try {
    const d = parseISO(isoStr);
    if (!isValid(d)) return isoStr;
    return format(d, 'MMM d, yyyy h:mm a');
  } catch {
    return isoStr;
  }
}

export function isOverdue(dueDateStr?: string, status?: string): boolean {
  if (!dueDateStr || status === 'completed') return false;
  try {
    const todayStr = getTodayString();
    return dueDateStr < todayStr;
  } catch {
    return false;
  }
}

export function isDueToday(dueDateStr?: string): boolean {
  if (!dueDateStr) return false;
  return dueDateStr === getTodayString();
}

export function isDueTomorrow(dueDateStr?: string): boolean {
  if (!dueDateStr) return false;
  if (typeof window === 'undefined') return false;
  const tomorrowStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  return dueDateStr === tomorrowStr;
}

export function isDueInNext7Days(dueDateStr?: string): boolean {
  if (!dueDateStr) return false;
  const todayStr = getTodayString();
  if (typeof window === 'undefined') return false;
  const next7Str = format(addDays(new Date(), 7), 'yyyy-MM-dd');
  return dueDateStr > todayStr && dueDateStr <= next7Str;
}

export function getDaysDiff(dateStr1: string, dateStr2: string): number {
  try {
    const d1 = parseISO(dateStr1.length === 10 ? dateStr1 + 'T00:00:00' : dateStr1);
    const d2 = parseISO(dateStr2.length === 10 ? dateStr2 + 'T00:00:00' : dateStr2);
    const diffTime = d1.getTime() - d2.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export function getGreeting(): string {
  if (typeof window === 'undefined') return 'Good morning';
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}
