import type { Request, Response } from "express";
import { z } from "zod";
import { teamService } from "../services/team.service.js";
import {
  calendarService,
  notificationService,
  profileService,
  searchService,
} from "../services/misc.service.js";
import { dashboardService } from "../services/dashboard.service.js";

const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional().nullable(),
});

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "MANAGER", "DEVELOPER", "VIEWER"]).optional(),
});

const roleSchema = z.object({
  role: z.enum(["ADMIN", "MANAGER", "DEVELOPER", "VIEWER"]),
});

const profileSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  bio: z.string().trim().max(500).optional().nullable(),
  skills: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  preferredLocale: z.enum(["pt-BR", "en"]).optional(),
  preferredTheme: z.enum(["light", "dark", "system"]).optional(),
});

export const appController = {
  async listTeams(req: Request, res: Response) {
    const teams = await teamService.list(req.user!.sub);
    return res.json({ teams });
  },

  async getTeam(req: Request, res: Response) {
    const team = await teamService.getById(req.user!.sub, req.params.teamId as string);
    return res.json({ team });
  },

  async createTeam(req: Request, res: Response) {
    const body = createTeamSchema.parse(req.body);
    const team = await teamService.create(req.user!.sub, body);
    return res.status(201).json({ team });
  },

  async invite(req: Request, res: Response) {
    const body = inviteSchema.parse(req.body);
    const invite = await teamService.invite(
      req.user!.sub,
      req.params.teamId as string,
      body,
    );
    return res.status(201).json({ invite });
  },

  async acceptInvite(req: Request, res: Response) {
    const result = await teamService.acceptInvite(
      req.user!.sub,
      req.params.token as string,
    );
    return res.json(result);
  },

  async updateMemberRole(req: Request, res: Response) {
    const body = roleSchema.parse(req.body);
    const member = await teamService.updateMemberRole(
      req.user!.sub,
      req.params.teamId as string,
      req.params.memberId as string,
      body.role,
    );
    return res.json({ member });
  },

  async removeMember(req: Request, res: Response) {
    await teamService.removeMember(
      req.user!.sub,
      req.params.teamId as string,
      req.params.memberId as string,
    );
    return res.status(204).send();
  },

  async dashboard(req: Request, res: Response) {
    const summary = await dashboardService.getSummary(req.user!.sub);
    return res.json({ summary });
  },

  async calendar(req: Request, res: Response) {
    const events = await calendarService.listEvents(req.user!.sub, {
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
    });
    return res.json({ events });
  },

  async notifications(req: Request, res: Response) {
    const notifications = await notificationService.list(req.user!.sub);
    return res.json({ notifications });
  },

  async markNotificationRead(req: Request, res: Response) {
    const notification = await notificationService.markRead(
      req.user!.sub,
      req.params.id as string,
    );
    return res.json({ notification });
  },

  async markAllNotificationsRead(req: Request, res: Response) {
    await notificationService.markAllRead(req.user!.sub);
    return res.status(204).send();
  },

  async updateProfile(req: Request, res: Response) {
    const body = profileSchema.parse(req.body);
    const user = await profileService.update(req.user!.sub, body);
    return res.json({ user });
  },

  async profileProjects(req: Request, res: Response) {
    const projects = await profileService.getProjects(req.user!.sub);
    return res.json({ projects });
  },

  async search(req: Request, res: Response) {
    const q = String(req.query.q ?? "");
    const results = await searchService.global(req.user!.sub, q);
    return res.json(results);
  },
};
