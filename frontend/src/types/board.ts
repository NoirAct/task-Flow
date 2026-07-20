export type TaskPriority = "NONE" | "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type UserSummary = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export type TaskLabel = {
  id: string;
  name: string;
  color: string;
};

export type ChecklistItem = {
  id: string;
  title: string;
  done: boolean;
  position: number;
};

export type TaskAttachment = {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  uploadedBy: { id: string; name: string } | null;
  url: string;
};

export type TaskComment = {
  id: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  author: UserSummary | null;
  attachments: TaskAttachment[];
};

export type BoardTask = {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  priority: TaskPriority;
  dueDate: string | null;
  estimatedMinutes: number | null;
  spentMinutes: number;
  assigneeId: string | null;
  assignee: UserSummary | null;
  createdById: string | null;
  createdAt: string;
  updatedAt: string;
  labels: TaskLabel[];
  checklistTotal: number;
  checklistDone: number;
};

export type TaskDetail = BoardTask & {
  createdBy: UserSummary | null;
  checklist: ChecklistItem[];
  comments: TaskComment[];
  attachments: TaskAttachment[];
};

export type BoardColumn = {
  id: string;
  key: string;
  name: string;
  position: number;
  tasks: BoardTask[];
};

export type Board = {
  id: string;
  name: string;
  projectId: string;
  project: {
    id: string;
    name: string;
    key: string;
    color: string;
    ownerId: string;
    owner: UserSummary | null;
  };
  columns: BoardColumn[];
};
