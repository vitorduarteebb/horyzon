import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function UserAvatar({
  name,
  avatarUrl,
  className,
}: {
  name: string;
  avatarUrl?: string | null;
  className?: string;
}) {
  return (
    <Avatar className={cn("h-9 w-9 border border-border shadow-sm", className)}>
      <AvatarImage alt={name} src={avatarUrl ?? undefined} />
      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
