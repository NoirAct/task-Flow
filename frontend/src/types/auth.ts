export type User = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  preferredLocale: string;
  preferredTheme: string;
  createdAt: string;
};

export type ApiErrorBody = {
  error: {
    message: string;
    code?: string;
    details?: unknown;
  };
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};
