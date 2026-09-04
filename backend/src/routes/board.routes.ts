import { Router } from "express";
import { boardController } from "../controllers/board.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { upload } from "../middlewares/upload.js";
import { validate } from "../middlewares/validate.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validators/comment.validator.js";
import {
  createChecklistItemSchema,
  createColumnSchema,
  createLabelSchema,
  createSubtaskSchema,
  createTaskSchema,
  moveTaskSchema,
  reorderColumnsSchema,
  updateChecklistItemSchema,
  updateColumnSchema,
  updateSubtaskSchema,
  updateTaskSchema,
} from "../validators/task.validator.js";
import { demoReadOnly } from "../middlewares/demo-mode.js";

export const boardRoutes = Router();

boardRoutes.use(authenticate);
boardRoutes.use(demoReadOnly);

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

boardRoutes.post(
  "/boards/:boardId/columns",
  validate(createColumnSchema),
  (req, res, next) => {
    boardController.createColumn(req, res).catch(next);
  },
);

boardRoutes.post(
  "/boards/:boardId/columns/reorder",
  validate(reorderColumnsSchema),
  (req, res, next) => {
    boardController.reorderColumns(req, res).catch(next);
  },
);

boardRoutes.patch(
  "/columns/:columnId",
  validate(updateColumnSchema),
  (req, res, next) => {
    boardController.updateColumn(req, res).catch(next);
  },
);

boardRoutes.delete("/columns/:columnId", (req, res, next) => {
  boardController.deleteColumn(req, res).catch(next);
});

boardRoutes.post(
  "/tasks/:taskId/subtasks",
  validate(createSubtaskSchema),
  (req, res, next) => {
    boardController.addSubtask(req, res).catch(next);
  },
);

boardRoutes.patch(
  "/subtasks/:subtaskId",
  validate(updateSubtaskSchema),
  (req, res, next) => {
    boardController.updateSubtask(req, res).catch(next);
  },
);

boardRoutes.delete("/subtasks/:subtaskId", (req, res, next) => {
  boardController.deleteSubtask(req, res).catch(next);
});

boardRoutes.post("/tasks/:taskId/favorite", (req, res, next) => {
  boardController.favoriteTask(req, res).catch(next);
});

boardRoutes.delete("/tasks/:taskId/favorite", (req, res, next) => {
  boardController.unfavoriteTask(req, res).catch(next);
});

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

boardRoutes.post(
  "/tasks/:taskId/comments",
  validate(createCommentSchema),
  (req, res, next) => {
    boardController.createComment(req, res).catch(next);
  },
);

boardRoutes.patch(
  "/comments/:commentId",
  validate(updateCommentSchema),
  (req, res, next) => {
    boardController.updateComment(req, res).catch(next);
  },
);

boardRoutes.delete("/comments/:commentId", (req, res, next) => {
  boardController.deleteComment(req, res).catch(next);
});

boardRoutes.post(
  "/tasks/:taskId/attachments",
  upload.single("file"),
  (req, res, next) => {
    boardController.uploadTaskAttachment(req, res).catch(next);
  },
);

boardRoutes.post(
  "/comments/:commentId/attachments",
  upload.single("file"),
  (req, res, next) => {
    boardController.uploadCommentAttachment(req, res).catch(next);
  },
);

boardRoutes.get("/attachments/:attachmentId/download", (req, res, next) => {
  boardController.downloadAttachment(req, res).catch(next);
});

boardRoutes.delete("/attachments/:attachmentId", (req, res, next) => {
  boardController.deleteAttachment(req, res).catch(next);
});
