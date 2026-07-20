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

export const authRoutes = Router();

authRoutes.post("/register", validate(registerSchema), (req, res, next) => {
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

authRoutes.post("/forgot-password", validate(forgotPasswordSchema), (req, res, next) => {
  authController.forgotPassword(req, res).catch(next);
});

authRoutes.post("/reset-password", validate(resetPasswordSchema), (req, res, next) => {
  authController.resetPassword(req, res).catch(next);
});
