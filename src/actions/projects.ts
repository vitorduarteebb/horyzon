"use server";

import { UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { projectSchema } from "@/lib/schemas";
import { requireSession } from "@/lib/session";

function parseMaybeDate(s?: string) {
  if (!s?.trim()) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function parseDecimal(s?: string) {
  if (!s?.trim()) return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export async function createProject(input: unknown) {
  const session = await requireSession();
  const data = projectSchema.parse(input);

  if (session.user.role !== UserRole.ADMIN) {
    throw new Error("Apenas o Admin pode criar projetos a partir do fluxo operacional.");
  }

  await prisma.project.create({
    data: {
      title: data.title,
      clientId: data.clientId,
      ownerId: data.ownerId,
      status: data.status,
      priority: data.priority,
      value: parseDecimal(data.value),
      deadline: parseMaybeDate(data.deadline),
      progress: data.progress,
      nextAction: data.nextAction?.trim() || null,
      risk: data.risk?.trim() || null,
      description: data.description?.trim() || null,
    },
  });
  revalidatePath("/projects");
  revalidatePath("/dashboard");
}

export async function updateProject(id: string, input: unknown) {
  await requireSession();
  const data = projectSchema.partial().parse(input);

  await prisma.project.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.clientId !== undefined && { clientId: data.clientId }),
      ...(data.ownerId !== undefined && { ownerId: data.ownerId }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.value !== undefined && { value: parseDecimal(data.value) }),
      ...(data.deadline !== undefined && { deadline: parseMaybeDate(data.deadline) }),
      ...(data.progress !== undefined && { progress: data.progress }),
      ...(data.nextAction !== undefined && { nextAction: data.nextAction?.trim() || null }),
      ...(data.risk !== undefined && { risk: data.risk?.trim() || null }),
      ...(data.description !== undefined && { description: data.description?.trim() || null }),
    },
  });
  revalidatePath("/projects");
}

export async function deleteProject(id: string) {
  await requireSession();
  await prisma.project.delete({ where: { id } });
  revalidatePath("/projects");
}
