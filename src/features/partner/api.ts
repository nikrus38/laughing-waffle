import { api } from '../../shared/api/client';
import type {
  ApplicationStatus,
  PartnerApplication,
  PartnerOverview,
  PartnerTask,
  TaskDraft,
} from './types';

/** Тонкая обёртка над JSON API: кабинет партнёра не дублирует обработку ошибок. */

export const partnerApi = {
  overview: () => api.get<PartnerOverview>('/api/partner/overview/'),

  tasks: () => api.get<{ tasks: PartnerTask[] }>('/api/partner/tasks/'),

  task: (code: string) =>
    api.get<{ task: PartnerTask }>(`/api/partner/tasks/${code}/`).catch(() => null),

  createTask: (draft: TaskDraft) =>
    api.post<{ task: PartnerTask }>('/api/partner/tasks/', draft),

  updateTask: (code: string, draft: TaskDraft) =>
    api.patch<{ task: PartnerTask }>(`/api/partner/tasks/${code}/`, draft),

  toggleTask: (code: string, status: 'open' | 'closed') =>
    api.post<{ task: PartnerTask }>(`/api/partner/tasks/${code}/status/`, { status }),

  setApplicationStatus: (id: number, status: ApplicationStatus) =>
    api.patch<{ application: unknown }>(`/api/partner/applications/${id}/`, { status }),

  applicationsFor: (code: string) =>
    api.get<{ applications: PartnerApplication[] }>(
      `/api/partner/applications/?task=${encodeURIComponent(code)}`,
    ),
};
