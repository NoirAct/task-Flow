import type { Prisma, TaskPriority } from "@prisma/client";
import { prisma } from "../config/database.js";

const taskDetailInclude = {
  labels: { include: { label: true } },
  checklist: { orderBy: { position: "asc" as const } },
  assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
  createdBy: { select: { id: true, name: true, email: true, avatarUrl: true } },
  comments: {
    orderBy: { createdAt: "asc" as const },
    include: {
      author: { select: { id: true, name: true, email: true, avatarUrl: true } },
      attachments: {
        orderBy: { createdAt: "asc" as const },
        include: { uploadedBy: { select: { id: true, name: true } } },
      },
    },
  },
  attachments: {
    where: { commentId: null },
    orderBy: { createdAt: "asc" as const },
    include: { uploadedBy: { select: { id: true, name: true } } },
  },
  column: {
    include: {
      board: {
        select: { id: true, projectId: true },
      },
    },
  },
} satisfies Prisma.TaskInclude;

export const taskRepository = {
  findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: taskDetailInclude,
    });
  },

  findColumnById(columnId: string) {
    return prisma.column.findUnique({
      where: { id: columnId },
      include: {
        board: { select: { id: true, projectId: true } },
        tasks: { orderBy: { position: "asc" }, select: { id: true, position: true } },
      },
    });
  },

  create(data: {
    columnId: string;
    title: string;
    description?: string | null;
    position: number;
    createdById?: string;
    priority?: TaskPriority;
    dueDate?: Date | null;
    estimatedMinutes?: number | null;
    assigneeId?: string | null;
    labelIds?: string[];
  }) {
    const { labelIds, ...rest } = data;
    return prisma.task.create({
      data: {
        ...rest,
        labels: labelIds?.length
          ? { create: labelIds.map((labelId) => ({ labelId })) }
          : undefined,
      },
      include: taskDetailInclude,
    });
  },

  async update(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      columnId?: string;
      position?: number;
      priority?: TaskPriority;
      dueDate?: Date | null;
      estimatedMinutes?: number | null;
      spentMinutes?: number;
      assigneeId?: string | null;
      labelIds?: string[];
    },
  ) {
    const { labelIds, ...rest } = data;

    if (labelIds) {
      await prisma.$transaction([
        prisma.taskLabel.deleteMany({ where: { taskId: id } }),
        prisma.task.update({
          where: { id },
          data: {
            ...rest,
            labels: {
              create: labelIds.map((labelId) => ({ labelId })),
            },
          },
        }),
      ]);
      return prisma.task.findUniqueOrThrow({
        where: { id },
        include: taskDetailInclude,
      });
    }

    return prisma.task.update({
      where: { id },
      data: rest,
      include: taskDetailInclude,
    });
  },

  delete(id: string) {
    return prisma.task.delete({ where: { id } });
  },

  async reorderColumn(columnId: string, orderedTaskIds: string[]) {
    await prisma.$transaction(
      orderedTaskIds.map((taskId, index) =>
        prisma.task.update({
          where: { id: taskId },
          data: { columnId, position: index },
        }),
      ),
    );
  },

  createChecklistItem(data: { taskId: string; title: string; position: number }) {
    return prisma.checklistItem.create({ data });
  },

  findChecklistItem(id: string) {
    return prisma.checklistItem.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            column: { include: { board: { select: { projectId: true } } } },
          },
        },
      },
    });
  },

  updateChecklistItem(id: string, data: { title?: string; done?: boolean }) {
    return prisma.checklistItem.update({ where: { id }, data });
  },

  deleteChecklistItem(id: string) {
    return prisma.checklistItem.delete({ where: { id } });
  },

  countChecklist(taskId: string) {
    return prisma.checklistItem.count({ where: { taskId } });
  },

  listLabels(projectId: string) {
    return prisma.label.findMany({
      where: { projectId },
      orderBy: { name: "asc" },
    });
  },

  createLabel(data: { projectId: string; name: string; color: string }) {
    return prisma.label.create({ data });
  },

  findLabelsByIds(projectId: string, ids: string[]) {
    return prisma.label.findMany({
      where: { projectId, id: { in: ids } },
    });
  },
};
