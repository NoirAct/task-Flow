export type ProjectStatus = "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELED";

export type Project = {
  id: string;
  name: string;
  description: string | null;
  key: string;
  color: string;
  icon: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  teamId: string | null;
  ownerId: string;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  isArchived: boolean;
};

export type ProjectListParams = {
  search?: string;
  archived?: "true" | "false" | "all";
  favorites?: "true" | "false";
  status?: ProjectStatus;
  page?: number;
  perPage?: number;
};

export type ProjectListResponse = {
  projects: Project[];
  total: number;
  page: number;
  perPage: number;
};

export type CreateProjectInput = {
  name: string;
  description?: string | null;
  key?: string;
  color?: string;
  icon?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  teamId?: string | null;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string | null;
  color?: string;
  icon?: string | null;
  status?: ProjectStatus;
  startDate?: string | null;
  endDate?: string | null;
  teamId?: string | null;
};
