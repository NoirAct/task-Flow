import { prisma } from "../config/database.js";

const commentInclude = {
  author: { select: { id: true, name: true, email: true, avatarUrl: true } },
  attachments: {
    orderBy: { createdAt: "asc" as const },
    include: {
      uploadedBy: { select: { id: true, name: true } },
    },
  },
};

export const commentRepository = {
  listByTask(taskId: string) {
    return prisma.comment.findMany({
      where: { taskId },
      include: commentInclude,
      orderBy: { createdAt: "asc" },
    });
  },

  findById(id: string) {
    return prisma.comment.findUnique({
      where: { id },
      include: {
        ...commentInclude,
        task: {
          include: {
            column: { include: { board: { select: { projectId: true } } } },
          },
        },
      },
    });
  },

  create(data: { taskId: string; authorId: string; body: string }) {
    return prisma.comment.create({
      data,
      include: commentInclude,
    });
  },

  update(id: string, body: string) {
    return prisma.comment.update({
      where: { id },
      data: { body },
      include: commentInclude,
    });
  },

  delete(id: string) {
    return prisma.comment.delete({ where: { id } });
  },
};

export const attachmentRepository = {
  create(data: {
    taskId?: string | null;
    commentId?: string | null;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    storagePath: string;
    uploadedById: string;
  }) {
    return prisma.attachment.create({
      data,
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });
  },

  findById(id: string) {
    return prisma.attachment.findUnique({
      where: { id },
      include: {
        task: {
          include: {
            column: { include: { board: { select: { projectId: true } } } },
          },
        },
        comment: {
          include: {
            task: {
              include: {
                column: { include: { board: { select: { projectId: true } } } },
              },
            },
          },
        },
      },
    });
  },

  listByTask(taskId: string) {
    return prisma.attachment.findMany({
      where: { taskId, commentId: null },
      orderBy: { createdAt: "asc" },
      include: {
        uploadedBy: { select: { id: true, name: true } },
      },
    });
  },

  delete(id: string) {
    return prisma.attachment.delete({ where: { id } });
  },
};
