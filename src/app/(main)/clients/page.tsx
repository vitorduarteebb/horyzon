import { prisma } from "@/lib/prisma";
import { ClientsClient } from "@/components/clients/clients-client";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { updatedAt: "desc" },
  });
  return <ClientsClient initialClients={clients} />;
}
