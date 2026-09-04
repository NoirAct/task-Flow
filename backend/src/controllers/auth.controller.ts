import type { Request, Response } from "express";
import { env } from "../config/env.js";
import { authService } from "../services/auth.service.js";

function sessionMeta(req: Request) {
  return {
    userAgent: req.headers["user-agent"] ?? null,
    ip: req.ip ?? null,
  };
}

function setRefreshCookie(res: Response, token: string, expiresAt?: Date) {
  res.cookie(authService.refreshCookieName, token, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: env.COOKIE_PATH,
    // Without `expires` the cookie lives only for the browser session (remember me off)
    ...(expiresAt ? { expires: expiresAt } : {}),
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(authService.refreshCookieName, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: env.COOKIE_PATH,
  });
}

export const authController = {
  async register(req: Request, res: Response) {
    const result = await authService.register(req.body, sessionMeta(req));
    setRefreshCookie(res, result.refreshToken, result.refreshExpiresAt);
    return res.status(201).json({
      user: result.user,
      accessToken: result.accessToken,
    });
  },

  async login(req: Request, res: Response) {
    const result = await authService.login(req.body, sessionMeta(req));
    setRefreshCookie(
      res,
      result.refreshToken,
      result.rememberMe ? result.refreshExpiresAt : undefined,
    );
    return res.json({
      user: result.user,
      accessToken: result.accessToken,
    });
  },

  async refresh(req: Request, res: Response) {
    const token = req.cookies?.[authService.refreshCookieName] as string | undefined;
    const result = await authService.refresh(token, sessionMeta(req));
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

  async listSessions(req: Request, res: Response) {
    const currentToken = req.cookies?.[authService.refreshCookieName] as string | undefined;
    const sessions = await authService.listSessions(req.user!.sub, currentToken);
    return res.json({ sessions });
  },

  async revokeSession(req: Request, res: Response) {
    await authService.revokeSession(req.user!.sub, req.params.sessionId as string);
    return res.status(204).send();
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
