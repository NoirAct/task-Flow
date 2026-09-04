import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, ProjectStatus, TaskPriority } from "@prisma/client";

const prisma = new PrismaClient();
const DEMO_EMAIL = "demo@taskflow.dev";
const DEMO_PASSWORD = "DemoTaskFlow2026!";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    update: { name: "Demo User", passwordHash },
    create: { email: DEMO_EMAIL, name: "Demo User", passwordHash, preferredLocale: "pt-BR" },
  });

  const project = await prisma.project.upsert({
    where: { ownerId_key: { ownerId: user.id, key: "DEMO" } },
    update: { name: "Lançamento da versão demo", status: ProjectStatus.ACTIVE, archivedAt: null },
    create: {
      ownerId: user.id, key: "DEMO", name: "Lançamento da versão demo",
      description: "Projeto demonstrativo com um fluxo de trabalho completo.",
      color: "#7c3aed", icon: "rocket", status: ProjectStatus.ACTIVE,
    },
  });
  const board = await prisma.board.upsert({
    where: { projectId: project.id }, update: { name: "Produto" },
    create: { projectId: project.id, name: "Produto" },
  });
  const columns = [
    ["backlog", "Backlog", 0], ["todo", "A fazer", 1],
    ["in_progress", "Em andamento", 2], ["review", "Revisão", 3], ["done", "Concluído", 4],
  ] as const;
  for (const [key, name, position] of columns) {
    await prisma.column.upsert({
      where: { boardId_key: { boardId: board.id, key } }, update: { name, position },
      create: { boardId: board.id, key, name, position },
    });
  }
  const savedColumns = new Map((await prisma.column.findMany({ where: { boardId: board.id } })).map((column) => [column.key, column.id]));
  const tasks = [
    ["demo-task-research", "Pesquisar necessidades dos usuários", "backlog", TaskPriority.MEDIUM, 0],
    ["demo-task-copy", "Revisar textos da landing page", "todo", TaskPriority.HIGH, 0],
    ["demo-task-api", "Validar integração da API", "in_progress", TaskPriority.URGENT, 0],
    ["demo-task-qa", "Executar smoke tests", "review", TaskPriority.HIGH, 0],
    ["demo-task-design", "Aprovar identidade visual", "done", TaskPriority.LOW, 0],
  ] as const;
  for (const [id, title, columnKey, priority, position] of tasks) {
    await prisma.task.upsert({
      where: { id }, update: { title, columnId: savedColumns.get(columnKey)!, priority, position },
      create: { id, title, columnId: savedColumns.get(columnKey)!, priority, position, createdById: user.id, assigneeId: user.id },
    });
  }
  await prisma.projectFavorite.upsert({
    where: { userId_projectId: { userId: user.id, projectId: project.id } },
    update: {}, create: { userId: user.id, projectId: project.id },
  });
  console.log(`Seed ready. Demo account: ${DEMO_EMAIL}`);
}

main().catch((error) => { console.error(error); process.exit(1); }).finally(() => prisma.$disconnect());
