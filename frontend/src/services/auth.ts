import { apiRequest, setAccessToken } from "@/services/api";
import type { AuthResponse, User } from "@/types/auth";

export const authApi = {
  register(data: { name: string; email: string; password: string }) {
    return apiRequest<AuthResponse>("/auth/register", {
      method: "POST",
      body: data,
      skipAuthRefresh: true,
    });
  },

  login(data: { email: string; password: string }) {
    return apiRequest<AuthResponse>("/auth/login", {
      method: "POST",
      body: data,
      skipAuthRefresh: true,
    });
  },

  refresh() {
    return apiRequest<AuthResponse>("/auth/refresh", {
      method: "POST",
      skipAuthRefresh: true,
    });
  },

  logout() {
    return apiRequest<void>("/auth/logout", {
      method: "POST",
      skipAuthRefresh: true,
    });
  },

  me() {
    return apiRequest<{ user: User }>("/auth/me");
  },

  forgotPassword(email: string) {
    return apiRequest<{ message: string; resetUrl?: string }>("/auth/forgot-password", {
      method: "POST",
      body: { email },
      skipAuthRefresh: true,
    });
  },

  resetPassword(token: string, password: string) {
    return apiRequest<{ message: string }>("/auth/reset-password", {
      method: "POST",
      body: { token, password },
      skipAuthRefresh: true,
    });
  },

  applySession(result: AuthResponse) {
    setAccessToken(result.accessToken);
    return result.user;
  },

  clearSession() {
    setAccessToken(null);
  },
};
