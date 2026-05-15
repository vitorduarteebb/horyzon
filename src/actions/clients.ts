"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { clientSchema } from "@/lib/schemas";
import { requireSession } from "@/lib/session";

export async function createClient(input: unknown) {
  await requireSession();
  const data = clientSchema.parse(input);

  await prisma.client.create({
    data: {
      name: data.name,
      company: data.company,
      whatsapp: data.whatsapp,
      email: data.email,
      status: data.status,
      notes: data.notes?.trim() || null,
    },
  });
  revalidatePath("/clients");
  revalidatePath("/dashboard");
}

export async function updateClient(id: string, input: unknown) {
  await requireSession();
  const data = clientSchema.partial().parse(input);

  await prisma.client.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.company !== undefined && { company: data.company }),
      ...(data.whatsapp !== undefined && { whatsapp: data.whatsapp }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.notes !== undefined && { notes: data.notes?.trim() || null }),
    },
  });
  revalidatePath("/clients");
}

export async function deleteClient(id: string) {
  await requireSession();
  await prisma.client.delete({ where: { id } });
  revalidatePath("/clients");
}
