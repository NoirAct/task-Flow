import type { TaskPriority } from "@prisma/client";
import { boardRepository } from "../repositories/board.repository.js";
import { projectRepository } from "../repositories/project.repository.js";
import { taskRepository } from "../repositories/task.repository.js";
import { AppError } from "../utils/errors.js";
import type {
  CreateChecklistItemInput,
  CreateLabelInput,
  CreateTaskInput,
  MoveTaskInput,
  UpdateChecklistItemInput,
  UpdateTaskInput,
} from "../validators/task.validator.js";

type UserSummary = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

type LabelSummary = {
  id: string;
  name: string;
  color: string;
};

function mapUser(user: UserSummary | null | undefined) {
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
  };
}

function mapLabel(label: LabelSummary) {
  return {
    id: label.id,
    name: label.name,
    color: label.color,
  };
}

function mapTaskCard(task: {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  position: number;
  priority: TaskPriority;
  dueDate: Date | null;
  estimatedMinutes: number | null;
  spentMinutes: number;
  assigneeId: string | null;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
  labels?: { label: LabelSummary }[];
  checklist?: { id: string; done: boolean }[];
  assignee?: UserSummary | null;
}) {
  const checklistTotal = task.checklist?.length ?? 0;
  const checklistDone = task.checklist?.filter((item) => item.done).length ?? 0;

  return {
    id: task.id,
    columnId: task.columnId,
    title: task.title,
    description: task.description,
    position: task.position,
    priority: task.priority,
    dueDate: task.dueDate,
    estimatedMinutes: task.estimatedMinutes,
    spentMinutes: task.spentMinutes,
    assigneeId: task.assigneeId,
    assignee: mapUser(task.assignee),
    createdById: task.createdById,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
    labels: (task.labels ?? []).map((item) => mapLabel(item.label)),
    checklistTotal,
    checklistDone,
  };
}

function mapTaskDetail(
  task: NonNullable<Awaited<ReturnType<typeof taskRepository.findById>>>,
) {
  return {
    ...mapTaskCard(task),
    createdBy: mapUser(task.createdBy),
    checklist: task.checklist.map((item) => ({
      id: item.id,
      title: item.title,
      done: item.done,
      position: item.position,
    })),
  };
}

function mapBoard(
  board: NonNullable<Awaited<ReturnType<typeof boardRepository.findByProjectId>>>,
) {
  return {
    id: board.id,
    name: board.name,
    projectId: board.projectId,
    project: {
      id: board.project.id,
      name: board.project.name,
      key: board.project.key,
      color: board.project.color,
      ownerId: board.project.ownerId,
      owner: mapUser(board.project.owner),
    },
    columns: board.columns.map((column) => ({
      id: column.id,
      key: column.key,
      name: column.name,
      position: column.position,
      tasks: column.tasks.map(mapTaskCard),
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

async function assertValidLabels(projectId: string, labelIds?: string[]) {
  if (!labelIds?.length) return;
  const labels = await taskRepository.findLabelsByIds(projectId, labelIds);
  if (labels.length !== labelIds.length) {
    throw new AppError(400, "One or more labels are invalid", "INVALID_LABELS");
  }
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

  async getTask(userId: string, taskId: string) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(404, "Task not found", "NOT_FOUND");
    }
    await assertProjectAccess(userId, task.column.board.projectId);
    return mapTaskDetail(task);
  },

  async createTask(userId: string, input: CreateTaskInput) {
    const column = await taskRepository.findColumnById(input.columnId);
    if (!column) {
      throw new AppError(404, "Column not found", "NOT_FOUND");
    }

    await assertProjectAccess(userId, column.board.projectId);
    await assertValidLabels(column.board.projectId, input.labelIds);

    const position = column.tasks.length;
    const task = await taskRepository.create({
      columnId: input.columnId,
      title: input.title,
      description: input.description ?? null,
      position,
      createdById: userId,
      priority: input.priority,
      dueDate: input.dueDate ? new Date(input.dueDate) : input.dueDate === null ? null : undefined,
      estimatedMinutes: input.estimatedMinutes,
      assigneeId: input.assigneeId,
      labelIds: input.labelIds,
    });

    return mapTaskCard(task);
  },

  async updateTask(userId: string, taskId: string, input: UpdateTaskInput) {
    const existing = await taskRepository.findById(taskId);
    if (!existing) {
      throw new AppError(404, "Task not found", "NOT_FOUND");
    }

    const projectId = existing.column.board.projectId;
    await assertProjectAccess(userId, projectId);
    await assertValidLabels(projectId, input.labelIds);

    const task = await taskRepository.update(taskId, {
      title: input.title,
      description: input.description,
      priority: input.priority,
      dueDate:
        input.dueDate === undefined
          ? undefined
          : input.dueDate
            ? new Date(input.dueDate)
            : null,
      estimatedMinutes: input.estimatedMinutes,
      spentMinutes: input.spentMinutes,
      assigneeId: input.assigneeId,
      labelIds: input.labelIds,
    });

    return mapTaskDetail(task);
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
    return mapTaskCard(moved!);
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

  async listLabels(userId: string, projectId: string) {
    await assertProjectAccess(userId, projectId);
    const labels = await taskRepository.listLabels(projectId);
    return labels.map(mapLabel);
  },

  async createLabel(userId: string, projectId: string, input: CreateLabelInput) {
    await assertProjectAccess(userId, projectId);
    const label = await taskRepository.createLabel({
      projectId,
      name: input.name,
      color: input.color ?? "#8b95a5",
    });
    return mapLabel(label);
  },

  async addChecklistItem(userId: string, taskId: string, input: CreateChecklistItemInput) {
    const task = await taskRepository.findById(taskId);
    if (!task) {
      throw new AppError(404, "Task not found", "NOT_FOUND");
    }
    await assertProjectAccess(userId, task.column.board.projectId);

    const position = await taskRepository.countChecklist(taskId);
    const item = await taskRepository.createChecklistItem({
      taskId,
      title: input.title,
      position,
    });

    return {
      id: item.id,
      title: item.title,
      done: item.done,
      position: item.position,
    };
  },

  async updateChecklistItem(
    userId: string,
    itemId: string,
    input: UpdateChecklistItemInput,
  ) {
    const item = await taskRepository.findChecklistItem(itemId);
    if (!item) {
      throw new AppError(404, "Checklist item not found", "NOT_FOUND");
    }
    await assertProjectAccess(userId, item.task.column.board.projectId);

    const updated = await taskRepository.updateChecklistItem(itemId, input);
    return {
      id: updated.id,
      title: updated.title,
      done: updated.done,
      position: updated.position,
    };
  },

  async deleteChecklistItem(userId: string, itemId: string) {
    const item = await taskRepository.findChecklistItem(itemId);
    if (!item) {
      throw new AppError(404, "Checklist item not found", "NOT_FOUND");
    }
    await assertProjectAccess(userId, item.task.column.board.projectId);
    await taskRepository.deleteChecklistItem(itemId);
  },
};
