import { apiRequest } from "@/services/api";
import type { User } from "@/types/auth";

export type TeamRole = "ADMIN" | "MANAGER" | "DEVELOPER" | "VIEWER";

export type Team = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  memberCount: number;
  projectCount: number;
  createdAt: string;
  members?: {
    id: string;
    role: TeamRole;
    user: { id: string; name: string; email: string; avatarUrl: string | null };
  }[];
  invites?: {
    id: string;
    email: string;
    role: TeamRole;
    status: string;
    expiresAt: string;
    inviteUrl?: string;
  }[];
};

export type DashboardSummary = {
  projectsCount: number;
  teamCount: number;
  notificationsUnread: number;
  tasks: {
    total: number;
    pending: number;
    inProgress: number;
    done: number;
    myAssigned: number;
    overdue: number;
  };
  hoursWorked: number;
  estimatedHours: number;
  productivity: number;
  activity: {
    id: string;
    action: string;
    entityType: string;
    entityId: string | null;
    createdAt: string;
    user: { id: string; name: string; avatarUrl: string | null };
    project: { id: string; name: string; key: string } | null;
  }[];
};

export type CalendarEvent = {
  id: string;
  title: string;
  dueDate: string;
  priority: string;
  columnKey: string;
  project: { id: string; name: string; key: string; color: string };
  assignee: { id: string; name: string; avatarUrl: string | null } | null;
};

export type AppNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
};

export const appApi = {
  listTeams() {
    return apiRequest<{ teams: Team[] }>("/teams");
  },
  getTeam(id: string) {
    return apiRequest<{ team: Team }>(`/teams/${id}`);
  },
  createTeam(data: { name: string; description?: string | null }) {
    return apiRequest<{ team: Team }>("/teams", { method: "POST", body: data });
  },
  invite(teamId: string, data: { email: string; role?: TeamRole }) {
    return apiRequest<{ invite: NonNullable<Team["invites"]>[number] }>(
      `/teams/${teamId}/invites`,
      { method: "POST", body: data },
    );
  },
  acceptInvite(token: string) {
    return apiRequest<{ teamId: string; teamName: string }>(
      `/invites/${token}/accept`,
      { method: "POST" },
    );
  },
  updateMemberRole(teamId: string, memberId: string, role: TeamRole) {
    return apiRequest(`/teams/${teamId}/members/${memberId}`, {
      method: "PATCH",
      body: { role },
    });
  },
  removeMember(teamId: string, memberId: string) {
    return apiRequest<void>(`/teams/${teamId}/members/${memberId}`, {
      method: "DELETE",
    });
  },
  dashboard() {
    return apiRequest<{ summary: DashboardSummary }>("/dashboard");
  },
  calendar(from?: string, to?: string) {
    const qs = new URLSearchParams();
    if (from) qs.set("from", from);
    if (to) qs.set("to", to);
    const query = qs.toString();
    return apiRequest<{ events: CalendarEvent[] }>(
      `/calendar${query ? `?${query}` : ""}`,
    );
  },
  notifications() {
    return apiRequest<{ notifications: AppNotification[] }>("/notifications");
  },
  markNotificationRead(id: string) {
    return apiRequest(`/notifications/${id}/read`, { method: "POST" });
  },
  markAllNotificationsRead() {
    return apiRequest<void>("/notifications/read-all", { method: "POST" });
  },
  updateProfile(data: Partial<User> & { skills?: string[] }) {
    return apiRequest<{ user: User }>("/profile", { method: "PATCH", body: data });
  },
  profileProjects() {
    return apiRequest<{
      projects: { id: string; name: string; key: string; color: string; description: string | null }[];
    }>("/profile/projects");
  },
  search(q: string) {
    return apiRequest<{
      projects: { id: string; name: string; key: string; color: string }[];
      tasks: {
        id: string;
        title: string;
        projectId: string;
        projectName: string;
        projectKey: string;
      }[];
      teams: { id: string; name: string }[];
    }>(`/search?q=${encodeURIComponent(q)}`);
  },
};
