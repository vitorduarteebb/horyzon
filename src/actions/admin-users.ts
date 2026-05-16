"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { adminCreateUserSchema } from "@/lib/schemas";

export type CreateUserResult =
  | { ok: true; message: string }
  | { ok: false; message: string };

export async function createUserAsAdmin(input: unknown): Promise<CreateUserResult> {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { ok: false, message: "Apenas administradores podem criar utilizadores." };
  }
  const parsed = adminCreateUserSchema.safeParse(input);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors;
    const first = [...Object.values(msg)].flat()[0];
    return { ok: false, message: first ?? "Dados inválidos." };
  }

  const { name, email, password, role } = parsed.data;
  try {
    const passwordHash = bcrypt.hashSync(password, 12);
    await prisma.user.create({
      data: {
        name: name.trim(),
        email,
        passwordHash,
        role,
        active: true,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, message: "Já existe um utilizador com este e-mail." };
    }
    console.error("[createUserAsAdmin]", e);
    return { ok: false, message: "Não foi possível criar o utilizador. Tenta de novo." };
  }

  revalidatePath("/admin/usuarios");
  revalidatePath("/dashboard");
  return { ok: true, message: "Utilizador criado." };
}
