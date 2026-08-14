import type {
  AdminSettings,
  AdminUser,
  AiUsageStats,
  CommunityPost,
  CommunityReport,
  FeedbackItem,
  LessonModule,
  OverviewResponse,
  PreservedWord,
  ReportStatus,
  UserDetail,
  UserFilters,
  UserListResponse,
  UserRole,
  UserStatus,
  XpOverview,
} from "@/types";
import { mockApi } from "./mock";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

async function http<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_ADMIN_TOKEN ?? ""}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    throw new Error(`Request failed (${res.status}): ${path}`);
  }
  return (await res.json()) as T;
}

export const api = {
  getOverview: (): Promise<OverviewResponse> =>
    USE_MOCK ? mockApi.getOverview() : http("GET", "/api/admin/analytics/overview"),

  listUsers: (filters: UserFilters, page: number, perPage: number): Promise<UserListResponse> =>
    USE_MOCK
      ? mockApi.listUsers(filters, page, perPage)
      : http<UserListResponse>("GET", `/api/admin/users?page=${page}&perPage=${perPage}`),

  getUser: (id: number): Promise<UserDetail> =>
    USE_MOCK ? mockApi.getUser(id) : http("GET", `/api/admin/users/${id}`),

  updateUserRole: (id: number, role: UserRole): Promise<AdminUser> =>
    USE_MOCK ? mockApi.updateUserRole(id, role) : http("PATCH", `/api/admin/users/${id}/role`, { role }),

  updateUserStatus: (id: number, status: UserStatus): Promise<AdminUser> =>
    USE_MOCK ? mockApi.updateUserStatus(id, status) : http("PATCH", `/api/admin/users/${id}/status`, { status }),

  verifyUser: (id: number, verified: boolean): Promise<AdminUser> =>
    USE_MOCK ? mockApi.verifyUser(id, verified) : http("POST", `/api/admin/users/${id}/verify`, { verified }),

  listLessons: (): Promise<LessonModule[]> =>
    USE_MOCK ? mockApi.listLessons() : http("GET", "/api/admin/lessons"),

  createLesson: (data: Partial<LessonModule>): Promise<LessonModule> =>
    USE_MOCK ? mockApi.createLesson(data as LessonModule) : http("POST", "/api/admin/lessons", data),

  updateLesson: (id: number, data: Partial<LessonModule>): Promise<LessonModule> =>
    USE_MOCK ? mockApi.updateLesson(id, data) : http("PUT", `/api/admin/lessons/${id}`, data),

  deleteLesson: (id: number): Promise<void> =>
    USE_MOCK ? mockApi.deleteLesson(id) : http("DELETE", `/api/admin/lessons/${id}`),

  listPosts: (): Promise<CommunityPost[]> =>
    USE_MOCK ? mockApi.listPosts() : http("GET", "/api/admin/community/posts"),

  toggleFeatured: (id: number): Promise<CommunityPost> =>
    USE_MOCK ? mockApi.toggleFeatured(id) : http("PATCH", `/api/admin/community/posts/${id}`, { featured: true }),

  setPostHidden: (id: number, hidden: boolean): Promise<CommunityPost> =>
    USE_MOCK ? mockApi.setPostHidden(id, hidden) : http("PATCH", `/api/admin/community/posts/${id}`, { hidden }),

  deletePost: (id: number): Promise<void> =>
    USE_MOCK ? mockApi.deletePost(id) : http("DELETE", `/api/admin/community/posts/${id}`),

  listReports: (): Promise<CommunityReport[]> =>
    USE_MOCK ? mockApi.listReports() : http("GET", "/api/admin/community/reports"),

  updateReportStatus: (id: number, status: ReportStatus): Promise<CommunityReport> =>
    USE_MOCK ? mockApi.updateReportStatus(id, status) : http("PATCH", `/api/admin/community/reports/${id}`, { status }),

  getAiUsage: (): Promise<AiUsageStats> =>
    USE_MOCK ? mockApi.getAiUsage() : http("GET", "/api/admin/ai/usage"),

  getXpOverview: (): Promise<XpOverview> =>
    USE_MOCK ? mockApi.getXpOverview() : http("GET", "/api/admin/xp/overview"),

  listFeedback: (): Promise<FeedbackItem[]> =>
    USE_MOCK ? mockApi.listFeedback() : http("GET", "/api/admin/feedback"),

  resolveFeedback: (id: number): Promise<FeedbackItem> =>
    USE_MOCK ? mockApi.resolveFeedback(id) : http("PATCH", `/api/admin/feedback/${id}`),

  listPreserved: (): Promise<PreservedWord[]> =>
    USE_MOCK ? mockApi.listPreserved() : http("GET", "/api/admin/preservation"),

  verifyPreserved: (id: number, status: PreservedWord["status"]): Promise<PreservedWord> =>
    USE_MOCK ? mockApi.verifyPreserved(id, status) : http("POST", `/api/admin/preservation/${id}`, { status }),

  getSettings: (): Promise<AdminSettings> =>
    USE_MOCK ? mockApi.getSettings() : http("GET", "/api/admin/settings"),

  updateSettings: (patch: Partial<AdminSettings>): Promise<AdminSettings> =>
    USE_MOCK ? mockApi.updateSettings(patch) : http("PUT", "/api/admin/settings", patch),
};