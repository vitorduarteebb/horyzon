"use client";

import { useState } from "react";

import { UserRole } from "@prisma/client";

import { createUserAsAdmin } from "@/actions/admin-users";
import { ROLE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const inputClass =
  "flex h-11 w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 dark:bg-input/30";

const ROLE_ORDER = [
  UserRole.ADMIN,
  UserRole.GUSTAVO,
  UserRole.ANGEL,
  UserRole.XAVIER,
] as const satisfies readonly UserRole[];

export function AdminCreateUserForm() {
  const [role, setRole] = useState<UserRole>(UserRole.XAVIER);
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    const payload = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role,
    };
    const res = await createUserAsAdmin(payload);
    setLoading(false);
    if (res.ok) {
      toast.success(res.message);
      (document.getElementById("admin-create-user-form") as HTMLFormElement)?.reset();
      setRole(UserRole.XAVIER);
      return;
    }
    toast.error(res.message);
  }

  return (
    <Card className="rounded-3xl border-2 shadow-sm ring-1 ring-white/10">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold tracking-tight">Novo utilizador</CardTitle>
        <CardDescription>
          Credenciais institucionais. A senha é guardada com hash seguro na base de dados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="admin-create-user-form"
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            void onSubmit(new FormData(e.currentTarget));
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="su-name">Nome</Label>
            <Input id="su-name" name="name" className={cn(inputClass, "h-11 rounded-xl")} required autoComplete="off" placeholder="Nome completo" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="su-email">E-mail</Label>
            <Input
              id="su-email"
              name="email"
              type="email"
              inputMode="email"
              className={cn(inputClass, "h-11 rounded-xl")}
              required
              autoComplete="off"
              placeholder="email@empresa.com"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="su-password">Senha inicial</Label>
            <Input
              id="su-password"
              name="password"
              type="password"
              className={cn(inputClass, "h-11 rounded-xl")}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
          <div className="space-y-2">
            <Label>Papel</Label>
            <Select value={role} onValueChange={(v) => setRole(v as UserRole)}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_ORDER.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading} className="h-11 w-full rounded-2xl font-semibold">
            {loading ? "A criar…" : "Criar utilizador"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
