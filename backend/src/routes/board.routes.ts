import { Router } from "express";
import { boardController } from "../controllers/board.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  createChecklistItemSchema,
  createLabelSchema,
  createTaskSchema,
  moveTaskSchema,
  updateChecklistItemSchema,
  updateTaskSchema,
} from "../validators/task.validator.js";

export const boardRoutes = Router();

boardRoutes.use(authenticate);

boardRoutes.get("/projects/:projectId/board", (req, res, next) => {
  boardController.getByProject(req, res).catch(next);
});

boardRoutes.get("/projects/:projectId/labels", (req, res, next) => {
  boardController.listLabels(req, res).catch(next);
});

boardRoutes.post(
  "/projects/:projectId/labels",
  validate(createLabelSchema),
  (req, res, next) => {
    boardController.createLabel(req, res).catch(next);
  },
);

boardRoutes.get("/tasks/:taskId", (req, res, next) => {
  boardController.getTask(req, res).catch(next);
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

boardRoutes.post(
  "/tasks/:taskId/checklist",
  validate(createChecklistItemSchema),
  (req, res, next) => {
    boardController.addChecklistItem(req, res).catch(next);
  },
);

boardRoutes.patch(
  "/checklist/:itemId",
  validate(updateChecklistItemSchema),
  (req, res, next) => {
    boardController.updateChecklistItem(req, res).catch(next);
  },
);

boardRoutes.delete("/checklist/:itemId", (req, res, next) => {
  boardController.deleteChecklistItem(req, res).catch(next);
});
