export type Project = {
  id: string;
  name: string;
  description: string | null;
  key: string;
  color: string;
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
};

export type CreateProjectInput = {
  name: string;
  description?: string | null;
  key?: string;
  color?: string;
};

export type UpdateProjectInput = {
  name?: string;
  description?: string | null;
  color?: string;
};
