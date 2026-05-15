"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { leadSchema } from "@/lib/schemas";
import { requireSession } from "@/lib/session";

function parseLeadFollowUp(value?: string) {
  if (!value?.trim()) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createLead(input: unknown) {
  await requireSession();
  const data = leadSchema.parse(input);

  await prisma.lead.create({
    data: {
      name: data.name,
      company: data.company,
      whatsapp: data.whatsapp,
      email: data.email?.trim() || null,
      source: data.source,
      temperature: data.temperature,
      status: data.status,
      ownerId: data.ownerId,
      nextAction: data.nextAction?.trim() || null,
      followUpAt: parseLeadFollowUp(data.followUpAt),
      notes: data.notes?.trim() || null,
    },
  });
  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

export async function updateLead(id: string, input: unknown) {
  await requireSession();
  const data = leadSchema.partial().parse(input);

  await prisma.lead.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.company !== undefined && { company: data.company }),
      ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp }),
      ...(data.email !== undefined && { email: data.email?.trim() || null }),
      ...(data.source !== undefined && { source: data.source }),
      ...(data.temperature !== undefined && { temperature: data.temperature }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.ownerId !== undefined && { ownerId: data.ownerId }),
      ...(data.nextAction !== undefined && { nextAction: data.nextAction?.trim() || null }),
      ...(data.followUpAt !== undefined && { followUpAt: parseLeadFollowUp(data.followUpAt) }),
      ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
    },
  });
  revalidatePath("/leads");
  revalidatePath("/dashboard");
}

export async function deleteLead(id: string) {
  await requireSession();
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/leads");
}
