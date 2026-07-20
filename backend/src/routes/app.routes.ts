import { Router } from "express";
import { appController } from "../controllers/app.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

export const appRoutes = Router();

appRoutes.use(authenticate);

appRoutes.get("/teams", (req, res, next) => {
  appController.listTeams(req, res).catch(next);
});
appRoutes.post("/teams", (req, res, next) => {
  appController.createTeam(req, res).catch(next);
});
appRoutes.get("/teams/:teamId", (req, res, next) => {
  appController.getTeam(req, res).catch(next);
});
appRoutes.post("/teams/:teamId/invites", (req, res, next) => {
  appController.invite(req, res).catch(next);
});
appRoutes.post("/invites/:token/accept", (req, res, next) => {
  appController.acceptInvite(req, res).catch(next);
});
appRoutes.patch("/teams/:teamId/members/:memberId", (req, res, next) => {
  appController.updateMemberRole(req, res).catch(next);
});
appRoutes.delete("/teams/:teamId/members/:memberId", (req, res, next) => {
  appController.removeMember(req, res).catch(next);
});

appRoutes.get("/dashboard", (req, res, next) => {
  appController.dashboard(req, res).catch(next);
});
appRoutes.get("/calendar", (req, res, next) => {
  appController.calendar(req, res).catch(next);
});

appRoutes.get("/notifications", (req, res, next) => {
  appController.notifications(req, res).catch(next);
});
appRoutes.post("/notifications/:id/read", (req, res, next) => {
  appController.markNotificationRead(req, res).catch(next);
});
appRoutes.post("/notifications/read-all", (req, res, next) => {
  appController.markAllNotificationsRead(req, res).catch(next);
});

appRoutes.patch("/profile", (req, res, next) => {
  appController.updateProfile(req, res).catch(next);
});
appRoutes.get("/profile/projects", (req, res, next) => {
  appController.profileProjects(req, res).catch(next);
});

appRoutes.get("/search", (req, res, next) => {
  appController.search(req, res).catch(next);
});
