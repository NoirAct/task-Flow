import { Router } from "express";
import { boardController } from "../controllers/board.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  createTaskSchema,
  moveTaskSchema,
  updateTaskSchema,
} from "../validators/task.validator.js";

export const boardRoutes = Router();

boardRoutes.use(authenticate);

boardRoutes.get("/projects/:projectId/board", (req, res, next) => {
  boardController.getByProject(req, res).catch(next);
});

boardRoutes.post("/tasks", validate(createTaskSchema), (req, res, next) => {
  boardController.createTask(req, res).catch(next);
});

boardRoutes.patch("/tasks/:taskId", validate(updateTaskSchema), (req, res, next) => {
  boardController.updateTask(req, res).catch(next);
});

boardRoutes.post("/tasks/:taskId/move", validate(moveTaskSchema), (req, res, next) => {
  boardController.moveTask(req, res).catch(next);
});

boardRoutes.delete("/tasks/:taskId", (req, res, next) => {
  boardController.deleteTask(req, res).catch(next);
});
