import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env.js";

export function demoReadOnly(req: Request, res: Response, next: NextFunction) {
  if (env.DEMO_MODE && !["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return res.status(403).json({ error: { message: "The public demo is read-only.", code: "DEMO_READ_ONLY" } });
  }
  return next();
}

export function demoAccountCreationGuard(req: Request, res: Response, next: NextFunction) {
  if (env.DEMO_MODE) {
    return res.status(403).json({ error: { message: "Registration and password recovery are disabled in the demo.", code: "DEMO_AUTH_DISABLED" } });
  }
  return next();
}
