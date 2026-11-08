import { describe, it, expect, vi } from "vitest";
import { AuthService } from "./auth.service";

// Лёгкие моки зависимостей: проверяем, что регистрация/гостевой старт дёргают
// транзакционные письма и оповещение владельцу.
function makeDeps() {
  const prisma = {
    user: {
      findUnique: vi.fn(async () => null),
      create: vi.fn(async ({ data }: any) => ({ id: "u1", role: "user", ...data })),
    },
    refreshToken: { create: vi.fn(async () => ({})) },
  };
  const jwt = { signAsync: vi.fn(async () => "token") };
  const mail = { sendWelcome: vi.fn(), sendSetPassword: vi.fn() };
  const notify = { notify: vi.fn() };
  return { prisma, jwt, mail, notify };
}

function svc(d: ReturnType<typeof makeDeps>) {
  return new AuthService(
    d.prisma as any,
    d.jwt as any,
    d.mail as any,
    d.notify as any,
  );
}

describe("register() — триггеры писем", () => {
  it("шлёт welcome-письмо и оповещение владельцу", async () => {
    const d = makeDeps();
    await svc(d).register({
      email: "a@b.c",
      password: "secret123",
      locale: "ru",
    } as any);
    expect(d.mail.sendWelcome).toHaveBeenCalled();
    expect(d.notify.notify).toHaveBeenCalled();
    expect(d.prisma.user.create).toHaveBeenCalled();
  });

  it("не шлёт welcome и не создаёт юзера при занятом email", async () => {
    const d = makeDeps();
    d.prisma.user.findUnique = vi.fn(async () => ({ id: "x", email: "a@b.c" })) as any;
    await expect(
      svc(d).register({ email: "a@b.c", password: "secret123" } as any),
    ).rejects.toThrow();
    expect(d.mail.sendWelcome).not.toHaveBeenCalled();
    expect(d.prisma.user.create).not.toHaveBeenCalled();
  });
});

describe("guestStart() — триггеры писем", () => {
  it("шлёт письмо «задать пароль» и оповещение владельцу", async () => {
    const d = makeDeps();
    await svc(d).guestStart({ email: "g@b.c", locale: "ru" } as any);
    expect(d.mail.sendSetPassword).toHaveBeenCalled();
    expect(d.notify.notify).toHaveBeenCalled();
  });
});
