"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { goalSchema } from "@/lib/schemas";
import { requireSession } from "@/lib/session";

function parseDecimalMoney(s: string) {
  const n = Number(s.replace(",", "."));
  if (!Number.isFinite(n)) throw new Error("Valor inválido.");
  return n;
}

function parseDateStrict(s: string) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new Error("Data inválida.");
  return d;
}

export async function createGoal(input: unknown) {
  await requireSession();
  const data = goalSchema.parse(input);

  await prisma.goal.create({
    data: {
      userId: data.userId,
      title: data.title,
      target: parseDecimalMoney(data.target),
      current: parseDecimalMoney(data.current),
      period: data.period,
      startsAt: parseDateStrict(data.startsAt),
      endsAt: parseDateStrict(data.endsAt),
    },
  });

  revalidatePath("/goals");
  revalidatePath("/dashboard");
}

export async function updateGoal(id: string, input: unknown) {
  await requireSession();
  const data = goalSchema.partial().parse(input);

  await prisma.goal.update({
    where: { id },
    data: {
      ...(data.userId !== undefined && { userId: data.userId }),
      ...(data.title !== undefined && { title: data.title }),
      ...(data.target !== undefined && { target: parseDecimalMoney(data.target) }),
      ...(data.current !== undefined && { current: parseDecimalMoney(data.current) }),
      ...(data.period !== undefined && { period: data.period }),
      ...(data.startsAt !== undefined && { startsAt: parseDateStrict(data.startsAt) }),
      ...(data.endsAt !== undefined && { endsAt: parseDateStrict(data.endsAt) }),
    },
  });
  revalidatePath("/goals");
}

export async function deleteGoal(id: string) {
  await requireSession();
  await prisma.goal.delete({ where: { id } });
  revalidatePath("/goals");
}
