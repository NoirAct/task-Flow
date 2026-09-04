import { prisma } from "../config/database.js";
import crypto from "node:crypto";

export function hashRefreshToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export const refreshTokenRepository = {
  create(data: {
    token: string;
    userId: string;
    expiresAt: Date;
    userAgent?: string | null;
    ip?: string | null;
  }) {
    return prisma.refreshToken.create({
      data: { ...data, token: hashRefreshToken(data.token) },
    });
  },

  listActiveForUser(userId: string) {
    return prisma.refreshToken.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        token: true,
        userAgent: true,
        ip: true,
        createdAt: true,
        expiresAt: true,
      },
    });
  },

  revokeById(userId: string, id: string) {
    return prisma.refreshToken.updateMany({
      where: { id, userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  findValid(token: string) {
    return prisma.refreshToken.findFirst({
      where: {
        token: hashRefreshToken(token),
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });
  },

  revoke(token: string) {
    return prisma.refreshToken.updateMany({
      where: { token: hashRefreshToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },

  revokeAllForUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  },
};
