import { Router } from "express";
import { appRoutes } from "./app.routes.js";
import { authRoutes } from "./auth.routes.js";
import { boardRoutes } from "./board.routes.js";
import { projectRoutes } from "./project.routes.js";

export const routes = Router();

routes.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "taskflow-backend" });
});

routes.use("/auth", authRoutes);
routes.use("/projects", projectRoutes);
routes.use(boardRoutes);
routes.use(appRoutes);
