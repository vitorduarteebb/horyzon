"use server";

import {
  QAItemStatus,
  TaskStatus,
  UserRole,
} from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { taskSchema } from "@/lib/schemas";

export async function createTask(input: unknown) {
  const session = await requireSession();
  const data = taskSchema.parse(input);
  const createdById = session.user.id;

  await prisma.task.create({
    data: {
      title: data.title,
      description: data.description ?? null,
      projectId: data.projectId?.trim() || null,
      clientId: data.clientId?.trim() || null,
      assigneeId: data.assigneeId,
      createdById,
      status: data.status,
      priority: data.priority,
      dueDate: parseDate(data.dueDate),
      nextAction: data.nextAction?.trim() || null,
      impactedGoal: data.impactedGoal?.trim() || null,
    },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function updateTask(id: string, input: unknown) {
  await requireSession();
  const data = taskSchema.partial().parse(input);

  await prisma.task.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.projectId !== undefined && { projectId: data.projectId?.trim() || null }),
      ...(data.clientId !== undefined && { clientId: data.clientId?.trim() || null }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.dueDate !== undefined && { dueDate: parseDate(data.dueDate) }),
      ...(data.nextAction !== undefined && { nextAction: data.nextAction?.trim() || null }),
      ...(data.impactedGoal !== undefined && { impactedGoal: data.impactedGoal?.trim() || null }),
    },
  });

  revalidatePath("/tasks");
}

function parseDate(s?: string) {
  if (!s?.trim()) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function updateTaskStatus(id: string, status: TaskStatus) {
  await requireSession();
  const prev = await prisma.task.findUnique({
    where: { id },
    select: {
      title: true,
      projectId: true,
      status: true,
    },
  });
  if (!prev) throw new Error("Tarefa não encontrada.");

  const tester = await prisma.user.findFirst({
    where: { role: UserRole.XAVIER, active: true },
  });

  await prisma.$transaction(async (tx) => {
    const completedAt =
      status === TaskStatus.DONE ? new Date() : null;

    await tx.task.update({
      where: { id },
      data: {
        status,
        ...(status === TaskStatus.DONE
          ? { completedAt: completedAt ?? new Date() }
          : { completedAt: null }),
      },
    });

    if (status === TaskStatus.READY_FOR_QA && prev.projectId && tester) {
      await tx.qAItem.upsert({
        where: { taskId: id },
        create: {
          projectId: prev.projectId,
          taskId: id,
          testerId: tester.id,
          title: `QA — ${prev.title}`,
          status: QAItemStatus.PENDING,
        },
        update: {
          status: QAItemStatus.PENDING,
          testedAt: null,
          testerId: tester.id,
          title: `QA — ${prev.title}`,
          notes: null,
        },
      });
    }

    if (status !== TaskStatus.READY_FOR_QA && prev.status === TaskStatus.READY_FOR_QA) {
      // não remove QA — Xavier pode estar validando
    }
  });

  revalidatePath("/tasks");
  revalidatePath("/qa");
  revalidatePath("/dashboard");
}

export async function deleteTask(id: string) {
  await requireSession();
  await prisma.qAItem.deleteMany({ where: { taskId: id } });
  await prisma.task.delete({ where: { id } });
  revalidatePath("/tasks");
}

export async function adminFinalizeTask(taskId: string) {
  const session = await requireSession();
  if (session.user.role !== UserRole.ADMIN) {
    throw new Error("Apenas o Admin pode dar aprovação final.");
  }

  const t = await prisma.task.findUnique({ where: { id: taskId } });
  if (!t || t.status !== TaskStatus.APPROVED) {
    throw new Error("Somente tarefas aprovadas no QA podem ser finalizadas.");
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { status: TaskStatus.DONE, completedAt: new Date() },
  });

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}
