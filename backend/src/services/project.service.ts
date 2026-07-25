import type { ProjectStatus } from "@prisma/client";
import { prisma } from "../config/database.js";
import { AppError } from "../utils/errors.js";
import { projectRepository } from "../repositories/project.repository.js";
import type {
  CreateProjectInput,
  ListProjectsQuery,
  UpdateProjectInput,
} from "../validators/project.validator.js";

function parseDate(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  return value ? new Date(value) : null;
}

async function assertTeamAccess(userId: string, teamId: string | null | undefined) {
  if (!teamId) return;
  const team = await prisma.team.findFirst({
    where: {
      id: teamId,
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    select: { id: true },
  });
  if (!team) {
    throw new AppError(404, "Team not found", "TEAM_NOT_FOUND");
  }
}

function slugKeyFromName(name: string) {
  const letters = name.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (letters.length >= 2) return letters.slice(0, 3);
  return "PRJ";
}

function mapProject(
  project: {
    id: string;
    name: string;
    description: string | null;
    key: string;
    color: string;
    icon: string | null;
    status: ProjectStatus;
    startDate: Date | null;
    endDate: Date | null;
    teamId: string | null;
    ownerId: string;
    archivedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    favorites?: { userId: string }[];
  },
  userId: string,
) {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    key: project.key,
    color: project.color,
    icon: project.icon,
    status: project.status,
    startDate: project.startDate,
    endDate: project.endDate,
    teamId: project.teamId,
    ownerId: project.ownerId,
    archivedAt: project.archivedAt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    isFavorite: Boolean(project.favorites?.some((f) => f.userId === userId)),
    isArchived: Boolean(project.archivedAt),
  };
}

async function ensureUniqueKey(ownerId: string, baseKey: string) {
  let key = baseKey.slice(0, 6).toUpperCase();
  let attempt = 0;

  while (await projectRepository.findByKeyForOwner(ownerId, key)) {
    attempt += 1;
    const suffix = String(attempt);
    key = `${baseKey.slice(0, Math.max(1, 6 - suffix.length))}${suffix}`;
    if (attempt > 99) {
      throw new AppError(409, "Could not generate unique project key", "KEY_CONFLICT");
    }
  }

  return key;
}

export const projectService = {
  async list(userId: string, query: ListProjectsQuery) {
    const result = await projectRepository.findManyForUser(userId, {
      search: query.search,
      archived: query.archived,
      favoritesOnly: query.favorites === "true",
      status: query.status,
      page: query.page,
      perPage: query.perPage,
    });

    return {
      projects: result.projects.map((project) => mapProject(project, userId)),
      total: result.total,
      page: result.page,
      perPage: result.perPage,
    };
  },

  async getById(userId: string, id: string) {
    const project = await projectRepository.findByIdForUser(id, userId);
    if (!project) {
      throw new AppError(404, "Project not found", "NOT_FOUND");
    }
    return mapProject(project, userId);
  },

  async create(userId: string, input: CreateProjectInput) {
    const baseKey = input.key ?? slugKeyFromName(input.name);
    const key = await ensureUniqueKey(userId, baseKey);
    await assertTeamAccess(userId, input.teamId);

    const project = await projectRepository.create({
      name: input.name,
      description: input.description ?? null,
      key,
      color: input.color ?? "#1f6feb",
      ownerId: userId,
      icon: input.icon ?? null,
      status: input.status,
      startDate: parseDate(input.startDate) ?? null,
      endDate: parseDate(input.endDate) ?? null,
      teamId: input.teamId ?? null,
    });

    return mapProject(project, userId);
  },

  async update(userId: string, id: string, input: UpdateProjectInput) {
    const existing = await projectRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new AppError(404, "Project not found", "NOT_FOUND");
    }
    await assertTeamAccess(userId, input.teamId);

    const project = await projectRepository.update(id, {
      name: input.name,
      description: input.description,
      color: input.color,
      icon: input.icon,
      status: input.status,
      startDate: parseDate(input.startDate),
      endDate: parseDate(input.endDate),
      teamId: input.teamId,
    });

    // Re-fetch favorites for current user after update include may be all favorites
    const refreshed = await projectRepository.findByIdForUser(project.id, userId);
    return mapProject(refreshed!, userId);
  },

  async archive(userId: string, id: string) {
    const existing = await projectRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new AppError(404, "Project not found", "NOT_FOUND");
    }
    if (existing.archivedAt) {
      throw new AppError(400, "Project already archived", "ALREADY_ARCHIVED");
    }

    await projectRepository.update(id, { archivedAt: new Date() });
    const refreshed = await projectRepository.findByIdForUser(id, userId);
    return mapProject(refreshed!, userId);
  },

  async restore(userId: string, id: string) {
    const existing = await projectRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new AppError(404, "Project not found", "NOT_FOUND");
    }
    if (!existing.archivedAt) {
      throw new AppError(400, "Project is not archived", "NOT_ARCHIVED");
    }

    await projectRepository.update(id, { archivedAt: null });
    const refreshed = await projectRepository.findByIdForUser(id, userId);
    return mapProject(refreshed!, userId);
  },

  async remove(userId: string, id: string) {
    const existing = await projectRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new AppError(404, "Project not found", "NOT_FOUND");
    }
    await projectRepository.delete(id);
  },

  async favorite(userId: string, id: string) {
    const existing = await projectRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new AppError(404, "Project not found", "NOT_FOUND");
    }
    await projectRepository.addFavorite(userId, id);
    const refreshed = await projectRepository.findByIdForUser(id, userId);
    return mapProject(refreshed!, userId);
  },

  async unfavorite(userId: string, id: string) {
    const existing = await projectRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new AppError(404, "Project not found", "NOT_FOUND");
    }
    await projectRepository.removeFavorite(userId, id);
    const refreshed = await projectRepository.findByIdForUser(id, userId);
    return mapProject(refreshed!, userId);
  },

  async duplicate(userId: string, id: string) {
    const existing = await projectRepository.findByIdForUser(id, userId);
    if (!existing) {
      throw new AppError(404, "Project not found", "NOT_FOUND");
    }

    const copyName = `${existing.name} (copy)`;
    const key = await ensureUniqueKey(userId, existing.key);

    const project = await projectRepository.create({
      name: copyName.slice(0, 80),
      description: existing.description,
      key,
      color: existing.color,
      ownerId: userId,
      icon: existing.icon,
      startDate: existing.startDate,
      endDate: existing.endDate,
      teamId: existing.teamId,
    });

    return mapProject(project, userId);
  },
};
