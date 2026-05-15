"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { libraryItemSchema } from "@/lib/schemas";
import { requireSession } from "@/lib/session";

export async function createLibraryItem(input: unknown) {
  const session = await requireSession();
  const data = libraryItemSchema.parse(input);

  await prisma.libraryItem.create({
    data: {
      title: data.title,
      category: data.category,
      content: data.content,
      createdById: session.user.id,
    },
  });
  revalidatePath("/library");
}

export async function updateLibraryItem(id: string, input: unknown) {
  await requireSession();
  const data = libraryItemSchema.partial().parse(input);

  await prisma.libraryItem.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.category !== undefined && { category: data.category }),
      ...(data.content !== undefined && { content: data.content }),
    },
  });
  revalidatePath("/library");
}

export async function deleteLibraryItem(id: string) {
  await requireSession();
  await prisma.libraryItem.delete({ where: { id } });
  revalidatePath("/library");
}
