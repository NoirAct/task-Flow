import { z } from "zod";

export const taskPrioritySchema = z.enum(["NONE", "LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createTaskSchema = z.object({
  columnId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(5000).optional().nullable(),
  priority: taskPrioritySchema.optional(),
  dueDate: z.string().datetime().optional().nullable(),
  estimatedMinutes: z.number().int().min(0).max(100000).optional().nullable(),
  assigneeId: z.string().min(1).optional().nullable(),
  labelIds: z.array(z.string().min(1)).optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional().nullable(),
  priority: taskPrioritySchema.optional(),
  dueDate: z.string().datetime().optional().nullable(),
  estimatedMinutes: z.number().int().min(0).max(100000).optional().nullable(),
  spentMinutes: z.number().int().min(0).max(100000).optional(),
  assigneeId: z.string().min(1).optional().nullable(),
  labelIds: z.array(z.string().min(1)).optional(),
});

export const moveTaskSchema = z.object({
  columnId: z.string().min(1),
  position: z.number().int().min(0),
});

export const createChecklistItemSchema = z.object({
  title: z.string().trim().min(1).max(200),
});

export const updateChecklistItemSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  done: z.boolean().optional(),
});

export const createLabelSchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type MoveTaskInput = z.infer<typeof moveTaskSchema>;
export type CreateChecklistItemInput = z.infer<typeof createChecklistItemSchema>;
export type UpdateChecklistItemInput = z.infer<typeof updateChecklistItemSchema>;
export type CreateLabelInput = z.infer<typeof createLabelSchema>;
