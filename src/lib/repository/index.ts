import { db } from '@/lib/db';
import type {
  Task,
  Project,
  Note,
  Meeting,
  JournalEntry,
  FollowUp,
  UserPreferences,
  ExportBackup,
  StorageStats,
} from '@/types';
import { getTodayString } from '@/lib/utils/date';

export interface ITaskRepository {
  getAll(): Promise<Task[]>;
  getById(id: string): Promise<Task | undefined>;
  add(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Task>;
  update(id: string, changes: Partial<Task>): Promise<Task>;
  delete(id: string): Promise<void>;
  bulkDelete(ids: string[]): Promise<void>;
}

export interface IProjectRepository {
  getAll(): Promise<Project[]>;
  getById(id: string): Promise<Project | undefined>;
  add(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Project>;
  update(id: string, changes: Partial<Project>): Promise<Project>;
  delete(id: string, keepTasks?: boolean): Promise<void>;
}

export interface INoteRepository {
  getAll(): Promise<Note[]>;
  getById(id: string): Promise<Note | undefined>;
  add(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Note>;
  update(id: string, changes: Partial<Note>): Promise<Note>;
  delete(id: string): Promise<void>;
}

export interface IMeetingRepository {
  getAll(): Promise<Meeting[]>;
  getById(id: string): Promise<Meeting | undefined>;
  add(meeting: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Meeting>;
  update(id: string, changes: Partial<Meeting>): Promise<Meeting>;
  delete(id: string): Promise<void>;
}

export interface IJournalRepository {
  getAll(): Promise<JournalEntry[]>;
  getByDate(date: string): Promise<JournalEntry | undefined>;
  saveForDate(date: string, entry: Partial<JournalEntry>): Promise<JournalEntry>;
  delete(id: string): Promise<void>;
}

export interface IFollowUpRepository {
  getAll(): Promise<FollowUp[]>;
  getById(id: string): Promise<FollowUp | undefined>;
  add(followUp: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<FollowUp>;
  update(id: string, changes: Partial<FollowUp>): Promise<FollowUp>;
  delete(id: string): Promise<void>;
}

export interface IPreferencesRepository {
  get(): Promise<UserPreferences>;
  update(changes: Partial<UserPreferences>): Promise<UserPreferences>;
}

// Dexie Implementations

export class DexieTaskRepository implements ITaskRepository {
  async getAll(): Promise<Task[]> {
    return await db.tasks.toArray();
  }

  async getById(id: string): Promise<Task | undefined> {
    return await db.tasks.get(id);
  }

  async add(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Task> {
    const now = new Date().toISOString();
    const task: Task = {
      ...taskData,
      id: taskData.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now,
      links: taskData.links || [],
      checklist: taskData.checklist || [],
      dependencies: taskData.dependencies || [],
      tags: taskData.tags || [],
    };
    await db.tasks.put(task);
    return task;
  }

  async update(id: string, changes: Partial<Task>): Promise<Task> {
    const existing = await db.tasks.get(id);
    if (!existing) throw new Error(`Task ${id} not found`);

    const updated: Task = {
      ...existing,
      ...changes,
      updatedAt: new Date().toISOString(),
    };

    if (changes.status === 'completed' && !existing.completedAt) {
      updated.completedAt = new Date().toISOString();
    } else if (changes.status && changes.status !== 'completed') {
      updated.completedAt = undefined;
    }

    await db.tasks.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.tasks.delete(id);
  }

  async bulkDelete(ids: string[]): Promise<void> {
    await db.tasks.bulkDelete(ids);
  }
}

export class DexieProjectRepository implements IProjectRepository {
  async getAll(): Promise<Project[]> {
    return await db.projects.toArray();
  }

  async getById(id: string): Promise<Project | undefined> {
    return await db.projects.get(id);
  }

  async add(projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Project> {
    const now = new Date().toISOString();
    const project: Project = {
      ...projectData,
      id: projectData.id || `proj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now,
      tags: projectData.tags || [],
      links: projectData.links || [],
    };
    await db.projects.put(project);
    return project;
  }

  async update(id: string, changes: Partial<Project>): Promise<Project> {
    const existing = await db.projects.get(id);
    if (!existing) throw new Error(`Project ${id} not found`);

    const updated: Project = {
      ...existing,
      ...changes,
      updatedAt: new Date().toISOString(),
    };
    await db.projects.put(updated);
    return updated;
  }

  async delete(id: string, keepTasks = false): Promise<void> {
    await db.transaction('rw', db.projects, db.tasks, async () => {
      await db.projects.delete(id);
      if (!keepTasks) {
        // Disassociate or delete tasks
        const projectTasks = await db.tasks.where('projectId').equals(id).toArray();
        for (const t of projectTasks) {
          await db.tasks.update(t.id, { projectId: undefined });
        }
      }
    });
  }
}

export class DexieNoteRepository implements INoteRepository {
  async getAll(): Promise<Note[]> {
    return await db.notes.toArray();
  }

  async getById(id: string): Promise<Note | undefined> {
    return await db.notes.get(id);
  }

  async add(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Note> {
    const now = new Date().toISOString();
    const note: Note = {
      ...noteData,
      id: noteData.id || `note_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now,
      tags: noteData.tags || [],
      relatedTaskIds: noteData.relatedTaskIds || [],
    };
    await db.notes.put(note);
    return note;
  }

  async update(id: string, changes: Partial<Note>): Promise<Note> {
    const existing = await db.notes.get(id);
    if (!existing) throw new Error(`Note ${id} not found`);

    const updated: Note = {
      ...existing,
      ...changes,
      updatedAt: new Date().toISOString(),
    };
    await db.notes.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.notes.delete(id);
  }
}

export class DexieMeetingRepository implements IMeetingRepository {
  async getAll(): Promise<Meeting[]> {
    return await db.meetings.toArray();
  }

  async getById(id: string): Promise<Meeting | undefined> {
    return await db.meetings.get(id);
  }

  async add(meetingData: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Meeting> {
    const now = new Date().toISOString();
    const meeting: Meeting = {
      ...meetingData,
      id: meetingData.id || `mtg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now,
      participants: meetingData.participants || [],
      decisions: meetingData.decisions || [],
      actionItems: meetingData.actionItems || [],
    };
    await db.meetings.put(meeting);
    return meeting;
  }

  async update(id: string, changes: Partial<Meeting>): Promise<Meeting> {
    const existing = await db.meetings.get(id);
    if (!existing) throw new Error(`Meeting ${id} not found`);

    const updated: Meeting = {
      ...existing,
      ...changes,
      updatedAt: new Date().toISOString(),
    };
    await db.meetings.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.meetings.delete(id);
  }
}

export class DexieJournalRepository implements IJournalRepository {
  async getAll(): Promise<JournalEntry[]> {
    return await db.journalEntries.toArray();
  }

  async getByDate(date: string): Promise<JournalEntry | undefined> {
    return await db.journalEntries.where('date').equals(date).first();
  }

  async saveForDate(date: string, entryData: Partial<JournalEntry>): Promise<JournalEntry> {
    const existing = await this.getByDate(date);
    const now = new Date().toISOString();

    if (existing) {
      const updated: JournalEntry = {
        ...existing,
        ...entryData,
        updatedAt: now,
      };
      await db.journalEntries.put(updated);
      return updated;
    } else {
      const created: JournalEntry = {
        id: `journal_${date}`,
        date,
        workCompleted: entryData.workCompleted || '',
        importantDecisions: entryData.importantDecisions || '',
        challenges: entryData.challenges || '',
        newAssignments: entryData.newAssignments || '',
        followUpsToRemember: entryData.followUpsToRemember || '',
        accomplishments: entryData.accomplishments || '',
        notesForTomorrow: entryData.notesForTomorrow || '',
        relatedProjectIds: entryData.relatedProjectIds || [],
        relatedTaskIds: entryData.relatedTaskIds || [],
        createdAt: now,
        updatedAt: now,
      };
      await db.journalEntries.put(created);
      return created;
    }
  }

  async delete(id: string): Promise<void> {
    await db.journalEntries.delete(id);
  }
}

export class DexieFollowUpRepository implements IFollowUpRepository {
  async getAll(): Promise<FollowUp[]> {
    return await db.followUps.toArray();
  }

  async getById(id: string): Promise<FollowUp | undefined> {
    return await db.followUps.get(id);
  }

  async add(followUpData: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<FollowUp> {
    const now = new Date().toISOString();
    const followUp: FollowUp = {
      ...followUpData,
      id: followUpData.id || `flw_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: now,
      updatedAt: now,
      links: followUpData.links || [],
    };
    await db.followUps.put(followUp);
    return followUp;
  }

  async update(id: string, changes: Partial<FollowUp>): Promise<FollowUp> {
    const existing = await db.followUps.get(id);
    if (!existing) throw new Error(`FollowUp ${id} not found`);

    const updated: FollowUp = {
      ...existing,
      ...changes,
      updatedAt: new Date().toISOString(),
    };
    await db.followUps.put(updated);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await db.followUps.delete(id);
  }
}

export class DexiePreferencesRepository implements IPreferencesRepository {
  private readonly ID = 'default';

  async get(): Promise<UserPreferences> {
    const prefs = await db.preferences.get(this.ID);
    if (prefs) return prefs;

    const defaultPrefs: UserPreferences = {
      id: this.ID,
      theme: 'system',
      weekStartDay: 'monday',
      dateFormat: 'MMM d, yyyy',
      timeFormat: '12h',
      defaultPriority: 'medium',
      defaultTaskView: 'list',
      reminderEnabled: true,
    };
    await db.preferences.put(defaultPrefs);
    return defaultPrefs;
  }

  async update(changes: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.get();
    const updated: UserPreferences = {
      ...current,
      ...changes,
    };
    await db.preferences.put(updated);
    return updated;
  }
}

export const taskRepo = new DexieTaskRepository();
export const projectRepo = new DexieProjectRepository();
export const noteRepo = new DexieNoteRepository();
export const meetingRepo = new DexieMeetingRepository();
export const journalRepo = new DexieJournalRepository();
export const followUpRepo = new DexieFollowUpRepository();
export const preferencesRepo = new DexiePreferencesRepository();
