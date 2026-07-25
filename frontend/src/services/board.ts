import { apiDownload, apiRequest, apiUpload } from "@/services/api";
import type {
  Board,
  BoardColumn,
  BoardTask,
  ChecklistItem,
  Subtask,
  TaskAttachment,
  TaskComment,
  TaskDetail,
  TaskLabel,
  TaskPriority,
} from "@/types/board";

export type UpdateTaskPayload = {
  title?: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
  estimatedMinutes?: number | null;
  spentMinutes?: number;
  assigneeId?: string | null;
  labelIds?: string[];
};

export const boardApi = {
  getByProject(projectId: string) {
    return apiRequest<{ board: Board }>(`/projects/${projectId}/board`);
  },

  getTask(taskId: string) {
    return apiRequest<{ task: TaskDetail }>(`/tasks/${taskId}`);
  },

  createTask(data: { columnId: string; title: string; description?: string | null }) {
    return apiRequest<{ task: BoardTask }>("/tasks", {
      method: "POST",
      body: data,
    });
  },

  updateTask(taskId: string, data: UpdateTaskPayload) {
    return apiRequest<{ task: TaskDetail }>(`/tasks/${taskId}`, {
      method: "PATCH",
      body: data,
    });
  },

  moveTask(taskId: string, data: { columnId: string; position: number }) {
    return apiRequest<{ task: BoardTask }>(`/tasks/${taskId}/move`, {
      method: "POST",
      body: data,
    });
  },

  deleteTask(taskId: string) {
    return apiRequest<void>(`/tasks/${taskId}`, { method: "DELETE" });
  },

  listLabels(projectId: string) {
    return apiRequest<{ labels: TaskLabel[] }>(`/projects/${projectId}/labels`);
  },

  createLabel(projectId: string, data: { name: string; color?: string }) {
    return apiRequest<{ label: TaskLabel }>(`/projects/${projectId}/labels`, {
      method: "POST",
      body: data,
    });
  },

  createColumn(boardId: string, name: string) {
    return apiRequest<{ column: BoardColumn }>(`/boards/${boardId}/columns`, {
      method: "POST",
      body: { name },
    });
  },

  updateColumn(columnId: string, name: string) {
    return apiRequest<{ column: Omit<BoardColumn, "tasks"> }>(`/columns/${columnId}`, {
      method: "PATCH",
      body: { name },
    });
  },

  deleteColumn(columnId: string) {
    return apiRequest<void>(`/columns/${columnId}`, { method: "DELETE" });
  },

  reorderColumns(boardId: string, columnIds: string[]) {
    return apiRequest<void>(`/boards/${boardId}/columns/reorder`, {
      method: "POST",
      body: { columnIds },
    });
  },

  addSubtask(taskId: string, title: string) {
    return apiRequest<{ subtask: Subtask }>(`/tasks/${taskId}/subtasks`, {
      method: "POST",
      body: { title },
    });
  },

  updateSubtask(subtaskId: string, data: { title?: string; done?: boolean }) {
    return apiRequest<{ subtask: Subtask }>(`/subtasks/${subtaskId}`, {
      method: "PATCH",
      body: data,
    });
  },

  deleteSubtask(subtaskId: string) {
    return apiRequest<void>(`/subtasks/${subtaskId}`, { method: "DELETE" });
  },

  setFavorite(taskId: string, favorite: boolean) {
    return apiRequest<{ taskId: string; isFavorite: boolean }>(
      `/tasks/${taskId}/favorite`,
      { method: favorite ? "POST" : "DELETE" },
    );
  },

  addChecklistItem(taskId: string, title: string) {
    return apiRequest<{ item: ChecklistItem }>(`/tasks/${taskId}/checklist`, {
      method: "POST",
      body: { title },
    });
  },

  updateChecklistItem(itemId: string, data: { title?: string; done?: boolean }) {
    return apiRequest<{ item: ChecklistItem }>(`/checklist/${itemId}`, {
      method: "PATCH",
      body: data,
    });
  },

  deleteChecklistItem(itemId: string) {
    return apiRequest<void>(`/checklist/${itemId}`, { method: "DELETE" });
  },

  createComment(taskId: string, body: string) {
    return apiRequest<{ comment: TaskComment }>(`/tasks/${taskId}/comments`, {
      method: "POST",
      body: { body },
    });
  },

  updateComment(commentId: string, body: string) {
    return apiRequest<{ comment: TaskComment }>(`/comments/${commentId}`, {
      method: "PATCH",
      body: { body },
    });
  },

  deleteComment(commentId: string) {
    return apiRequest<void>(`/comments/${commentId}`, { method: "DELETE" });
  },

  uploadTaskAttachment(taskId: string, file: File) {
    return apiUpload<{ attachment: TaskAttachment }>(
      `/tasks/${taskId}/attachments`,
      file,
    );
  },

  uploadCommentAttachment(commentId: string, file: File) {
    return apiUpload<{ attachment: TaskAttachment }>(
      `/comments/${commentId}/attachments`,
      file,
    );
  },

  downloadAttachment(attachment: TaskAttachment) {
    return apiDownload(attachment.url, attachment.originalName);
  },

  deleteAttachment(attachmentId: string) {
    return apiRequest<void>(`/attachments/${attachmentId}`, { method: "DELETE" });
  },
};
