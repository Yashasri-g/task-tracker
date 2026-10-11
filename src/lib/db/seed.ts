import { db } from '@/lib/db';
import { getTodayString } from '@/lib/utils/date';
import { format, subDays, addDays } from 'date-fns';
import type { Task, Project, Note, Meeting, JournalEntry, FollowUp } from '@/types';

export async function hasExistingData(): Promise<boolean> {
  const count = await db.tasks.count();
  return count > 0;
}

export async function clearAllWorkspaceData(): Promise<void> {
  await db.transaction('rw', [db.tasks, db.projects, db.notes, db.meetings, db.journalEntries, db.followUps], async () => {
    await db.tasks.clear();
    await db.projects.clear();
    await db.notes.clear();
    await db.meetings.clear();
    await db.journalEntries.clear();
    await db.followUps.clear();
  });
}

export async function loadDemoData(): Promise<void> {
  const today = getTodayString();
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  const twoDaysAgo = format(subDays(new Date(), 2), 'yyyy-MM-dd');
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  const nextWeek = format(addDays(new Date(), 5), 'yyyy-MM-dd');
  const threeDaysAgo = format(subDays(new Date(), 3), 'yyyy-MM-dd');

  const demoProjects: Project[] = [
    {
      id: 'proj_q4_roadmap',
      name: 'Q4 Product Roadmap & Architecture',
      description: 'Strategic initiatives for enterprise scaling and modular design system rollout.',
      color: '#6366f1', // Indigo
      startDate: twoDaysAgo,
      targetDate: format(addDays(new Date(), 45), 'yyyy-MM-dd'),
      status: 'active',
      tags: ['Strategy', 'Architecture', 'Q4'],
      links: [
        { id: 'l1', title: 'Product Architecture PRD', url: 'https://internal.doc/prd-q4' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'proj_hiring',
      name: 'Senior Frontend Hiring & Onboarding',
      description: 'Interview loop and team onboarding guide for 2 Staff Frontend Engineers.',
      color: '#10b981', // Emerald
      startDate: subDays(new Date(), 10).toISOString(),
      targetDate: format(addDays(new Date(), 20), 'yyyy-MM-dd'),
      status: 'active',
      tags: ['Recruiting', 'Team'],
      links: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'proj_security_audit',
      name: 'SOC2 & Client Data Reliability Audit',
      description: 'Ensure local-first storage reliability and client privacy protocols.',
      color: '#f59e0b', // Amber
      startDate: subDays(new Date(), 15).toISOString(),
      targetDate: tomorrow,
      status: 'active',
      tags: ['Security', 'Compliance'],
      links: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const demoTasks: Task[] = [
    {
      id: 'task_1',
      title: 'Review and approve Q4 UI Component Library specs',
      description: 'Check spacing tokens, accessible dialog behaviors, and dark mode contrast ratios with design lead.',
      status: 'in-progress',
      priority: 'urgent',
      taskType: 'deliverable',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: today,
      dueTime: '15:00',
      projectId: 'proj_q4_roadmap',
      tags: ['Design System', 'Review'],
      notes: 'Focus on modal focus trap & escape key handler compliance.',
      links: [
        { id: 'l1', title: 'Figma Token Specs', url: 'https://figma.com/design-tokens' }
      ],
      checklist: [
        { id: 'c1', title: 'Audit color contrast ratios', completed: true },
        { id: 'c2', title: 'Verify keyboard navigation states', completed: true },
        { id: 'c3', title: 'Finalize Tailwind config extension', completed: false }
      ],
      dependencies: [],
      inInbox: false,
    },
    {
      id: 'task_2',
      title: 'Prepare executive summary for VP of Engineering sync',
      description: 'Synthesize team deliverables, milestone completion rates, and Q4 budget allocation.',
      status: 'not-started',
      priority: 'high',
      taskType: 'task',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: today,
      dueTime: '17:00',
      projectId: 'proj_q4_roadmap',
      tags: ['Executive', 'Prep'],
      links: [],
      checklist: [
        { id: 'c1', title: 'Draft key metrics bullet points', completed: false },
        { id: 'c2', title: 'Export completed work archive for last 14 days', completed: false }
      ],
      dependencies: [],
      inInbox: false,
    },
    {
      id: 'task_3',
      title: 'Confirm benchmark results for IndexedDB storage performance',
      description: 'Overdue task: Check transaction latency under 5,000 items workload.',
      status: 'not-started',
      priority: 'high',
      taskType: 'deliverable',
      createdAt: subDays(new Date(), 3).toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: yesterday, // Overdue!
      projectId: 'proj_security_audit',
      tags: ['Performance', 'Storage'],
      links: [],
      checklist: [],
      dependencies: [],
      inInbox: false,
    },
    {
      id: 'task_4',
      title: 'Follow up with Marcus on SOC2 compliance vendor contract',
      description: 'Waiting for vendor agreement redlines from legal counsel.',
      status: 'waiting',
      priority: 'medium',
      taskType: 'follow-up',
      createdAt: twoDaysAgo,
      updatedAt: new Date().toISOString(),
      dueDate: today,
      personInvolved: 'Marcus Vance (Legal)',
      waitingForDetails: {
        person: 'Marcus Vance',
        requestedDate: twoDaysAgo,
        expectedResponseDate: today,
        nextFollowUpDate: today,
        note: 'Sent revised terms on Tuesday.'
      },
      projectId: 'proj_security_audit',
      tags: ['Legal', 'Vendor'],
      links: [],
      checklist: [],
      dependencies: [],
      inInbox: false,
    },
    {
      id: 'task_5',
      title: 'Conduct Staff Frontend Candidate portfolio review',
      description: 'Review technical submission and architecture challenge notes.',
      status: 'completed',
      priority: 'medium',
      taskType: 'task',
      createdAt: yesterday,
      updatedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      dueDate: today,
      projectId: 'proj_hiring',
      tags: ['Hiring', 'Interview'],
      links: [],
      checklist: [
        { id: 'c1', title: 'Evaluate architecture submission', completed: true },
        { id: 'c2', title: 'Submit feedback scorecard in greenhouse', completed: true }
      ],
      dependencies: [],
      inInbox: false,
    },
    {
      id: 'task_6',
      title: 'Review feedback from UX research session on Quick Add modal',
      description: 'Unorganized capture in inbox from yesterday morning meeting.',
      status: 'not-started',
      priority: 'low',
      taskType: 'idea',
      createdAt: yesterday,
      updatedAt: yesterday,
      tags: ['UX', 'Feedback'],
      links: [],
      checklist: [],
      dependencies: [],
      inInbox: false,
    },
    {
      id: 'task_7',
      title: 'Prepare 1-on-1 career growth discussion agenda for Sarah',
      description: 'Upcoming task for next week.',
      status: 'not-started',
      priority: 'medium',
      taskType: 'task',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: nextWeek,
      projectId: 'proj_hiring',
      tags: ['Management'],
      links: [],
      checklist: [],
      dependencies: [],
      inInbox: false,
    }
  ];

  const demoNotes: Note[] = [
    {
      id: 'note_1',
      title: 'Local-First Architecture Principles & Data Integrity Rules',
      content: `# Local-First Architecture Standards

## Core Tenets
1. **Zero External Dependency**: Primary operations read/write directly to IndexedDB.
2. **Optimistic & Safe**: UI updates immediately, with transactional safety.
3. **Seamless Migration Path**: Storage layer isolated behind repository interfaces for future Postgres adapter.
4. **Data Privacy**: No telemetry, no tracking, local encrypted export available.`,
      tags: ['Architecture', 'Standards'],
      projectId: 'proj_q4_roadmap',
      relatedTaskIds: ['task_1'],
      createdAt: twoDaysAgo,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'note_2',
      title: 'Q4 Product Design System Color Tokens & Accessible Contrast',
      content: `### Palette Guidelines
- **Background**: Warm off-white (#f8fafc) in light mode; Slate charcoal (#0f172a) in dark mode.
- **Accents**: Indigo (#4f46e5) for focus, Rose (#ef4444) for overdue alerts, Emerald (#10b981) for completed work.
- **Typography**: Clean sans-serif hierarchy with clear line heights.`,
      tags: ['Design', 'Tokens'],
      projectId: 'proj_q4_roadmap',
      relatedTaskIds: ['task_1'],
      createdAt: yesterday,
      updatedAt: yesterday,
    }
  ];

  const demoMeetings: Meeting[] = [
    {
      id: 'mtg_1',
      title: 'Q4 Executive Alignment & Product Review',
      date: today,
      time: '11:00',
      participants: ['Alex Rivera (VP Eng)', 'Jordan Lee (Product Dir)', 'Self'],
      agenda: '1. Q4 Roadmap Priorities\n2. Design System Migration\n3. Staff Hiring Budget',
      notes: `Aligned on key Q4 priorities:
- Deliver personal work command center with offline IndexedDB storage.
- Implement guided weekly review and end-of-day workflow.
- Complete hiring loop for Senior Frontend role by end of month.`,
      decisions: [
        'Approved full design system overhaul in Q4.',
        'Adopt IndexedDB + Dexie repository pattern as primary storage standard.'
      ],
      actionItems: [
        { id: 'a1', title: 'Prepare executive summary for VP sync', assignee: 'Self', convertedTaskId: 'task_2', completed: false },
        { id: 'a2', title: 'Send updated candidate shortlist to Jordan', assignee: 'Self', completed: false }
      ],
      projectId: 'proj_q4_roadmap',
      createdAt: today,
      updatedAt: today,
    }
  ];

  const demoJournal: JournalEntry[] = [
    {
      id: `journal_${yesterday}`,
      date: yesterday,
      workCompleted: 'Finalized candidates portfolio evaluation for Senior Frontend role. Completed IndexedDB repository interface definitions.',
      importantDecisions: 'Decided to use Dexie.js for IndexedDB indexing and reactive query hooks.',
      challenges: 'Need to make sure JSON import handles duplicate IDs cleanly with merge vs replace options.',
      newAssignments: 'Draft executive summary before Thursday VP sync.',
      followUpsToRemember: 'Check contract redlines with Marcus in legal.',
      accomplishments: 'Pushed core architecture interfaces and repository layer cleanly.',
      notesForTomorrow: 'Focus on My Day dashboard metrics and Quick Add global modal.',
      relatedProjectIds: ['proj_q4_roadmap', 'proj_hiring'],
      relatedTaskIds: ['task_1', 'task_5'],
      createdAt: yesterday,
      updatedAt: yesterday,
    }
  ];

  const demoFollowUps: FollowUp[] = [
    {
      id: 'flw_1',
      title: 'SOC2 Vendor Contract Redlines',
      person: 'Marcus Vance (Legal)',
      relatedTaskId: 'task_4',
      relatedProjectId: 'proj_security_audit',
      requestedDate: twoDaysAgo,
      expectedResponseDate: today,
      nextFollowUpDate: today,
      status: 'pending',
      notes: 'Follow up via internal chat if no reply by 3 PM.',
      links: [],
      createdAt: twoDaysAgo,
      updatedAt: today,
    }
  ];

  await db.transaction('rw', [db.tasks, db.projects, db.notes, db.meetings, db.journalEntries, db.followUps], async () => {
    await db.tasks.clear();
    await db.projects.clear();
    await db.notes.clear();
    await db.meetings.clear();
    await db.journalEntries.clear();
    await db.followUps.clear();

    await db.projects.bulkPut(demoProjects);
    await db.tasks.bulkPut(demoTasks);
    await db.notes.bulkPut(demoNotes);
    await db.meetings.bulkPut(demoMeetings);
    await db.journalEntries.bulkPut(demoJournal);
    await db.followUps.bulkPut(demoFollowUps);
  });
}
