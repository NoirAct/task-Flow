import { Router } from "express";
import { appRoutes } from "./app.routes.js";
import { authRoutes } from "./auth.routes.js";
import { boardRoutes } from "./board.routes.js";
import { projectRoutes } from "./project.routes.js";
import { prisma } from "../config/database.js";

export const routes = Router();

routes.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", service: "taskflow-backend", database: "ok" });
  } catch {
    res.status(503).json({ status: "degraded", service: "taskflow-backend", database: "unavailable" });
  }
});

routes.use("/auth", authRoutes);
routes.use("/projects", projectRoutes);
routes.use(boardRoutes);
routes.use(appRoutes);
