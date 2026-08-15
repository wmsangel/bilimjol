// Назначить/снять роль администратора у пользователя по email.
//
//   pnpm --dir apps/api make-admin <email>            # выдать права админа
//   pnpm --dir apps/api make-admin <email> --revoke   # снять права
//   pnpm --dir apps/api make-admin                     # показать текущих админов
//
// Требуется поднятая БД (pnpm --dir apps/api db:up) и уже зарегистрированный
// в приложении аккаунт с этим email. Админ может выдавать премиум, сбрасывать
// пароли и видеть статистику на странице /<lang>/admin.

const fs = require("fs");
const path = require("path");

// Подхватываем DATABASE_URL из apps/api/.env, если не задан в окружении.
if (!process.env.DATABASE_URL) {
  const envPath = path.resolve(__dirname, "../.env");
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
      }
    }
  }
}

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);
  const revoke = args.includes("--revoke");
  const email = args.find((a) => !a.startsWith("--"));

  if (!email) {
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      select: { email: true },
      orderBy: { email: "asc" },
    });
    console.log("Использование: pnpm --dir apps/api make-admin <email> [--revoke]\n");
    console.log(
      admins.length
        ? "Текущие админы:\n" + admins.map((a) => "  • " + a.email).join("\n")
        : "Админов пока нет.",
    );
    return;
  }

  const role = revoke ? "user" : "admin";
  try {
    const u = await prisma.user.update({
      where: { email },
      data: { role },
      select: { email: true, role: true },
    });
    console.log(
      revoke
        ? `✅ У ${u.email} сняты права админа (role=user).`
        : `✅ ${u.email} теперь администратор (role=admin). Откройте /ru/admin.`,
    );
  } catch (e) {
    if (e.code === "P2025") {
      console.error(
        `❌ Пользователь ${email} не найден.\n` +
          "   Сначала зарегистрируйте этот email в приложении (/<lang>/login), затем повторите.",
      );
      process.exitCode = 1;
    } else {
      throw e;
    }
  }
}

main()
  .catch((e) => {
    console.error("Ошибка:", e.message || e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
