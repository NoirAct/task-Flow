import { prisma } from "../config/database.js";
import { DEFAULT_COLUMNS } from "../config/board-defaults.js";

const boardTaskInclude = {
  orderBy: { position: "asc" as const },
  include: {
    labels: { include: { label: true } },
    checklist: { select: { id: true, done: true } },
    subtasks: { select: { id: true, done: true } },
    favorites: { select: { userId: true } },
    assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
  },
};

export const boardRepository = {
  findByProjectId(projectId: string) {
    return prisma.board.findUnique({
      where: { projectId },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: {
            tasks: boardTaskInclude,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            color: true,
            ownerId: true,
            owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
      },
    });
  },

  findColumn(columnId: string) {
    return prisma.column.findUnique({
      where: { id: columnId },
      include: {
        board: { select: { id: true, projectId: true } },
        _count: { select: { tasks: true } },
      },
    });
  },

  findBoardById(boardId: string) {
    return prisma.board.findUnique({
      where: { id: boardId },
      include: { columns: { orderBy: { position: "asc" } } },
    });
  },

  createColumn(data: { boardId: string; key: string; name: string; position: number }) {
    return prisma.column.create({ data });
  },

  updateColumn(columnId: string, data: { name?: string }) {
    return prisma.column.update({ where: { id: columnId }, data });
  },

  deleteColumn(columnId: string) {
    return prisma.column.delete({ where: { id: columnId } });
  },

  async reorderColumns(boardId: string, orderedColumnIds: string[]) {
    await prisma.$transaction(
      orderedColumnIds.map((columnId, index) =>
        prisma.column.update({
          where: { id: columnId, boardId },
          data: { position: index },
        }),
      ),
    );
  },

  createForProject(projectId: string) {
    return prisma.board.create({
      data: {
        projectId,
        name: "Main",
        columns: {
          create: DEFAULT_COLUMNS.map((column) => ({
            key: column.key,
            name: column.name,
            position: column.position,
          })),
        },
      },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: {
            tasks: boardTaskInclude,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            color: true,
            ownerId: true,
            owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
      },
    });
  },
};
