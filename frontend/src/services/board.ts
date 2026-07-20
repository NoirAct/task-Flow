import { apiRequest } from "@/services/api";
import type { Board, BoardTask } from "@/types/board";

export const boardApi = {
  getByProject(projectId: string) {
    return apiRequest<{ board: Board }>(`/projects/${projectId}/board`);
  },

  createTask(data: { columnId: string; title: string; description?: string | null }) {
    return apiRequest<{ task: BoardTask }>("/tasks", {
      method: "POST",
      body: data,
    });
  },

  updateTask(taskId: string, data: { title?: string; description?: string | null }) {
    return apiRequest<{ task: BoardTask }>(`/tasks/${taskId}`, {
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
};
