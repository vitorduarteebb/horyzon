import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SettingsPage() {
  const session = await auth();

  return (
    <Card className="max-w-xl rounded-3xl border-2">
      <CardHeader>
        <CardTitle>Conta interna</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Nome</p>
          <p className="text-lg font-semibold">{session?.user?.name}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">E-mail</p>
          <p className="text-lg">{session?.user?.email}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Papel em OS</p>
          <p className="font-medium">{session?.user?.role}</p>
        </div>
        <p className="text-muted-foreground">
          Para alterações críticas (perfil, permissões prolongadas), fale diretamente com o Admin através
          dos canais oficiais.
        </p>
      </CardContent>
    </Card>
  );
}
