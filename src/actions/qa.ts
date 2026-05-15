"use server";

import { QAItemStatus, TaskStatus, UserRole } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const rejectSchema = z.object({
  qaItemId: z.string().min(1),
  reason: z.string().min(4, "Descreva o motivo da reprovação."),
});

export async function approveQAItem(qaItemId: string) {
  const session = await requireSession();
  if (session.user.role !== UserRole.XAVIER && session.user.role !== UserRole.ADMIN) {
    throw new Error("Somente Xavier (ou Admin) pode aprovar itens de QA técnico.");
  }

  const item = await prisma.qAItem.findUnique({
    where: { id: qaItemId },
    include: { task: true },
  });
  if (!item) throw new Error("Item de QA não encontrado.");

  await prisma.$transaction(async (tx) => {
    await tx.qAItem.update({
      where: { id: qaItemId },
      data: {
        status: QAItemStatus.APPROVED,
        testedAt: new Date(),
      },
    });
    if (item.taskId) {
      await tx.task.update({
        where: { id: item.taskId },
        data: { status: TaskStatus.APPROVED },
      });
    }
  });

  revalidatePath("/qa");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function rejectQAItem(payload: unknown) {
  const session = await requireSession();
  if (session.user.role !== UserRole.XAVIER && session.user.role !== UserRole.ADMIN) {
    throw new Error("Somente Xavier (ou Admin) pode reprovar itens de QA técnico.");
  }

  const { qaItemId, reason } = rejectSchema.parse(payload);

  const item = await prisma.qAItem.findUnique({ where: { id: qaItemId } });
  if (!item) throw new Error("Item de QA não encontrado.");

  await prisma.$transaction(async (tx) => {
    await tx.qAItem.update({
      where: { id: qaItemId },
      data: {
        status: QAItemStatus.REJECTED,
        notes: reason,
        testedAt: new Date(),
      },
    });
    if (item.taskId) {
      await tx.task.update({
        where: { id: item.taskId },
        data: { status: TaskStatus.REJECTED },
      });
    }
  });

  revalidatePath("/qa");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
}

export async function updateQAItemNotes(qaItemId: string, notes: string) {
  await requireSession();
  await prisma.qAItem.update({
    where: { id: qaItemId },
    data: { notes },
  });
  revalidatePath("/qa");
}
