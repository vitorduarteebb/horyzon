import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  ClipboardCheck,
  Goal,
  LayoutDashboard,
  Library,
  MessagesSquare,
  PanelsTopLeft,
  PieChart,
  Settings2,
  UserSquare2,
  ClipboardList,
  Sparkles,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  mobile?: boolean;
};

export const mainNav: NavItem[] = [
  { href: "/dashboard", label: "Painel", icon: LayoutDashboard, mobile: true },
  { href: "/leads", label: "Leads", icon: Sparkles, mobile: true },
  { href: "/clients", label: "Clientes", icon: UserSquare2 },
  { href: "/projects", label: "Projetos", icon: PanelsTopLeft },
  { href: "/tasks", label: "Tarefas", icon: ClipboardList, mobile: true },
  { href: "/calendar", label: "Agenda", icon: CalendarDays, mobile: true },
  { href: "/qa", label: "QA", icon: ClipboardCheck },
  { href: "/chat", label: "Chat", icon: MessagesSquare, mobile: true },
  { href: "/goals", label: "Metas", icon: Goal },
  { href: "/library", label: "Biblioteca", icon: Library },
  { href: "/reports", label: "Relatórios", icon: PieChart },
  { href: "/settings", label: "Ajustes", icon: Settings2 },
];

export const mobileNavItems = mainNav.filter((i) => i.mobile);
