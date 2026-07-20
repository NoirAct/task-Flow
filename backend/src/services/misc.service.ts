import { prisma } from "../config/database.js";
import { listAccessibleProjectIds } from "./access.service.js";
import { AppError } from "../utils/errors.js";

export const calendarService = {
  async listEvents(
    userId: string,
    query: { from?: string; to?: string },
  ) {
    const projectIds = await listAccessibleProjectIds(userId);
    const from = query.from ? new Date(query.from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const to = query.to
      ? new Date(query.to)
      : new Date(new Date().getFullYear(), new Date().getMonth() + 2, 0);

    const tasks = await prisma.task.findMany({
      where: {
        dueDate: { gte: from, lte: to },
        column: { board: { projectId: { in: projectIds } } },
      },
      include: {
        column: {
          include: {
            board: {
              include: {
                project: { select: { id: true, name: true, key: true, color: true } },
              },
            },
          },
        },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { dueDate: "asc" },
    });

    return tasks.map((task) => ({
      id: task.id,
      title: task.title,
      dueDate: task.dueDate,
      priority: task.priority,
      columnKey: task.column.key,
      project: task.column.board.project,
      assignee: task.assignee,
    }));
  },
};

export const notificationService = {
  async list(userId: string) {
    const items = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return items;
  },

  async markRead(userId: string, id: string) {
    const item = await prisma.notification.findFirst({ where: { id, userId } });
    if (!item) throw new AppError(404, "Notification not found", "NOT_FOUND");
    return prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  },

  async markAllRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    });
  },
};

export const profileService = {
  async update(
    userId: string,
    input: {
      name?: string;
      bio?: string | null;
      skills?: string[];
      avatarUrl?: string | null;
      preferredLocale?: string;
      preferredTheme?: string;
    },
  ) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        bio: input.bio,
        skills: input.skills,
        avatarUrl: input.avatarUrl,
        preferredLocale: input.preferredLocale,
        preferredTheme: input.preferredTheme,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        bio: true,
        skills: true,
        preferredLocale: true,
        preferredTheme: true,
        createdAt: true,
      },
    });
    return user;
  },

  async getProjects(userId: string) {
    return prisma.project.findMany({
      where: {
        OR: [{ ownerId: userId }, { team: { members: { some: { userId } } } }],
        archivedAt: null,
      },
      select: {
        id: true,
        name: true,
        key: true,
        color: true,
        description: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 20,
    });
  },
};

export const searchService = {
  async global(userId: string, q: string) {
    const query = q.trim();
    if (!query) return { projects: [], tasks: [], teams: [] };

    const projectIds = await listAccessibleProjectIds(userId);

    const [projects, tasks, teams] = await Promise.all([
      prisma.project.findMany({
        where: {
          id: { in: projectIds },
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { key: { contains: query, mode: "insensitive" } },
          ],
        },
        take: 8,
        select: { id: true, name: true, key: true, color: true },
      }),
      prisma.task.findMany({
        where: {
          title: { contains: query, mode: "insensitive" },
          column: { board: { projectId: { in: projectIds } } },
        },
        take: 8,
        select: {
          id: true,
          title: true,
          column: {
            select: {
              board: { select: { projectId: true, project: { select: { name: true, key: true } } } },
            },
          },
        },
      }),
      prisma.team.findMany({
        where: {
          OR: [{ ownerId: userId }, { members: { some: { userId } } }],
          name: { contains: query, mode: "insensitive" },
        },
        take: 5,
        select: { id: true, name: true },
      }),
    ]);

    return {
      projects,
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        projectId: task.column.board.projectId,
        projectName: task.column.board.project.name,
        projectKey: task.column.board.project.key,
      })),
      teams,
    };
  },
};
