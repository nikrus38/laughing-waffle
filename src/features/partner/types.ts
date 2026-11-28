/** Типы кабинета партнёра: совпадают с ответами /api/partner/*. */

export type ApplicationStatus = 'new' | 'shortlisted' | 'invited' | 'rejected';
export type TaskStatus = 'open' | 'closed';

export interface PartnerTask {
  id: string;
  title: string;
  summary: string;
  partnerLabel: string;
  required: Record<string, number>;
  difficulty: number;
  weeks: number;
  tags: string[];
  status: TaskStatus;
  applicationsCount: number;
  createdAt: string;
  isMock: boolean;
}

export interface PartnerApplication {
  id: number;
  student: string;
  initials: string;
  course: number;
  taskId: string;
  taskTitle: string;
  status: ApplicationStatus;
  createdAt: string;
  match: number | null;
}

export interface PartnerOverview {
  stats: {
    tasks: number;
    openTasks: number;
    applications: number;
    students: number;
    difficulty: number;
  };
  byStatus: Record<ApplicationStatus, number>;
  demand: Array<{ id: string; label: string; count: number }>;
  tasks: PartnerTask[];
  applications: PartnerApplication[];
  competencies: Array<{ id: string; label: string }>;
}

export interface TaskDraft {
  title: string;
  summary: string;
  difficulty: number;
  weeks: number;
  tags: string[];
  required: Record<string, number>;
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  new: 'Новый',
  shortlisted: 'В шортлисте',
  invited: 'Приглашён',
  rejected: 'Отклонён',
};

export const STATUS_ORDER: ApplicationStatus[] = ['new', 'shortlisted', 'invited', 'rejected'];
