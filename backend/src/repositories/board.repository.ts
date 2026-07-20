import { prisma } from "../config/database.js";
import { DEFAULT_COLUMNS } from "../config/board-defaults.js";

export const boardRepository = {
  findByProjectId(projectId: string) {
    return prisma.board.findUnique({
      where: { projectId },
      include: {
        columns: {
          orderBy: { position: "asc" },
          include: {
            tasks: {
              orderBy: { position: "asc" },
            },
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            color: true,
            ownerId: true,
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
            tasks: {
              orderBy: { position: "asc" },
            },
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            key: true,
            color: true,
            ownerId: true,
          },
        },
      },
    });
  },
};
