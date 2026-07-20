import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { authService } from "../services/auth.service.js";

function setRefreshCookie(res: Response, token: string, expiresAt: Date) {
  res.cookie(authService.refreshCookieName, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/auth",
    expires: expiresAt,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(authService.refreshCookieName, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/auth",
  });
}

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body);
    setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    return res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);
    setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    return res.json({
      user: result.user,
      accessToken: result.accessToken,
    });
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.[authService.refreshCookieName] as string | undefined;
    const result = await authService.refresh(token);
    setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    return res.json({
      user: result.user,
      accessToken: result.accessToken,
    });
  },

  async logout(req: Request, res: Response) {
    const token = req.cookies?.[authService.refreshCookieName] as string | undefined;
    await authService.logout(token);
    clearRefreshCookie(res);
    return res.status(204).send();
  },

  async me(req: Request, res: Response) {
    const user = await authService.me(req.user!.sub);
    return res.json({ user });
  },

  async forgotPassword(req: Request, res: Response) {
    const result = await authService.forgotPassword(req.body);
    return res.json(result);
  },

  async resetPassword(req: Request, res: Response) {
    const result = await authService.resetPassword(req.body);
    return res.json(result);
  },
};
