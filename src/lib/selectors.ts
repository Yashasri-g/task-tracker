import type { Task, Project, Note, Meeting, JournalEntry, FollowUp } from '@/types';
import { getTodayString, isOverdue, isDueToday, getDaysDiff } from '@/lib/utils/date';

export interface MyDayStats {
  dueTodayCount: number;
  completedTodayCount: number;
  overdueCount: number;
  followUpCount: number;
  progressPercent: number;
}

export function selectMyDayStats(tasks: Task[], followUps: FollowUp[]): MyDayStats {
  const today = getTodayString();

  const dueTodayTasks = tasks.filter(
    (t) => !t.inInbox && t.dueDate === today
  );

  const completedTodayTasks = tasks.filter((t) => {
    if (t.status !== 'completed' || !t.completedAt) return false;
    return t.completedAt.startsWith(today);
  });

  const overdueTasks = tasks.filter((t) => !t.inInbox && isOverdue(t.dueDate, t.status));

  const pendingFollowUps = followUps.filter((f) => f.status === 'pending' && f.nextFollowUpDate <= today);

  const totalTargetToday = dueTodayTasks.length + completedTodayTasks.length;
  const progressPercent = totalTargetToday > 0 ? Math.round((completedTodayTasks.length / totalTargetToday) * 100) : 0;

  return {
    dueTodayCount: dueTodayTasks.length,
    completedTodayCount: completedTodayTasks.length,
    overdueCount: overdueTasks.length,
    followUpCount: pendingFollowUps.length,
    progressPercent,
  };
}

export function selectMyDayTasks(tasks: Task[]): Task[] {
  const today = getTodayString();
  return tasks
    .filter((t) => !t.inInbox && t.status !== 'completed' && (t.dueDate === today || t.priority === 'urgent'))
    .sort((a, b) => {
      const priorityWeight: Record<string, number> = { urgent: 4, high: 3, medium: 2, low: 1, none: 0 };
      const weightDiff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
      if (weightDiff !== 0) return weightDiff;
      if (a.dueTime && b.dueTime) return a.dueTime.localeCompare(b.dueTime);
      return 0;
    });
}

export function selectOverdueTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((t) => !t.inInbox && isOverdue(t.dueDate, t.status))
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
}

export function selectInboxTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => t.inInbox && t.status !== 'completed');
}

export function selectWaitingForTasks(tasks: Task[]): Task[] {
  return tasks.filter((t) => !t.inInbox && (t.status === 'waiting' || t.status === 'blocked' || !!t.waitingForDetails));
}

export interface SearchResult {
  id: string;
  type: 'task' | 'project' | 'note' | 'meeting' | 'journal' | 'followup';
  title: string;
  subtitle?: string;
  date?: string;
  linkUrl: string;
  badge?: string;
}

export function performGlobalSearch(
  query: string,
  tasks: Task[],
  projects: Project[],
  notes: Note[],
  meetings: Meeting[],
  journals: JournalEntry[],
  followUps: FollowUp[]
): SearchResult[] {
  if (!query || query.trim().length === 0) return [];
  const q = query.toLowerCase().trim();

  const results: SearchResult[] = [];

  // Tasks
  for (const t of tasks) {
    if (
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q)) ||
      (t.notes && t.notes.toLowerCase().includes(q)) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    ) {
      results.push({
        id: t.id,
        type: 'task',
        title: t.title,
        subtitle: t.description || t.notes || (t.dueDate ? `Due ${t.dueDate}` : undefined),
        date: t.dueDate,
        linkUrl: `/tasks?id=${t.id}`,
        badge: t.status.replace('-', ' '),
      });
    }
  }

  // Projects
  for (const p of projects) {
    if (
      p.name.toLowerCase().includes(q) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      p.tags.some((tag) => tag.toLowerCase().includes(q))
    ) {
      results.push({
        id: p.id,
        type: 'project',
        title: p.name,
        subtitle: p.description,
        linkUrl: `/projects/${p.id}`,
        badge: p.status,
      });
    }
  }

  // Notes
  for (const n of notes) {
    if (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      n.tags.some((tag) => tag.toLowerCase().includes(q))
    ) {
      results.push({
        id: n.id,
        type: 'note',
        title: n.title,
        subtitle: n.content.slice(0, 100),
        linkUrl: `/notes?id=${n.id}`,
        badge: 'Note',
      });
    }
  }

  // Meetings
  for (const m of meetings) {
    if (
      m.title.toLowerCase().includes(q) ||
      m.notes.toLowerCase().includes(q) ||
      (m.agenda && m.agenda.toLowerCase().includes(q)) ||
      m.participants.some((p) => p.toLowerCase().includes(q))
    ) {
      results.push({
        id: m.id,
        type: 'meeting',
        title: m.title,
        subtitle: `${m.date} · ${m.participants.join(', ')}`,
        date: m.date,
        linkUrl: `/meetings?id=${m.id}`,
        badge: 'Meeting',
      });
    }
  }

  // Journals
  for (const j of journals) {
    if (
      j.workCompleted.toLowerCase().includes(q) ||
      j.accomplishments.toLowerCase().includes(q) ||
      j.importantDecisions.toLowerCase().includes(q) ||
      j.challenges.toLowerCase().includes(q)
    ) {
      results.push({
        id: j.id,
        type: 'journal',
        title: `Work Journal (${j.date})`,
        subtitle: j.workCompleted.slice(0, 100) || j.accomplishments.slice(0, 100),
        date: j.date,
        linkUrl: `/journal?date=${j.date}`,
        badge: 'Journal',
      });
    }
  }

  // Follow-ups
  for (const f of followUps) {
    if (
      f.title.toLowerCase().includes(q) ||
      f.person.toLowerCase().includes(q) ||
      (f.notes && f.notes.toLowerCase().includes(q))
    ) {
      results.push({
        id: f.id,
        type: 'followup',
        title: f.title,
        subtitle: `With ${f.person} · Follow-up ${f.nextFollowUpDate}`,
        date: f.nextFollowUpDate,
        linkUrl: `/waiting-for?id=${f.id}`,
        badge: 'Follow-up',
      });
    }
  }

  return results.slice(0, 25);
}
