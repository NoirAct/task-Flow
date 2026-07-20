import crypto from "node:crypto";
import type { TeamRole } from "@prisma/client";
import { prisma } from "../config/database.js";
import { AppError } from "../utils/errors.js";
import { logActivity } from "./activity.service.js";
import { notifyUser } from "../realtime.js";
import { env } from "../config/env.js";

function mapMember(member: {
  id: string;
  role: TeamRole;
  createdAt: Date;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
}) {
  return {
    id: member.id,
    role: member.role,
    createdAt: member.createdAt,
    user: member.user,
  };
}

function mapTeam(team: {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  members?: {
    id: string;
    role: TeamRole;
    createdAt: Date;
    user: { id: string; name: string; email: string; avatarUrl: string | null };
  }[];
  _count?: { members: number; projects: number };
}) {
  return {
    id: team.id,
    name: team.name,
    description: team.description,
    ownerId: team.ownerId,
    createdAt: team.createdAt,
    updatedAt: team.updatedAt,
    memberCount: team._count?.members ?? team.members?.length ?? 0,
    projectCount: team._count?.projects ?? 0,
    members: team.members?.map(mapMember),
  };
}

async function assertTeamAdmin(userId: string, teamId: string) {
  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: { members: { where: { userId } } },
  });
  if (!team) throw new AppError(404, "Team not found", "NOT_FOUND");

  const isOwner = team.ownerId === userId;
  const member = team.members[0];
  const isAdmin =
    isOwner || member?.role === "ADMIN" || member?.role === "MANAGER";

  if (!isAdmin && !isOwner) {
    const isMember = Boolean(member);
    if (!isMember) throw new AppError(404, "Team not found", "NOT_FOUND");
    throw new AppError(403, "Insufficient permissions", "FORBIDDEN");
  }

  return team;
}

export const teamService = {
  async list(userId: string) {
    const teams = await prisma.team.findMany({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        _count: { select: { members: true, projects: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    return teams.map(mapTeam);
  },

  async getById(userId: string, teamId: string) {
    const team = await prisma.team.findFirst({
      where: {
        id: teamId,
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        invites: {
          where: { status: "PENDING" },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { members: true, projects: true } },
      },
    });
    if (!team) throw new AppError(404, "Team not found", "NOT_FOUND");

    return {
      ...mapTeam(team),
      invites: team.invites.map((invite) => ({
        id: invite.id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        expiresAt: invite.expiresAt,
        createdAt: invite.createdAt,
      })),
    };
  },

  async create(userId: string, input: { name: string; description?: string | null }) {
    const team = await prisma.team.create({
      data: {
        name: input.name,
        description: input.description ?? null,
        ownerId: userId,
        members: {
          create: { userId, role: "ADMIN" },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          },
        },
        _count: { select: { members: true, projects: true } },
      },
    });

    await logActivity({
      userId,
      action: "team.created",
      entityType: "team",
      entityId: team.id,
    });

    return mapTeam(team);
  },

  async invite(
    userId: string,
    teamId: string,
    input: { email: string; role?: TeamRole },
  ) {
    await assertTeamAdmin(userId, teamId);
    const email = input.email.trim().toLowerCase();
    const role = input.role ?? "DEVELOPER";

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const already = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId, userId: existingUser.id } },
      });
      if (already) throw new AppError(409, "User already in team", "ALREADY_MEMBER");
    }

    const token = crypto.randomBytes(24).toString("hex");
    const invite = await prisma.teamInvite.create({
      data: {
        teamId,
        email,
        role,
        token,
        invitedById: userId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const inviteUrl = `${env.CLIENT_URL}/app/team/invites/${token}`;
    if (env.NODE_ENV === "development") {
      console.log("\n========== TEAM INVITE ==========");
      console.log(`Email: ${email}`);
      console.log(`Invite URL: ${inviteUrl}`);
      console.log("=================================\n");
    }

    if (existingUser) {
      await notifyUser({
        userId: existingUser.id,
        type: "invite",
        title: "Team invitation",
        body: `You were invited to join a team as ${role}`,
        link: `/app/team/invites/${token}`,
      });
    }

    return {
      id: invite.id,
      email: invite.email,
      role: invite.role,
      status: invite.status,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
      ...(env.NODE_ENV === "development" ? { inviteUrl } : {}),
    };
  },

  async acceptInvite(userId: string, token: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "User not found", "NOT_FOUND");

    const invite = await prisma.teamInvite.findUnique({
      where: { token },
      include: { team: true },
    });
    if (!invite || invite.status !== "PENDING") {
      throw new AppError(400, "Invalid invite", "INVALID_INVITE");
    }
    if (invite.expiresAt < new Date()) {
      await prisma.teamInvite.update({
        where: { id: invite.id },
        data: { status: "EXPIRED" },
      });
      throw new AppError(400, "Invite expired", "INVITE_EXPIRED");
    }
    if (invite.email !== user.email.toLowerCase()) {
      throw new AppError(403, "Invite email mismatch", "FORBIDDEN");
    }

    await prisma.$transaction([
      prisma.teamMember.upsert({
        where: { teamId_userId: { teamId: invite.teamId, userId } },
        create: { teamId: invite.teamId, userId, role: invite.role },
        update: { role: invite.role },
      }),
      prisma.teamInvite.update({
        where: { id: invite.id },
        data: { status: "ACCEPTED" },
      }),
    ]);

    await notifyUser({
      userId: invite.invitedById,
      type: "invite_accepted",
      title: "Invite accepted",
      body: `${user.name} joined ${invite.team.name}`,
      link: `/app/team`,
    });

    return { teamId: invite.teamId, teamName: invite.team.name };
  },

  async updateMemberRole(
    userId: string,
    teamId: string,
    memberId: string,
    role: TeamRole,
  ) {
    await assertTeamAdmin(userId, teamId);
    const member = await prisma.teamMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
      },
    });
    return mapMember(member);
  },

  async removeMember(userId: string, teamId: string, memberId: string) {
    const team = await assertTeamAdmin(userId, teamId);
    const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
    if (!member || member.teamId !== teamId) {
      throw new AppError(404, "Member not found", "NOT_FOUND");
    }
    if (member.userId === team.ownerId) {
      throw new AppError(400, "Cannot remove team owner", "FORBIDDEN");
    }
    await prisma.teamMember.delete({ where: { id: memberId } });
  },
};
