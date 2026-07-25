import { apiRequest } from "@/services/api";
import type {
  CreateProjectInput,
  Project,
  ProjectListParams,
  ProjectListResponse,
  UpdateProjectInput,
} from "@/types/project";

function toQuery(params: ProjectListParams = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.archived) query.set("archived", params.archived);
  if (params.favorites) query.set("favorites", params.favorites);
  if (params.status) query.set("status", params.status);
  if (params.page) query.set("page", String(params.page));
  if (params.perPage) query.set("perPage", String(params.perPage));
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export const projectsApi = {
  list(params?: ProjectListParams) {
    return apiRequest<ProjectListResponse>(`/projects${toQuery(params)}`);
  },

  get(id: string) {
    return apiRequest<{ project: Project }>(`/projects/${id}`);
  },

  create(data: CreateProjectInput) {
    return apiRequest<{ project: Project }>("/projects", {
      method: "POST",
      body: data,
    });
  },

  update(id: string, data: UpdateProjectInput) {
    return apiRequest<{ project: Project }>(`/projects/${id}`, {
      method: "PATCH",
      body: data,
    });
  },

  archive(id: string) {
    return apiRequest<{ project: Project }>(`/projects/${id}/archive`, {
      method: "POST",
    });
  },

  restore(id: string) {
    return apiRequest<{ project: Project }>(`/projects/${id}/restore`, {
      method: "POST",
    });
  },

  remove(id: string) {
    return apiRequest<void>(`/projects/${id}`, { method: "DELETE" });
  },

  favorite(id: string) {
    return apiRequest<{ project: Project }>(`/projects/${id}/favorite`, {
      method: "POST",
    });
  },

  unfavorite(id: string) {
    return apiRequest<{ project: Project }>(`/projects/${id}/favorite`, {
      method: "DELETE",
    });
  },

  duplicate(id: string) {
    return apiRequest<{ project: Project }>(`/projects/${id}/duplicate`, {
      method: "POST",
    });
  },
};
