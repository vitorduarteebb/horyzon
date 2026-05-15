import type {
  AgendaEventType,
  LeadPipelineStatus,
  LeadTemperature,
  NotificationType,
  ProjectPriority,
  ProjectStatus,
  QAItemStatus,
  TaskPriority,
  TaskStatus,
  UserRole,
} from "@prisma/client";

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Fundador / Admin",
  GUSTAVO: "Gustavo (Tech)",
  ANGEL: "Angel (Conteúdo / Comercial)",
  XAVIER: "Xavier (QA / Pesquisa)",
};

export const LEAD_TEMPERATURE_LABELS: Record<LeadTemperature, string> = {
  COLD: "Frio",
  WARM: "Morno",
  HOT: "Quente",
};

export const LEAD_STATUS_LABELS: Record<LeadPipelineStatus, string> = {
  NEW: "Novo",
  QUALIFICATION: "Qualificação",
  DIAGNOSIS: "Diagnóstico",
  PROPOSAL: "Proposta",
  CLOSING: "Fechamento",
  SCOPE: "Escopo",
  PRODUCTION: "Produção",
  VALIDATION: "Validação",
  FINAL_APPROVAL: "Aprovação final",
  DELIVERY: "Entrega",
  SUPPORT: "Suporte",
  CASE_STUDY: "Case / depoimento",
  LOST: "Perdido",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  BACKLOG: "Backlog",
  TODO: "A fazer",
  IN_PROGRESS: "Em andamento",
  BLOCKED: "Bloqueada",
  READY_FOR_QA: "Pronta p/ QA",
  REJECTED: "Reprovada",
  APPROVED: "Aprovada (QA)",
  DONE: "Concluída",
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Baixa",
  MEDIUM: "Média",
  HIGH: "Alta",
  URGENT: "Urgente",
};

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  PLANNING: "Planejamento",
  ACTIVE: "Ativo",
  REVIEW: "Revisão",
  ON_HOLD: "Pausado",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
};

export const PROJECT_PRIORITY_LABELS: Record<ProjectPriority, string> = TASK_PRIORITY_LABELS;

export const QA_ITEM_STATUS_LABELS: Record<QAItemStatus, string> = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Reprovado",
};

export const AGENDA_EVENT_TYPE_LABELS: Record<AgendaEventType, string> = {
  MEETING: "Reunião",
  DELIVERY: "Entrega",
  FOLLOW_UP: "Follow-up",
  INTERNAL_DEADLINE: "Prazo interno",
  OTHER: "Outro",
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  INFO: "Info",
  WARNING: "Alerta",
  SUCCESS: "Sucesso",
  DANGER: "Crítico",
};
