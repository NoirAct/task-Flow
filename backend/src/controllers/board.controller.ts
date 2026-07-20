import type { Request, Response } from "express";
import { boardService } from "../services/board.service.js";

export const boardController = {
  async getByProject(req: Request, res: Response) {
    const board = await boardService.getByProjectId(
      req.user!.sub,
      req.params.projectId as string,
    );
    return res.json({ board });
  },

  async getTask(req: Request, res: Response) {
    const task = await boardService.getTask(req.user!.sub, req.params.taskId as string);
    return res.json({ task });
  },

  async createTask(req: Request, res: Response) {
    const task = await boardService.createTask(req.user!.sub, req.body);
    return res.status(201).json({ task });
  },

  async updateTask(req: Request, res: Response) {
    const task = await boardService.updateTask(
      req.user!.sub,
      req.params.taskId as string,
      req.body,
    );
    return res.json({ task });
  },

  async moveTask(req: Request, res: Response) {
    const task = await boardService.moveTask(
      req.user!.sub,
      req.params.taskId as string,
      req.body,
    );
    return res.json({ task });
  },

  async deleteTask(req: Request, res: Response) {
    await boardService.deleteTask(req.user!.sub, req.params.taskId as string);
    return res.status(204).send();
  },

  async listLabels(req: Request, res: Response) {
    const labels = await boardService.listLabels(
      req.user!.sub,
      req.params.projectId as string,
    );
    return res.json({ labels });
  },

  async createLabel(req: Request, res: Response) {
    const label = await boardService.createLabel(
      req.user!.sub,
      req.params.projectId as string,
      req.body,
    );
    return res.status(201).json({ label });
  },

  async addChecklistItem(req: Request, res: Response) {
    const item = await boardService.addChecklistItem(
      req.user!.sub,
      req.params.taskId as string,
      req.body,
    );
    return res.status(201).json({ item });
  },

  async updateChecklistItem(req: Request, res: Response) {
    const item = await boardService.updateChecklistItem(
      req.user!.sub,
      req.params.itemId as string,
      req.body,
    );
    return res.json({ item });
  },

  async deleteChecklistItem(req: Request, res: Response) {
    await boardService.deleteChecklistItem(req.user!.sub, req.params.itemId as string);
    return res.status(204).send();
  },
};
