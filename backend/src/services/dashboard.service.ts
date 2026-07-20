import { prisma } from "../config/database.js";
import { listAccessibleProjectIds } from "./access.service.js";

export const dashboardService = {
  async getSummary(userId: string) {
    const projectIds = await listAccessibleProjectIds(userId);

    const [projectsCount, tasks, activity, teamCount, notificationsUnread] =
      await Promise.all([
        Promise.resolve(projectIds.length),
        prisma.task.findMany({
          where: {
            column: { board: { projectId: { in: projectIds } } },
          },
          select: {
            id: true,
            spentMinutes: true,
            estimatedMinutes: true,
            dueDate: true,
            column: { select: { key: true } },
            assigneeId: true,
          },
        }),
        prisma.activityLog.findMany({
          where: {
            OR: [{ userId }, { projectId: { in: projectIds } }],
          },
          orderBy: { createdAt: "desc" },
          take: 12,
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } },
            project: { select: { id: true, name: true, key: true } },
          },
        }),
        prisma.team.count({
          where: {
            OR: [{ ownerId: userId }, { members: { some: { userId } } }],
          },
        }),
        prisma.notification.count({
          where: { userId, readAt: null },
        }),
      ]);

    const pending = tasks.filter((task) =>
      ["backlog", "todo"].includes(task.column.key),
    ).length;
    const inProgress = tasks.filter((task) =>
      ["in_progress", "review"].includes(task.column.key),
    ).length;
    const done = tasks.filter((task) => task.column.key === "done").length;
    const hoursWorked = Math.round(
      tasks.reduce((sum, task) => sum + task.spentMinutes, 0) / 60,
    );
    const estimatedHours = Math.round(
      tasks.reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0) / 60,
    );
    const productivity =
      tasks.length === 0 ? 0 : Math.round((done / tasks.length) * 100);

    const myAssigned = tasks.filter((task) => task.assigneeId === userId).length;
    const overdue = tasks.filter(
      (task) =>
        task.dueDate &&
        task.dueDate < new Date() &&
        task.column.key !== "done",
    ).length;

    return {
      projectsCount,
      teamCount,
      notificationsUnread,
      tasks: {
        total: tasks.length,
        pending,
        inProgress,
        done,
        myAssigned,
        overdue,
      },
      hoursWorked,
      estimatedHours,
      productivity,
      activity: activity.map((item) => ({
        id: item.id,
        action: item.action,
        entityType: item.entityType,
        entityId: item.entityId,
        createdAt: item.createdAt,
        user: item.user,
        project: item.project,
      })),
    };
  },
};
