import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { refreshTokenRepository } from "../repositories/refresh-token.repository.js";
import { userRepository } from "../repositories/user.repository.js";
import { AppError } from "../utils/errors.js";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
} from "../validators/auth.validator.js";

const REFRESH_COOKIE = "refreshToken";

function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

function signAccessToken(user: { id: string; email: string }) {
  return jwt.sign(
    { sub: user.id, email: user.email },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as jwt.SignOptions,
  );
}

function parseDurationMs(value: string): number {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const amount = Number(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60_000,
    h: 3_600_000,
    d: 86_400_000,
  };
  return amount * (multipliers[unit] ?? 86_400_000);
}

async function issueRefreshToken(userId: string) {
  const token = crypto.randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + parseDurationMs(env.JWT_REFRESH_EXPIRES_IN));
  await refreshTokenRepository.create({ token, userId, expiresAt });
  return { token, expiresAt };
}

function publicUser(user: {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio?: string | null;
  preferredLocale: string;
  preferredTheme: string;
  createdAt: Date;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio ?? null,
    preferredLocale: user.preferredLocale,
    preferredTheme: user.preferredTheme,
    createdAt: user.createdAt,
  };
}

export const authService = {
  refreshCookieName: REFRESH_COOKIE,

  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError(409, "Email already registered", "EMAIL_TAKEN");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });

    const accessToken = signAccessToken(user);
    const refresh = await issueRefreshToken(user.id);

    return {
      user: publicUser(user),
      accessToken,
      refreshToken: refresh.token,
      refreshExpiresAt: refresh.expiresAt,
    };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    const valid = await comparePassword(input.password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, "Invalid email or password", "INVALID_CREDENTIALS");
    }

    const accessToken = signAccessToken(user);
    const refresh = await issueRefreshToken(user.id);

    return {
      user: publicUser(user),
      accessToken,
      refreshToken: refresh.token,
      refreshExpiresAt: refresh.expiresAt,
    };
  },

  async refresh(refreshToken?: string) {
    if (!refreshToken) {
      throw new AppError(401, "Refresh token required", "UNAUTHORIZED");
    }

    const stored = await refreshTokenRepository.findValid(refreshToken);
    if (!stored) {
      throw new AppError(401, "Invalid or expired refresh token", "UNAUTHORIZED");
    }

    await refreshTokenRepository.revoke(refreshToken);

    const accessToken = signAccessToken(stored.user);
    const refresh = await issueRefreshToken(stored.user.id);

    return {
      user: publicUser(stored.user),
      accessToken,
      refreshToken: refresh.token,
      refreshExpiresAt: refresh.expiresAt,
    };
  },

  async logout(refreshToken?: string) {
    if (refreshToken) {
      await refreshTokenRepository.revoke(refreshToken);
    }
  },

  async me(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError(404, "User not found", "NOT_FOUND");
    }
    return publicUser(user);
  },

  async forgotPassword(input: ForgotPasswordInput) {
    const user = await userRepository.findByEmail(input.email);

    // Always return success to avoid email enumeration
    if (!user) {
      return { message: "If the email exists, a reset link was sent" };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000);
    await userRepository.setPasswordResetToken(user.id, token, expires);

    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${token}`;

    if (env.NODE_ENV === "development") {
      console.log("\n========== PASSWORD RESET ==========");
      console.log(`User: ${user.email}`);
      console.log(`Reset URL: ${resetUrl}`);
      console.log("====================================\n");
    }

    return {
      message: "If the email exists, a reset link was sent",
      ...(env.NODE_ENV === "development" ? { resetUrl } : {}),
    };
  },

  async resetPassword(input: ResetPasswordInput) {
    const user = await userRepository.findByPasswordResetToken(input.token);
    if (!user) {
      throw new AppError(400, "Invalid or expired reset token", "INVALID_RESET_TOKEN");
    }

    const passwordHash = await hashPassword(input.password);
    await userRepository.updatePassword(user.id, passwordHash);
    await refreshTokenRepository.revokeAllForUser(user.id);

    return { message: "Password updated successfully" };
  },
};
