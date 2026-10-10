import type { ExportBackup, Task, Project, Note, Meeting, JournalEntry, FollowUp, UserPreferences } from '@/types';
import { db } from '@/lib/db';
import { taskRepo, projectRepo, noteRepo, meetingRepo, journalRepo, followUpRepo, preferencesRepo } from '@/lib/repository';

export const CURRENT_SCHEMA_VERSION = 1;

export async function exportAllData(): Promise<ExportBackup> {
  const [tasks, projects, notes, meetings, journalEntries, followUps, preferences] = await Promise.all([
    taskRepo.getAll(),
    projectRepo.getAll(),
    noteRepo.getAll(),
    meetingRepo.getAll(),
    journalRepo.getAll(),
    followUpRepo.getAll(),
    preferencesRepo.get(),
  ]);

  return {
    version: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    tasks,
    projects,
    notes,
    meetings,
    journalEntries,
    followUps,
    preferences,
  };
}

export function validateBackupFile(data: unknown): { valid: boolean; error?: string; backup?: ExportBackup } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'File does not contain a valid JSON object.' };
  }

  const obj = data as Record<string, unknown>;

  if (typeof obj.version !== 'number') {
    return { valid: false, error: 'Backup missing schema version number.' };
  }

  if (!Array.isArray(obj.tasks)) {
    return { valid: false, error: 'Invalid backup format: "tasks" array missing.' };
  }

  if (!Array.isArray(obj.projects)) {
    return { valid: false, error: 'Invalid backup format: "projects" array missing.' };
  }

  if (!Array.isArray(obj.notes)) {
    return { valid: false, error: 'Invalid backup format: "notes" array missing.' };
  }

  if (!Array.isArray(obj.meetings)) {
    return { valid: false, error: 'Invalid backup format: "meetings" array missing.' };
  }

  if (!Array.isArray(obj.journalEntries)) {
    return { valid: false, error: 'Invalid backup format: "journalEntries" array missing.' };
  }

  if (!Array.isArray(obj.followUps)) {
    return { valid: false, error: 'Invalid backup format: "followUps" array missing.' };
  }

  return {
    valid: true,
    backup: data as ExportBackup,
  };
}

export async function importData(backup: ExportBackup, mode: 'merge' | 'replace'): Promise<{ success: boolean; stats: string }> {
  try {
    await db.transaction('rw', [db.tasks, db.projects, db.notes, db.meetings, db.journalEntries, db.followUps, db.preferences], async () => {
      if (mode === 'replace') {
        await db.tasks.clear();
        await db.projects.clear();
        await db.notes.clear();
        await db.meetings.clear();
        await db.journalEntries.clear();
        await db.followUps.clear();
        await db.preferences.clear();
      }

      // Add projects first
      if (backup.projects && backup.projects.length > 0) {
        await db.projects.bulkPut(backup.projects);
      }

      if (backup.tasks && backup.tasks.length > 0) {
        await db.tasks.bulkPut(backup.tasks);
      }

      if (backup.notes && backup.notes.length > 0) {
        await db.notes.bulkPut(backup.notes);
      }

      if (backup.meetings && backup.meetings.length > 0) {
        await db.meetings.bulkPut(backup.meetings);
      }

      if (backup.journalEntries && backup.journalEntries.length > 0) {
        await db.journalEntries.bulkPut(backup.journalEntries);
      }

      if (backup.followUps && backup.followUps.length > 0) {
        await db.followUps.bulkPut(backup.followUps);
      }

      if (backup.preferences) {
        await db.preferences.put(backup.preferences);
      }
    });

    const stats = `Imported ${backup.tasks?.length || 0} tasks, ${backup.projects?.length || 0} projects, ${backup.notes?.length || 0} notes, ${backup.meetings?.length || 0} meetings, ${backup.journalEntries?.length || 0} journal entries, ${backup.followUps?.length || 0} follow-ups.`;

    return { success: true, stats };
  } catch (err) {
    return {
      success: false,
      stats: `Failed to import data: ${(err as Error).message || 'Database transaction error'}`,
    };
  }
}

export async function clearAllLocalData(): Promise<void> {
  await db.transaction('rw', [db.tasks, db.projects, db.notes, db.meetings, db.journalEntries, db.followUps, db.preferences], async () => {
    await db.tasks.clear();
    await db.projects.clear();
    await db.notes.clear();
    await db.meetings.clear();
    await db.journalEntries.clear();
    await db.followUps.clear();
  });
}

export async function getStorageStats(): Promise<{ taskCount: number; projectCount: number; noteCount: number; meetingCount: number; journalCount: number; followUpCount: number; estimatedSizeKb: number }> {
  const [taskCount, projectCount, noteCount, meetingCount, journalCount, followUpCount] = await Promise.all([
    db.tasks.count(),
    db.projects.count(),
    db.notes.count(),
    db.meetings.count(),
    db.journalEntries.count(),
    db.followUps.count(),
  ]);

  const allTasks = await db.tasks.toArray();
  const estimatedSizeKb = Math.round(JSON.stringify(allTasks).length / 1024);

  return {
    taskCount,
    projectCount,
    noteCount,
    meetingCount,
    journalCount,
    followUpCount,
    estimatedSizeKb,
  };
}
