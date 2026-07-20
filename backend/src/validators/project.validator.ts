import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional().nullable(),
  key: z
    .string()
    .trim()
    .min(2)
    .max(6)
    .regex(/^[A-Za-z][A-Za-z0-9]*$/, "Key must start with a letter")
    .transform((value) => value.toUpperCase())
    .optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export const updateProjectSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  description: z.string().trim().max(500).optional().nullable(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export const listProjectsQuerySchema = z.object({
  search: z.string().trim().optional(),
  archived: z
    .enum(["true", "false", "all"])
    .optional()
    .default("false"),
  favorites: z.enum(["true", "false"]).optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type ListProjectsQuery = z.infer<typeof listProjectsQuerySchema>;
