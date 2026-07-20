import { prisma } from "../config/database.js";

export const taskRepository = {
  findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        column: {
          include: {
            board: {
              select: { id: true, projectId: true },
            },
          },
        },
      },
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
  }) {
    return prisma.task.create({ data });
  },

  update(
    id: string,
    data: {
      title?: string;
      description?: string | null;
      columnId?: string;
      position?: number;
    },
  ) {
    return prisma.task.update({ where: { id }, data });
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

  countInColumn(columnId: string) {
    return prisma.task.count({ where: { columnId } });
  },
};
