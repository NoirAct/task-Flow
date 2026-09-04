import type { NextFunction, Request, Response } from "express";

type Entry = { count: number; resetAt: number };
const attempts = new Map<string, Entry>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 30;

export function authRateLimit(req: Request, res: Response, next: NextFunction) {
  if (!["/login", "/register", "/forgot-password", "/reset-password"].includes(req.path)) return next();
  const now = Date.now();
  const key = req.ip ?? "unknown";
  const current = attempts.get(key);
  const entry = !current || current.resetAt <= now
    ? { count: 1, resetAt: now + WINDOW_MS }
    : { count: current.count + 1, resetAt: current.resetAt };
  attempts.set(key, entry);
  res.setHeader("RateLimit-Limit", MAX_ATTEMPTS);
  res.setHeader("RateLimit-Remaining", Math.max(0, MAX_ATTEMPTS - entry.count));
  if (entry.count > MAX_ATTEMPTS) {
    res.setHeader("Retry-After", Math.ceil((entry.resetAt - now) / 1000));
    return res.status(429).json({ error: { message: "Too many attempts. Try again later.", code: "RATE_LIMITED" } });
  }
  return next();
}
