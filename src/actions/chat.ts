"use server";

import { NotificationType } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { chatMessageSchema, chatThreadSchema } from "@/lib/schemas";
import { requireSession } from "@/lib/session";

export async function createChatThread(input: unknown) {
  await requireSession();
  const data = chatThreadSchema.parse(input);

  const thread = await prisma.chatThread.create({
    data: {
      title: data.title,
      projectId: data.projectId?.trim() || null,
      taskId: data.taskId?.trim() || null,
    },
  });

  const userIds = await prisma.user.findMany({
    where: { active: true },
    select: { id: true },
  });

  await prisma.chatThreadMember.createMany({
    data: userIds.map((u) => ({
      threadId: thread.id,
      userId: u.id,
    })),
    skipDuplicates: true,
  });

  revalidatePath("/chat");
}
export async function sendChatMessage(input: unknown) {
  const session = await requireSession();
  const data = chatMessageSchema.parse(input);

  await prisma.chatMessage.create({
    data: {
      threadId: data.threadId,
      senderId: session.user.id,
      content: data.content.trim(),
    },
  });

  const members = await prisma.chatThreadMember.findMany({
    where: { threadId: data.threadId },
  });

  await Promise.all(
    members
      .filter((m) => m.userId !== session.user.id)
      .map((m) =>
        prisma.notification.create({
          data: {
            userId: m.userId,
            title: "Nova mensagem no chat",
            message: data.content.trim().slice(0, 180),
            type: NotificationType.INFO,
          },
        }),
      ),
  );

  revalidatePath("/chat");
  revalidatePath("/dashboard");
}

export async function markThreadRead(threadId: string) {
  const session = await requireSession();
  await prisma.chatThreadMember.updateMany({
    where: {
      threadId,
      userId: session.user.id,
    },
    data: { lastReadAt: new Date() },
  });
  revalidatePath("/chat");
}
