import type { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";

export const projectRepository = {
  findManyForUser(
    userId: string,
    options: {
      search?: string;
      archived: "true" | "false" | "all";
      favoritesOnly?: boolean;
    },
  ) {
    const where: Prisma.ProjectWhereInput = {
      OR: [
        { ownerId: userId },
        { team: { members: { some: { userId } } } },
      ],
    };

    if (options.archived === "true") {
      where.archivedAt = { not: null };
    } else if (options.archived === "false") {
      where.archivedAt = null;
    }

    if (options.search) {
      where.AND = [
        {
          OR: [
            { name: { contains: options.search, mode: "insensitive" } },
            { key: { contains: options.search, mode: "insensitive" } },
            { description: { contains: options.search, mode: "insensitive" } },
          ],
        },
      ];
    }

    if (options.favoritesOnly) {
      where.favorites = { some: { userId } };
    }

    return prisma.project.findMany({
      where,
      include: {
        favorites: {
          where: { userId },
          select: { userId: true },
        },
        _count: { select: { favorites: true } },
      },
      orderBy: [{ archivedAt: "asc" }, { updatedAt: "desc" }],
    });
  },

  findByIdForUser(id: string, userId: string) {
    return prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: userId },
          { team: { members: { some: { userId } } } },
        ],
      },
      include: {
        favorites: {
          where: { userId },
          select: { userId: true },
        },
      },
    });
  },

  findByKeyForOwner(ownerId: string, key: string) {
    return prisma.project.findUnique({
      where: { ownerId_key: { ownerId, key } },
    });
  },

  create(data: {
    name: string;
    description?: string | null;
    key: string;
    color: string;
    ownerId: string;
  }) {
    return prisma.project.create({
      data: {
        ...data,
        board: {
          create: {
            name: "Main",
            columns: {
              create: [
                { key: "backlog", name: "Backlog", position: 0 },
                { key: "todo", name: "To Do", position: 1 },
                { key: "in_progress", name: "In Progress", position: 2 },
                { key: "review", name: "Review", position: 3 },
                { key: "done", name: "Done", position: 4 },
              ],
            },
          },
        },
      },
      include: {
        favorites: {
          where: { userId: data.ownerId },
          select: { userId: true },
        },
      },
    });
  },

  update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      color?: string;
      archivedAt?: Date | null;
    },
  ) {
    return prisma.project.update({
      where: { id },
      data,
      include: {
        favorites: { select: { userId: true } },
      },
    });
  },

  delete(id: string) {
    return prisma.project.delete({ where: { id } });
  },

  addFavorite(userId: string, projectId: string) {
    return prisma.projectFavorite.upsert({
      where: { userId_projectId: { userId, projectId } },
      create: { userId, projectId },
      update: {},
    });
  },

  removeFavorite(userId: string, projectId: string) {
    return prisma.projectFavorite.deleteMany({
      where: { userId, projectId },
    });
  },
};
