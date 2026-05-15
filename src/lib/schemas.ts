import { z } from "zod";

import {
  AgendaEventType,
  LeadPipelineStatus,
  LeadTemperature,
  ProjectPriority,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  UserRole,
} from "@prisma/client";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Informe o e-mail")
    .email("E-mail inválido")
    .transform((s) => s.trim().toLowerCase()),
  password: z.string().min(1, "Informe a senha"),
});

export const leadSchema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  company: z.string().min(1, "Empresa obrigatória"),
  whatsapp: z.string().min(1, "WhatsApp obrigatório"),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  source: z.string().min(1, "Origem obrigatória"),
  temperature: z.nativeEnum(LeadTemperature),
  status: z.nativeEnum(LeadPipelineStatus),
  ownerId: z.string().min(1),
  nextAction: z.string().optional(),
  followUpAt: z.string().optional(),
  notes: z.string().optional(),
});

export const clientSchema = z.object({
  name: z.string().min(1),
  company: z.string().min(1),
  whatsapp: z.string().min(1),
  email: z.string().email(),
  status: z.string().min(1),
  notes: z.string().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(1),
  clientId: z.string().min(1),
  ownerId: z.string().min(1),
  status: z.nativeEnum(ProjectStatus),
  priority: z.nativeEnum(ProjectPriority),
  value: z.string().optional(),
  deadline: z.string().optional(),
  progress: z.coerce.number().min(0).max(100),
  nextAction: z.string().optional(),
  risk: z.string().optional(),
  description: z.string().optional(),
});

export const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  projectId: z.string().optional(),
  clientId: z.string().optional(),
  assigneeId: z.string().min(1),
  status: z.nativeEnum(TaskStatus),
  priority: z.nativeEnum(TaskPriority),
  dueDate: z.string().optional(),
  nextAction: z.string().optional(),
  impactedGoal: z.string().optional(),
});

export const agendaEventSchema = z.object({
  title: z.string().min(1),
  type: z.nativeEnum(AgendaEventType),
  userId: z.string().min(1),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
  notes: z.string().optional(),
});

export const chatThreadSchema = z.object({
  title: z.string().min(1),
  projectId: z.string().optional(),
  taskId: z.string().optional(),
});

export const chatMessageSchema = z.object({
  threadId: z.string().min(1),
  content: z.string().min(1),
});

export const goalSchema = z.object({
  userId: z.string().min(1),
  title: z.string().min(1),
  target: z.string().min(1),
  current: z.string().min(1),
  period: z.string().min(1),
  startsAt: z.string().min(1),
  endsAt: z.string().min(1),
});

export const libraryItemSchema = z.object({
  title: z.string().min(1),
  category: z.string().min(1),
  content: z.string().min(1),
});

export const userSettingsSchema = z.object({
  name: z.string().min(1),
});

export const roleEnum = z.nativeEnum(UserRole);
