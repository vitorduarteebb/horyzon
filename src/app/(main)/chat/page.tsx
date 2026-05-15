import { prisma } from "@/lib/prisma";
import { ChatClient } from "@/components/chat/chat-client";

export default async function ChatPage() {
  const threads = await prisma.chatThread.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      project: true,
      task: true,
      messages: {
        orderBy: { createdAt: "asc" },
        include: { sender: true },
        take: 80,
      },
    },
    take: 40,
  });

  return <ChatClient threads={threads} />;
}
