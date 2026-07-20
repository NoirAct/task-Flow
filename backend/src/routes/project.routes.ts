import { Router } from "express";
import { projectController } from "../controllers/project.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  createProjectSchema,
  listProjectsQuerySchema,
  updateProjectSchema,
} from "../validators/project.validator.js";

export const projectRoutes = Router();

projectRoutes.use(authenticate);

projectRoutes.get("/", validate(listProjectsQuerySchema, "query"), (req, res, next) => {
  projectController.list(req, res).catch(next);
});

projectRoutes.post("/", validate(createProjectSchema), (req, res, next) => {
  projectController.create(req, res).catch(next);
});

projectRoutes.get("/:id", (req, res, next) => {
  projectController.getById(req, res).catch(next);
});

projectRoutes.patch("/:id", validate(updateProjectSchema), (req, res, next) => {
  projectController.update(req, res).catch(next);
});

projectRoutes.post("/:id/archive", (req, res, next) => {
  projectController.archive(req, res).catch(next);
});

projectRoutes.post("/:id/restore", (req, res, next) => {
  projectController.restore(req, res).catch(next);
});

projectRoutes.post("/:id/favorite", (req, res, next) => {
  projectController.favorite(req, res).catch(next);
});

projectRoutes.delete("/:id/favorite", (req, res, next) => {
  projectController.unfavorite(req, res).catch(next);
});

projectRoutes.post("/:id/duplicate", (req, res, next) => {
  projectController.duplicate(req, res).catch(next);
});

projectRoutes.delete("/:id", (req, res, next) => {
  projectController.remove(req, res).catch(next);
});
