"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { agendaEventSchema } from "@/lib/schemas";
import { requireSession } from "@/lib/session";

function parseDateStrict(s: string) {
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) throw new Error("Data inválida.");
  return d;
}

export async function createAgendaEvent(input: unknown) {
  await requireSession();
  const data = agendaEventSchema.parse(input);

  await prisma.agendaEvent.create({
    data: {
      title: data.title,
      type: data.type,
      userId: data.userId,
      clientId: data.clientId?.trim() || null,
      projectId: data.projectId?.trim() || null,
      startsAt: parseDateStrict(data.startsAt),
      endsAt: parseDateStrict(data.endsAt),
      notes: data.notes?.trim() || null,
    },
  });
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
}

export async function updateAgendaEvent(id: string, input: unknown) {
  await requireSession();
  const data = agendaEventSchema.partial().parse(input);

  await prisma.agendaEvent.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.type !== undefined && { type: data.type }),
      ...(data.userId !== undefined && { userId: data.userId }),
      ...(data.clientId !== undefined && { clientId: data.clientId?.trim() || null }),
      ...(data.projectId !== undefined && { projectId: data.projectId?.trim() || null }),
      ...(data.startsAt !== undefined && { startsAt: parseDateStrict(data.startsAt) }),
      ...(data.endsAt !== undefined && { endsAt: parseDateStrict(data.endsAt) }),
      ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
    },
  });
  revalidatePath("/calendar");
}

export async function deleteAgendaEvent(id: string) {
  await requireSession();
  await prisma.agendaEvent.delete({ where: { id } });
  revalidatePath("/calendar");
}
