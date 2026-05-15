import {
  AgendaEventType,
  LeadPipelineStatus,
  LeadTemperature,
  NotificationType,
  PrismaClient,
  ProjectPriority,
  ProjectStatus,
  QAItemStatus,
  TaskPriority,
  TaskStatus,
  UserRole,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function hash(password: string) {
  return bcrypt.hashSync(password, 12);
}

async function main() {
  await prisma.$transaction([
    prisma.chatMessage.deleteMany(),
    prisma.chatThreadMember.deleteMany(),
    prisma.chatThread.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.qAItem.deleteMany(),
    prisma.task.deleteMany(),
    prisma.agendaEvent.deleteMany(),
    prisma.goal.deleteMany(),
    prisma.libraryItem.deleteMany(),
    prisma.project.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.client.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  const admin = await prisma.user.create({
    data: {
      name: "Admin Horyzonn",
      email: "admin@horyzonn.com.br",
      passwordHash: hash("admin123"),
      role: UserRole.ADMIN,
    },
  });

  const gustavo = await prisma.user.create({
    data: {
      name: "Gustavo",
      email: "gustavo@horyzonn.com.br",
      passwordHash: hash("gustavo123"),
      role: UserRole.GUSTAVO,
    },
  });

  const angel = await prisma.user.create({
    data: {
      name: "Angel",
      email: "angel@horyzonn.com.br",
      passwordHash: hash("angel123"),
      role: UserRole.ANGEL,
    },
  });

  const xavier = await prisma.user.create({
    data: {
      name: "Xavier",
      email: "xavier@horyzonn.com.br",
      passwordHash: hash("xavier123"),
      role: UserRole.XAVIER,
    },
  });

  const clientA = await prisma.client.create({
    data: {
      name: "Marina Costa",
      company: "Studio Bloom",
      whatsapp: "+5511999990001",
      email: "marina@blooms.com",
      status: "Ativo",
      notes: "Cliente desde 2025. Foco em performance e SEO.",
    },
  });

  const clientB = await prisma.client.create({
    data: {
      name: "Ricardo Alves",
      company: "Alves Logística",
      whatsapp: "+5511988880002",
      email: "ricardo@alveslog.com.br",
      status: "Implementação",
      notes: "Aguardando aprovação final do escopo técnico.",
    },
  });

  const proj1 = await prisma.project.create({
    data: {
      title: "Site institucional + blog",
      clientId: clientA.id,
      ownerId: admin.id,
      status: ProjectStatus.ACTIVE,
      priority: ProjectPriority.HIGH,
      value: 18500,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      progress: 62,
      nextAction: "Alinhar blocos da home com Angel",
      risk: "Baixo",
      description: "Nova identidade visual e blog com CMS.",
    },
  });

  const projLate = await prisma.project.create({
    data: {
      title: "Dashboard interno fase 2",
      clientId: clientB.id,
      ownerId: admin.id,
      status: ProjectStatus.ACTIVE,
      priority: ProjectPriority.URGENT,
      value: 24000,
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      progress: 40,
      nextAction: "Replanejar entregas — prazo violado",
      risk: "Alto",
      description: "Extensões de relatórios e permissões granulares.",
    },
  });

  const taskQa = await prisma.task.create({
    data: {
      title: "Formulário de contato — validação Xavier",
      description: "Fluxo principal + mensagem de sucesso.",
      projectId: proj1.id,
      assigneeId: gustavo.id,
      createdById: admin.id,
      status: TaskStatus.READY_FOR_QA,
      priority: TaskPriority.HIGH,
      dueDate: new Date(),
      nextAction: "Testar em mobile e desktop",
      impactedGoal: "Entregas da semana",
    },
  });

  await prisma.qAItem.create({
    data: {
      projectId: proj1.id,
      taskId: taskQa.id,
      testerId: xavier.id,
      title: `QA — ${taskQa.title}`,
      status: QAItemStatus.PENDING,
    },
  });

  await prisma.task.create({
    data: {
      title: "Corrigir layout do header no Safari",
      description: "Bug reportado pelo cliente na homologação.",
      projectId: proj1.id,
      assigneeId: gustavo.id,
      createdById: gustavo.id,
      status: TaskStatus.REJECTED,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      nextAction: "Ajustar flex e retestar",
      impactedGoal: "Qualidade de entrega",
    },
  });

  await prisma.task.create({
    data: {
      title: "Implementar filtros na listagem",
      projectId: projLate.id,
      assigneeId: gustavo.id,
      createdById: admin.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      nextAction: "Finalizar paginação + debounce",
      impactedGoal: "Produção milestones",
    },
  });

  await prisma.task.create({
    data: {
      title: "Pedir feedback pós-entrega Bloom",
      projectId: proj1.id,
      clientId: clientA.id,
      assigneeId: angel.id,
      createdById: admin.id,
      status: TaskStatus.TODO,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      nextAction: "Enviar roteiro de depoimento + NPS curto",
      impactedGoal: "Cases e depoimentos",
    },
  });

  const taskApproved = await prisma.task.create({
    data: {
      title: "Integração Stripe — revisão Admin",
      description: "Já homologado por Xavier.",
      projectId: proj1.id,
      assigneeId: gustavo.id,
      createdById: admin.id,
      status: TaskStatus.APPROVED,
      priority: TaskPriority.MEDIUM,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      nextAction: "Admin: aprovar entrega ao cliente ou pedir último polimento.",
      impactedGoal: "Faturamento / fechamento",
    },
  });

  await prisma.qAItem.create({
    data: {
      projectId: proj1.id,
      taskId: taskApproved.id,
      testerId: xavier.id,
      title: `QA — ${taskApproved.title}`,
      status: QAItemStatus.APPROVED,
      testedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      notes: "Fluxo feliz OK. Sem regressões graves.",
    },
  });

  await prisma.task.create({
    data: {
      title: "Pesquisa de benchmarks — Nicho logística",
      assigneeId: xavier.id,
      createdById: angel.id,
      status: TaskStatus.BLOCKED,
      priority: TaskPriority.LOW,
      dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
      nextAction: "Aguardar lista de competidores do cliente",
      impactedGoal: "Diagnósticos",
    },
  });

  await prisma.lead.createMany({
    data: [
      {
        name: "Fernanda Rocha",
        company: "Derma Clinic",
        whatsapp: "+5511977778899",
        email: "fernanda@dermaclinic.com.br",
        source: "Instagram",
        temperature: LeadTemperature.HOT,
        status: LeadPipelineStatus.PRODUCTION,
        ownerId: admin.id,
        nextAction: "Revisão de cópias com Angel",
        followUpAt: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        notes: "Quer lançamento em 45 dias.",
      },
      {
        name: "Paulo Méndez",
        company: "Méndez Advogados",
        whatsapp: "+5511912349988",
        source: "Indicação",
        temperature: LeadTemperature.WARM,
        status: LeadPipelineStatus.PROPOSAL,
        ownerId: admin.id,
        nextAction: "Enviar proposta revisada valor 2",
        followUpAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        notes: "Follow-up em atraso — ligar hoje.",
      },
      {
        name: "Letícia Prado",
        company: "Prado Fit",
        whatsapp: "+5511965432100",
        source: "Anúncio",
        temperature: LeadTemperature.COLD,
        status: LeadPipelineStatus.QUALIFICATION,
        ownerId: angel.id,
        nextAction: "Qualificar budget e urgência",
        followUpAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        notes: "Primeiro contato via formulário.",
      },
    ],
  });

  await prisma.libraryItem.createMany({
    data: [
      {
        title: "Script Whats — primeiro contato",
        category: "scripts_whatsapp",
        content:
          "Olá {{nome}}! Vi que você se interessou pelo nosso trabalho com {{empresa}}. Consigo separar 10 minutos hoje para entender objetivos e próximos passos?",
        createdById: angel.id,
      },
      {
        title: "Modelo proposta diagnóstico",
        category: "proposta_modelo",
        content:
          "1) Contexto 2) Desafios 3) Oportunidades 4) Plano em fases 5) Investimento 6) Próximo passo (call de validação)",
        createdById: admin.id,
      },
      {
        title: "Checklist técnico — Gustavo",
        category: "checklist_gustavo",
        content:
          "Lighthouse >90 mobile, CLS ok, formulários enviando, tratamento de erro, redirects, OG tags, sitemap, robots, analytics configurado.",
        createdById: gustavo.id,
      },
      {
        title: "Checklist criativo — Angel",
        category: "checklist_angel",
        content:
          "Tom de voz, headlines, subtítulos CTAs, prova social, FAQ, página de obrigado, assets entregues no Drive.",
        createdById: angel.id,
      },
      {
        title: "QA checklist padrão (Xavier)",
        category: "checklist_xavier",
        content: "Fluxo feliz + edge cases mobile, regressão rápida, screenshot de bugs.",
        createdById: xavier.id,
      },
      {
        title: "Roteiro diagnóstico discovery",
        category: "roteiro_diagnostico",
        content: "Negócio, público, oferta, canais, tecnologia atual, KPIs, riscos, decisores, timing.",
        createdById: admin.id,
      },
      {
        title: "Precificação — regras básicas",
        category: "precificacao",
        content:
          "Calcular dias estimados × diária. Acréscimos: urgência (+15%), escopo novo (+buffer 20%). Sempre registrar margem no Notion.",
        createdById: admin.id,
      },
    ],
  });

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);

  await prisma.goal.createMany({
    data: [
      {
        userId: admin.id,
        title: "Faturamento previsto aceito",
        target: 80000,
        current: 42500,
        period: "Mai/2026",
        startsAt: weekStart,
        endsAt: new Date(weekStart.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId: gustavo.id,
        title: "Tarefas concluídas com QA aprovado",
        target: 24,
        current: 14,
        period: "Mai/2026",
        startsAt: weekStart,
        endsAt: new Date(weekStart.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId: angel.id,
        title: "Leads qualificados enviados",
        target: 20,
        current: 9,
        period: "Mai/2026",
        startsAt: weekStart,
        endsAt: new Date(weekStart.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        userId: xavier.id,
        title: "Ciclos de QA registrados",
        target: 30,
        current: 17,
        period: "Mai/2026",
        startsAt: weekStart,
        endsAt: new Date(weekStart.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  const threadGeneral = await prisma.chatThread.create({
    data: {
      title: "Geral — Horyzonn",
    },
  });

  for (const u of [admin, gustavo, angel, xavier]) {
    await prisma.chatThreadMember.create({
      data: {
        threadId: threadGeneral.id,
        userId: u.id,
        lastReadAt: new Date(0),
      },
    });
  }

  await prisma.chatMessage.createMany({
    data: [
      {
        threadId: threadGeneral.id,
        senderId: admin.id,
        content: "Equipe — usem o OS para próximas ações. Menos dispersão no Zap.",
      },
      {
        threadId: threadGeneral.id,
        senderId: angel.id,
        content: "Subi dois leads novos para triagem 🙌",
      },
      {
        threadId: threadGeneral.id,
        senderId: gustavo.id,
        content: "Formulário do Bloom foi para QA, aviso quando Xavier validar.",
      },
    ],
  });

  await prisma.agendaEvent.createMany({
    data: [
      {
        title: "Alinhamento semanal",
        type: AgendaEventType.MEETING,
        userId: admin.id,
        startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 24 * 60 * 60 * 1000 + 45 * 60 * 1000),
        notes: "Pipeline + riscos de entrega.",
      },
      {
        title: "Follow Bloom — pré-lançamento",
        type: AgendaEventType.FOLLOW_UP,
        userId: angel.id,
        clientId: clientA.id,
        projectId: proj1.id,
        startsAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 48 * 60 * 60 * 1000 + 30 * 60 * 1000),
        notes: "Confirmar textos das seções extras.",
      },
      {
        title: "Deadline interno — relatórios fase 2",
        type: AgendaEventType.INTERNAL_DEADLINE,
        userId: gustavo.id,
        projectId: projLate.id,
        startsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        endsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
        notes: "Entregar mocks de filtros na branch dev.",
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: xavier.id,
        title: "Item aguardando QA",
        message: `${taskQa.title} está pronto para seus testes.`,
        type: NotificationType.WARNING,
      },
      {
        userId: admin.id,
        title: "Aprovação final pendente",
        message:
          "Há entregas aprovadas no QA técnico aguardando seu ok final antes de mover para DONE.",
        type: NotificationType.INFO,
      },
      {
        userId: angel.id,
        title: "Follow-up vencendo",
        message: "Lead Paulo Méndez está com follow-up atrasado.",
        type: NotificationType.DANGER,
      },
    ],
  });

  const threadProj = await prisma.chatThread.create({
    data: {
      title: "Projeto Bloom — desenvolvimento",
      projectId: proj1.id,
    },
  });

  for (const u of [admin, gustavo, angel, xavier]) {
    await prisma.chatThreadMember.create({
      data: {
        threadId: threadProj.id,
        userId: u.id,
        lastReadAt: new Date(0),
      },
    });
  }

  await prisma.chatMessage.create({
    data: {
      threadId: threadProj.id,
      senderId: xavier.id,
      content: "QA do formulário: validando breakpoints agora.",
    },
  });

  // eslint-disable-next-line no-console
  console.log("Seed concluído: usuários admin / gustavo / angel / xavier + dados demo.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
