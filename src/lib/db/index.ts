import Dexie, { type Table } from 'dexie';
import type {
  Task,
  Project,
  Note,
  Meeting,
  JournalEntry,
  FollowUp,
  UserPreferences,
} from '@/types';

export class CommandCenterDatabase extends Dexie {
  tasks!: Table<Task, string>;
  projects!: Table<Project, string>;
  notes!: Table<Note, string>;
  meetings!: Table<Meeting, string>;
  journalEntries!: Table<JournalEntry, string>;
  followUps!: Table<FollowUp, string>;
  preferences!: Table<UserPreferences, string>;

  constructor() {
    super('WorkCommandCenterDB');

    this.version(1).stores({
      tasks: 'id, status, priority, dueDate, projectId, inInbox, createdAt, updatedAt, followUpDate',
      projects: 'id, status, targetDate, createdAt',
      notes: 'id, projectId, createdAt, updatedAt',
      meetings: 'id, date, projectId, createdAt',
      journalEntries: 'id, date, createdAt',
      followUps: 'id, status, nextFollowUpDate, relatedTaskId, relatedProjectId',
      preferences: 'id',
    });
  }
}

export const db = new CommandCenterDatabase();
