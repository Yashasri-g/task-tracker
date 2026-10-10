export type TaskStatus = 'not-started' | 'in-progress' | 'waiting' | 'blocked' | 'completed';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';
export type TaskType = 'task' | 'commitment' | 'follow-up' | 'idea' | 'deliverable';
export type RecurringPattern = 'none' | 'daily' | 'weekly' | 'monthly';

export interface LinkItem {
  id: string;
  title: string;
  url: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface WaitingForDetails {
  person: string;
  requestedDate: string; // YYYY-MM-DD
  expectedResponseDate?: string; // YYYY-MM-DD
  nextFollowUpDate?: string; // YYYY-MM-DD
  note?: string;
}

export interface ReminderSetting {
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  dismissed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  taskType: TaskType;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  completedAt?: string; // ISO string
  projectId?: string;
  tags: string[];
  assignedBy?: string;
  personInvolved?: string;
  notes?: string;
  links: LinkItem[];
  checklist: ChecklistItem[];
  dependencies: string[]; // Task IDs
  waitingForDetails?: WaitingForDetails;
  followUpDate?: string; // YYYY-MM-DD
  reminder?: ReminderSetting;
  estimatedDuration?: number; // in minutes
  recurringPattern?: RecurringPattern;
  inInbox: boolean;
}

export type ProjectStatus = 'planning' | 'active' | 'on-hold' | 'completed' | 'archived';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string; // Hex or theme color class
  startDate?: string; // YYYY-MM-DD
  targetDate?: string; // YYYY-MM-DD
  status: ProjectStatus;
  tags: string[];
  links: LinkItem[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface Note {
  id: string;
  title: string;
  content: string; // Markdown / Plain text
  tags: string[];
  projectId?: string;
  relatedTaskIds: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface MeetingActionItem {
  id: string;
  title: string;
  assignee?: string;
  convertedTaskId?: string;
  completed?: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  participants: string[];
  agenda?: string;
  notes: string;
  decisions: string[];
  actionItems: MeetingActionItem[];
  followUpDate?: string; // YYYY-MM-DD
  projectId?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD (unique key per day)
  workCompleted: string;
  importantDecisions: string;
  challenges: string;
  newAssignments: string;
  followUpsToRemember: string;
  accomplishments: string;
  notesForTomorrow: string;
  relatedProjectIds: string[];
  relatedTaskIds: string[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type FollowUpStatus = 'pending' | 'received' | 'rescheduled' | 'cancelled';

export interface FollowUp {
  id: string;
  title: string;
  person: string;
  relatedTaskId?: string;
  relatedProjectId?: string;
  requestedDate: string; // YYYY-MM-DD
  expectedResponseDate?: string; // YYYY-MM-DD
  nextFollowUpDate: string; // YYYY-MM-DD
  status: FollowUpStatus;
  notes?: string;
  links: LinkItem[];
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface UserPreferences {
  id: string; // 'default'
  theme: 'system' | 'light' | 'dark';
  weekStartDay: 'monday' | 'sunday';
  dateFormat: 'MMM d, yyyy' | 'yyyy-MM-dd' | 'dd/MM/yyyy';
  timeFormat: '12h' | '24h';
  defaultPriority: TaskPriority;
  defaultTaskView: 'list' | 'board' | 'agenda';
  reminderEnabled: boolean;
  lastReviewDate?: string; // YYYY-MM-DD
  lastEodReviewDate?: string; // YYYY-MM-DD
}

export interface ExportBackup {
  version: number;
  exportedAt: string; // ISO string
  tasks: Task[];
  projects: Project[];
  notes: Note[];
  meetings: Meeting[];
  journalEntries: JournalEntry[];
  followUps: FollowUp[];
  preferences: UserPreferences;
}

export interface StorageStats {
  taskCount: number;
  projectCount: number;
  noteCount: number;
  meetingCount: number;
  journalCount: number;
  followUpCount: number;
  estimatedSizeKb: number;
}
