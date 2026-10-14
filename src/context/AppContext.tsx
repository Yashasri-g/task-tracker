'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
  taskRepo,
  projectRepo,
  noteRepo,
  meetingRepo,
  journalRepo,
  followUpRepo,
  preferencesRepo,
} from '@/lib/repository';
import { hasExistingData, loadDemoData, clearAllWorkspaceData } from '@/lib/db/seed';
import type { Task, Project, Note, Meeting, JournalEntry, FollowUp, UserPreferences } from '@/types';
import { ProductTourModal } from '@/components/common/ProductTourModal';
import { calculateNextOccurrenceDate, getTodayString } from '@/lib/utils/date';
import {
  getNotificationPermission,
  requestNotificationPermission,
  sendSystemNotification,
  playNotificationChime,
} from '@/lib/utils/notifications';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

interface AppContextType {
  // Data
  tasks: Task[];
  projects: Project[];
  notes: Note[];
  meetings: Meeting[];
  journalEntries: JournalEntry[];
  followUps: FollowUp[];
  preferences: UserPreferences | undefined;
  isLoading: boolean;

  // Actions
  createTask: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<Task>;
  updateTask: (id: string, changes: Partial<Task>) => Promise<Task>;
  toggleTaskCompletion: (task: Task) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  
  createProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<Project>;
  updateProject: (id: string, changes: Partial<Project>) => Promise<Project>;
  deleteProject: (id: string, keepTasks?: boolean) => Promise<void>;

  createNote: (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<Note>;
  updateNote: (id: string, changes: Partial<Note>) => Promise<Note>;
  deleteNote: (id: string) => Promise<void>;

  createMeeting: (data: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<Meeting>;
  updateMeeting: (id: string, changes: Partial<Meeting>) => Promise<Meeting>;
  deleteMeeting: (id: string) => Promise<void>;

  saveJournalEntry: (date: string, data: Partial<JournalEntry>) => Promise<JournalEntry>;
  
  createFollowUp: (data: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => Promise<FollowUp>;
  updateFollowUp: (id: string, changes: Partial<FollowUp>) => Promise<FollowUp>;
  deleteFollowUp: (id: string) => Promise<void>;

  updatePreferences: (changes: Partial<UserPreferences>) => Promise<UserPreferences>;
  reloadDemoData: () => Promise<void>;
  clearDatabase: () => Promise<void>;

  // Modals & UI State
  isQuickAddOpen: boolean;
  openQuickAdd: (defaultField?: Partial<Task>) => void;
  closeQuickAdd: () => void;
  quickAddDefaults: Partial<Task> | undefined;

  activeTaskId: string | null;
  openTaskDetail: (id: string) => void;
  closeTaskDetail: () => void;

  isCommandPaletteOpen: boolean;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;

  isEodReviewOpen: boolean;
  openEodReview: () => void;
  closeEodReview: () => void;

  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;

  isTourOpen: boolean;
  openTour: () => void;
  closeTour: () => void;

  toasts: ToastMessage[];
  showToast: (title: string, message?: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;

  notificationPermission: NotificationPermission | 'unsupported';
  requestAlertPermission: () => Promise<void>;
  triggerTestNotification: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const tasks = useLiveQuery(() => db.tasks.toArray(), [], [] as Task[]);
  const projects = useLiveQuery(() => db.projects.toArray(), [], [] as Project[]);
  const notes = useLiveQuery(() => db.notes.toArray(), [], [] as Note[]);
  const meetings = useLiveQuery(() => db.meetings.toArray(), [], [] as Meeting[]);
  const journalEntries = useLiveQuery(() => db.journalEntries.toArray(), [], [] as JournalEntry[]);
  const followUps = useLiveQuery(() => db.followUps.toArray(), [], [] as FollowUp[]);
  const preferences = useLiveQuery(() => db.preferences.get('default'), []);

  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [quickAddDefaults, setQuickAddDefaults] = useState<Partial<Task> | undefined>(undefined);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isEodReviewOpen, setIsEodReviewOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Initialize DB & check first-time onboarding tour status
  useEffect(() => {
    async function initDb() {
      try {
        const legacyTask = await db.tasks.get('task_1');
        if (legacyTask) {
          await clearAllWorkspaceData();
        }
        await preferencesRepo.get();

        // Check if user has seen onboarding tour
        const hasToured = localStorage.getItem('cmd_center_tour_seen');
        if (!hasToured) {
          setIsTourOpen(true);
        }
      } catch (err) {
        console.error('Error initializing database:', err);
      } finally {
        setIsLoading(false);
      }
    }
    initDb();
  }, []);

  // Keyboard shortcuts for Quick Capture & Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (e.target as HTMLElement)?.tagName;
      const isEditable = (e.target as HTMLElement)?.isContentEditable;
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag) || isEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      } else if (
        !isTyping &&
        (e.key.toLowerCase() === 'c' ||
          e.key.toLowerCase() === 'n' ||
          (e.altKey && e.key.toLowerCase() === 'n') ||
          (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a'))
      ) {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Toast system
  const showToast = useCallback((title: string, message?: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Task Actions
  const createTask = useCallback(async (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const task = await taskRepo.add(data);
    showToast('Task captured', `"${task.title}" saved cleanly.`);
    return task;
  }, [showToast]);

  const updateTask = useCallback(async (id: string, changes: Partial<Task>) => {
    const updated = await taskRepo.update(id, changes);
    return updated;
  }, []);

  const toggleTaskCompletion = useCallback(async (task: Task) => {
    const nextStatus = task.status === 'completed' ? 'not-started' : 'completed';
    const updated = await taskRepo.update(task.id, { status: nextStatus });

    if (nextStatus === 'completed') {
      // Check if recurring task
      if (task.recurringPattern && task.recurringPattern !== 'none') {
        const nextDueDate = calculateNextOccurrenceDate(task.dueDate, task.recurringPattern);
        
        // Reset subtasks for next occurrence
        const resetChecklist = (task.checklist || []).map((c) => ({ ...c, completed: false }));

        await taskRepo.add({
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: 'not-started',
          taskType: task.taskType,
          dueDate: nextDueDate,
          dueTime: task.dueTime,
          projectId: task.projectId,
          tags: [...(task.tags || [])],
          personInvolved: task.personInvolved,
          assignedBy: task.assignedBy,
          notes: task.notes,
          links: [...(task.links || [])],
          checklist: resetChecklist,
          dependencies: [],
          recurringPattern: task.recurringPattern,
          inInbox: false,
        });

        showToast(
          'Task completed!',
          `"${task.title}" completed. Next ${task.recurringPattern} occurrence scheduled for ${nextDueDate}.`,
          'success'
        );
      } else {
        showToast('Task completed', `"${task.title}" marked as complete.`);
      }
    }
    return updated;
  }, [showToast]);

  const deleteTask = useCallback(async (id: string) => {
    const t = tasks.find((item) => item.id === id);
    await taskRepo.delete(id);
    if (t) showToast('Task deleted', `"${t.title}" removed.`);
    if (activeTaskId === id) setActiveTaskId(null);
  }, [tasks, activeTaskId, showToast]);

  // Project Actions
  const createProject = useCallback(async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const project = await projectRepo.add(data);
    showToast('Project created', `"${project.name}" added.`);
    return project;
  }, [showToast]);

  const updateProject = useCallback(async (id: string, changes: Partial<Project>) => {
    const updated = await projectRepo.update(id, changes);
    showToast('Project updated', `"${updated.name}" saved.`);
    return updated;
  }, [showToast]);

  const deleteProject = useCallback(async (id: string, keepTasks = false) => {
    const p = projects.find((item) => item.id === id);
    await projectRepo.delete(id, keepTasks);
    if (p) showToast('Project deleted', `"${p.name}" removed.`);
  }, [projects, showToast]);

  // Note Actions
  const createNote = useCallback(async (data: Omit<Note, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const note = await noteRepo.add(data);
    showToast('Note created', `"${note.title}" saved.`);
    return note;
  }, [showToast]);

  const updateNote = useCallback(async (id: string, changes: Partial<Note>) => {
    const updated = await noteRepo.update(id, changes);
    return updated;
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    await noteRepo.delete(id);
    showToast('Note deleted');
  }, [showToast]);

  // Meeting Actions
  const createMeeting = useCallback(async (data: Omit<Meeting, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const mtg = await meetingRepo.add(data);
    showToast('Meeting record saved', `"${mtg.title}"`);
    return mtg;
  }, [showToast]);

  const updateMeeting = useCallback(async (id: string, changes: Partial<Meeting>) => {
    const updated = await meetingRepo.update(id, changes);
    return updated;
  }, []);

  const deleteMeeting = useCallback(async (id: string) => {
    await meetingRepo.delete(id);
    showToast('Meeting deleted');
  }, [showToast]);

  // Journal Actions
  const saveJournalEntry = useCallback(async (date: string, data: Partial<JournalEntry>) => {
    const entry = await journalRepo.saveForDate(date, data);
    showToast('Work Journal updated', `Entry for ${date} saved.`);
    return entry;
  }, [showToast]);

  // Follow-up Actions
  const createFollowUp = useCallback(async (data: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => {
    const item = await followUpRepo.add(data);
    showToast('Follow-up tracked', `Waiting on ${item.person}`);
    return item;
  }, [showToast]);

  const updateFollowUp = useCallback(async (id: string, changes: Partial<FollowUp>) => {
    const updated = await followUpRepo.update(id, changes);
    return updated;
  }, []);

  const deleteFollowUp = useCallback(async (id: string) => {
    await followUpRepo.delete(id);
    showToast('Follow-up removed');
  }, [showToast]);

  const updatePreferences = useCallback(async (changes: Partial<UserPreferences>) => {
    const updated = await preferencesRepo.update(changes);
    showToast('Preferences updated');
    return updated;
  }, [showToast]);

  const reloadDemoData = useCallback(async () => {
    await loadDemoData();
    showToast('Demo Data Loaded', 'Sample workspace items restored.');
  }, [showToast]);

  const clearDatabase = useCallback(async () => {
    await db.transaction('rw', [db.tasks, db.projects, db.notes, db.meetings, db.journalEntries, db.followUps], async () => {
      await db.tasks.clear();
      await db.projects.clear();
      await db.notes.clear();
      await db.meetings.clear();
      await db.journalEntries.clear();
      await db.followUps.clear();
    });
    showToast('Workspace Cleared', 'All local items removed.', 'warning');
  }, [showToast]);

  // Modal helpers
  const openQuickAdd = useCallback((defaultField?: Partial<Task>) => {
    setQuickAddDefaults(defaultField);
    setIsQuickAddOpen(true);
  }, []);

  const closeQuickAdd = useCallback(() => {
    setIsQuickAddOpen(false);
    setQuickAddDefaults(undefined);
  }, []);

  const openTaskDetail = useCallback((id: string) => {
    setActiveTaskId(id);
  }, []);

  const closeTaskDetail = useCallback(() => {
    setActiveTaskId(null);
  }, []);

  const openCommandPalette = useCallback(() => setIsCommandPaletteOpen(true), []);
  const closeCommandPalette = useCallback(() => setIsCommandPaletteOpen(false), []);

  const openEodReview = useCallback(() => setIsEodReviewOpen(true), []);
  const closeEodReview = useCallback(() => setIsEodReviewOpen(false), []);

  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const openTour = useCallback(() => setIsTourOpen(true), []);
  const closeTour = useCallback(() => {
    setIsTourOpen(false);
    try {
      localStorage.setItem('cmd_center_tour_seen', 'true');
    } catch {}
  }, []);

  // Notification State & Management
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const notifiedRemindersRef = React.useRef<Set<string>>(new Set());

  useEffect(() => {
    setNotificationPermission(getNotificationPermission());
  }, []);

  const requestAlertPermission = useCallback(async () => {
    const granted = await requestNotificationPermission();
    const perm = getNotificationPermission();
    setNotificationPermission(perm);
    if (granted) {
      sendSystemNotification('Alerts Activated', {
        body: 'System desktop alerts and sound chimes are now enabled.',
      });
      showToast('Alerts Enabled', 'System and audio notifications are active.', 'success');
    } else {
      showToast('Notifications Blocked', 'Please permit notifications in your browser/OS settings.', 'warning');
    }
  }, [showToast]);

  const triggerTestNotification = useCallback(() => {
    sendSystemNotification('Executive Notification Test', {
      body: 'Your alerts, sound chime, and notifications are operating correctly.',
    });
    showToast('Alerts Active', 'Test chime played and notification triggered.', 'info');
  }, [showToast]);

  // Background reminder scheduler (checks every 25 seconds)
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const todayStr = getTodayString();
      const currentHours = String(now.getHours()).padStart(2, '0');
      const currentMinutes = String(now.getMinutes()).padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;

      tasks.forEach((task) => {
        if (task.status === 'completed') return;

        // Check scheduled explicit reminder
        if (task.reminder && !task.reminder.dismissed) {
          const reminderKey = `reminder_${task.id}_${task.reminder.date}_${task.reminder.time || 'all-day'}`;
          if (notifiedRemindersRef.current.has(reminderKey)) return;

          const isDatePassedOrToday = task.reminder.date <= todayStr;
          const isTimePassedOrNow = !task.reminder.time || task.reminder.time <= currentTimeStr;

          if (isDatePassedOrToday && isTimePassedOrNow) {
            notifiedRemindersRef.current.add(reminderKey);
            sendSystemNotification(`🔔 Reminder: ${task.title}`, {
              body: task.description || (task.dueTime ? `Due at ${task.dueTime}` : 'Scheduled reminder alert'),
              tag: task.id,
            });
            showToast(`🔔 Reminder: ${task.title}`, task.dueTime ? `Due at ${task.dueTime}` : undefined, 'info');
          }
        }
      });
    };

    checkReminders();
    const interval = setInterval(checkReminders, 25000);
    return () => clearInterval(interval);
  }, [tasks, showToast]);

  return (
    <AppContext.Provider
      value={{
        tasks,
        projects,
        notes,
        meetings,
        journalEntries,
        followUps,
        preferences,
        isLoading,

        createTask,
        updateTask,
        toggleTaskCompletion,
        deleteTask,

        createProject,
        updateProject,
        deleteProject,

        createNote,
        updateNote,
        deleteNote,

        createMeeting,
        updateMeeting,
        deleteMeeting,

        saveJournalEntry,

        createFollowUp,
        updateFollowUp,
        deleteFollowUp,

        updatePreferences,
        reloadDemoData,
        clearDatabase,

        isQuickAddOpen,
        openQuickAdd,
        closeQuickAdd,
        quickAddDefaults,

        activeTaskId,
        openTaskDetail,
        closeTaskDetail,

        isCommandPaletteOpen,
        openCommandPalette,
        closeCommandPalette,

        isEodReviewOpen,
        openEodReview,
        closeEodReview,

        isSidebarOpen,
        toggleSidebar,
        closeSidebar,

        isTourOpen,
        openTour,
        closeTour,

        toasts,
        showToast,
        removeToast,

        notificationPermission,
        requestAlertPermission,
        triggerTestNotification,
      }}
    >
      {children}
      <ProductTourModal isOpen={isTourOpen} onClose={closeTour} />
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
