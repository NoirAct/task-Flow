import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "../validators/auth.validator.js";
import { demoAccountCreationGuard } from "../middlewares/demo-mode.js";

export const authRoutes = Router();

authRoutes.post("/register", demoAccountCreationGuard, validate(registerSchema), (req, res, next) => {
  authController.register(req, res).catch(next);
});

authRoutes.post("/login", validate(loginSchema), (req, res, next) => {
  authController.login(req, res).catch(next);
});

authRoutes.post("/refresh", (req, res, next) => {
  authController.refresh(req, res).catch(next);
});

authRoutes.post("/logout", (req, res, next) => {
  authController.logout(req, res).catch(next);
});

authRoutes.get("/me", authenticate, (req, res, next) => {
  authController.me(req, res).catch(next);
});

authRoutes.get("/sessions", authenticate, (req, res, next) => {
  authController.listSessions(req, res).catch(next);
});

authRoutes.delete("/sessions/:sessionId", authenticate, (req, res, next) => {
  authController.revokeSession(req, res).catch(next);
});

authRoutes.post("/forgot-password", demoAccountCreationGuard, validate(forgotPasswordSchema), (req, res, next) => {
  authController.forgotPassword(req, res).catch(next);
});

authRoutes.post("/reset-password", demoAccountCreationGuard, validate(resetPasswordSchema), (req, res, next) => {
  authController.resetPassword(req, res).catch(next);
});
