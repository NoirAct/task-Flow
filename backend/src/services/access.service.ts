import type { TeamRole } from "@prisma/client";
import { prisma } from "../config/database.js";

export async function userCanAccessProject(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { ownerId: userId },
        { team: { members: { some: { userId } } } },
      ],
    },
    include: {
      team: {
        include: {
          members: { where: { userId }, select: { role: true } },
        },
      },
    },
  });

  if (!project) return null;

  const role: TeamRole | "OWNER" =
    project.ownerId === userId
      ? "OWNER"
      : (project.team?.members[0]?.role ?? "VIEWER");

  return { project, role };
}

export async function listAccessibleProjectIds(userId: string) {
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { ownerId: userId },
        { team: { members: { some: { userId } } } },
      ],
    },
    select: { id: true },
  });
  return projects.map((project) => project.id);
}
