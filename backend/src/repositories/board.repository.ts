import { prisma } from "../config/database.js";
import { DEFAULT_COLUMNS } from "../config/board-defaults.js";

const boardTaskInclude = {
  orderBy: { position: "asc" as const },
  include: {
    labels: { include: { label: true } },
    checklist: { select: { id: true, done: true } },
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
