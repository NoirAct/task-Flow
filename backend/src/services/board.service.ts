import { boardRepository } from "../repositories/board.repository.js";
import { projectRepository } from "../repositories/project.repository.js";
import { taskRepository } from "../repositories/task.repository.js";
import { AppError } from "../utils/errors.js";
import type {
  CreateTaskInput,
  MoveTaskInput,
  UpdateTaskInput,
} from "../validators/task.validator.js";

function mapTask(task: {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: task.id,
    columnId: task.columnId,
    title: task.title,
    description: task.description,
    position: task.position,
    createdById: task.createdById,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

function mapBoard(
  board: NonNullable<Awaited<ReturnType<typeof boardRepository.findByProjectId>>>,
) {
  return {
    id: board.id,
    name: board.name,
    projectId: board.projectId,
    project: board.project,
    columns: board.columns.map((column) => ({
      id: column.id,
      key: column.key,
      name: column.name,
      position: column.position,
      tasks: column.tasks.map(mapTask),
    })),
  };
}

async function assertProjectAccess(userId: string, projectId: string) {
  const project = await projectRepository.findByIdForUser(projectId, userId);
  if (!project) {
    throw new AppError(404, "Project not found", "NOT_FOUND");
  }
  return project;
}

export const boardService = {
  async getByProjectId(userId: string, projectId: string) {
    await assertProjectAccess(userId, projectId);

    let board = await boardRepository.findByProjectId(projectId);
    if (!board) {
      board = await boardRepository.createForProject(projectId);
    }

    return mapBoard(board);
  },

  async createTask(userId: string, input: CreateTaskInput) {
    const column = await taskRepository.findColumnById(input.columnId);
    if (!column) {
      throw new AppError(404, "Column not found", "NOT_FOUND");
    }

    await assertProjectAccess(userId, column.board.projectId);

    const position = column.tasks.length;
    const task = await taskRepository.create({
      columnId: input.columnId,
      title: input.title,
      description: input.description ?? null,
      position,
      createdById: userId,
    });

    return mapTask(task);
  },

  async updateTask(userId: string, taskId: string, input: UpdateTaskInput) {
    const existing = await taskRepository.findById(taskId);
    if (!existing) {
      throw new AppError(404, "Task not found", "NOT_FOUND");
    }

    await assertProjectAccess(userId, existing.column.board.projectId);

    const task = await taskRepository.update(taskId, {
      title: input.title,
      description: input.description,
    });

    return mapTask(task);
  },

  async moveTask(userId: string, taskId: string, input: MoveTaskInput) {
    const existing = await taskRepository.findById(taskId);
    if (!existing) {
      throw new AppError(404, "Task not found", "NOT_FOUND");
    }

    await assertProjectAccess(userId, existing.column.board.projectId);

    const targetColumn = await taskRepository.findColumnById(input.columnId);
    if (!targetColumn) {
      throw new AppError(404, "Column not found", "NOT_FOUND");
    }

    if (targetColumn.board.projectId !== existing.column.board.projectId) {
      throw new AppError(400, "Cannot move task to another project", "INVALID_MOVE");
    }

    const sourceColumnId = existing.columnId;
    const targetColumnId = input.columnId;
    const sameColumn = sourceColumnId === targetColumnId;

    const sourceColumn = await taskRepository.findColumnById(sourceColumnId);
    if (!sourceColumn) {
      throw new AppError(404, "Column not found", "NOT_FOUND");
    }

    const sourceIds = sourceColumn.tasks.map((task) => task.id).filter((id) => id !== taskId);
    const targetIds = sameColumn
      ? [...sourceIds]
      : targetColumn.tasks.map((task) => task.id);

    const insertAt = Math.min(Math.max(input.position, 0), targetIds.length);
    targetIds.splice(insertAt, 0, taskId);

    if (sameColumn) {
      await taskRepository.reorderColumn(targetColumnId, targetIds);
    } else {
      await taskRepository.reorderColumn(sourceColumnId, sourceIds);
      await taskRepository.reorderColumn(targetColumnId, targetIds);
    }

    const moved = await taskRepository.findById(taskId);
    return mapTask(moved!);
  },

  async deleteTask(userId: string, taskId: string) {
    const existing = await taskRepository.findById(taskId);
    if (!existing) {
      throw new AppError(404, "Task not found", "NOT_FOUND");
    }

    await assertProjectAccess(userId, existing.column.board.projectId);

    const columnId = existing.columnId;
    await taskRepository.delete(taskId);

    const remaining = (await taskRepository.findColumnById(columnId))!.tasks.map(
      (task) => task.id,
    );
    await taskRepository.reorderColumn(columnId, remaining);
  },
};
