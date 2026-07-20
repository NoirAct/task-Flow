import type { Request, Response } from "express";
import { projectService } from "../services/project.service.js";

export const projectController = {
  async list(req: Request, res: Response) {
    const projects = await projectService.list(req.user!.sub, req.query as never);
    return res.json({ projects });
  },

  async getById(req: Request, res: Response) {
    const project = await projectService.getById(req.user!.sub, req.params.id as string);
    return res.json({ project });
  },

  async create(req: Request, res: Response) {
    const project = await projectService.create(req.user!.sub, req.body);
    return res.status(201).json({ project });
  },

  async update(req: Request, res: Response) {
    const project = await projectService.update(req.user!.sub, req.params.id as string, req.body);
    return res.json({ project });
  },

  async archive(req: Request, res: Response) {
    const project = await projectService.archive(req.user!.sub, req.params.id as string);
    return res.json({ project });
  },

  async restore(req: Request, res: Response) {
    const project = await projectService.restore(req.user!.sub, req.params.id as string);
    return res.json({ project });
  },

  async remove(req: Request, res: Response) {
    await projectService.remove(req.user!.sub, req.params.id as string);
    return res.status(204).send();
  },

  async favorite(req: Request, res: Response) {
    const project = await projectService.favorite(req.user!.sub, req.params.id as string);
    return res.json({ project });
  },

  async unfavorite(req: Request, res: Response) {
    const project = await projectService.unfavorite(req.user!.sub, req.params.id as string);
    return res.json({ project });
  },

  async duplicate(req: Request, res: Response) {
    const project = await projectService.duplicate(req.user!.sub, req.params.id as string);
    return res.status(201).json({ project });
  },
};
