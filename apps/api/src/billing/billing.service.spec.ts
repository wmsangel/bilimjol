import { describe, it, expect, beforeEach, vi } from "vitest";

// Мокаем серверный Paddle-клиент — тесты не делают реальных вызовов к Paddle.
// vi.hoisted — чтобы объект был доступен в поднятом вверх vi.mock.
const paddle = vi.hoisted(() => ({
  paddleConfigured: vi.fn(() => true),
  listTransactions: vi.fn(async () => []),
  cancelSubscription: vi.fn(async () => undefined),
  updatePaymentMethodTransaction: vi.fn(async () => "txn_test"),
}));
vi.mock("./paddle-api", () => paddle);

import { BillingService } from "./billing.service";

type Sub = {
  id: string;
  userId: string;
  plan: string;
  status: string;
  provider: string;
  externalId: string | null;
  currentPeriodEnd: Date;
};

function matches(row: Record<string, unknown>, where: Record<string, unknown>) {
  return Object.entries(where).every(([k, v]) => {
    if (v && typeof v === "object" && "gt" in (v as object)) {
      return (row[k] as Date) > (v as { gt: Date }).gt;
    }
    if (v && typeof v === "object" && "not" in (v as object)) {
      return row[k] != null && row[k] !== (v as { not: unknown }).not;
    }
    if (v && typeof v === "object" && "in" in (v as object)) {
      return (v as { in: unknown[] }).in.includes(row[k]);
    }
    return row[k] === v;
  });
}

function makePrisma(subs: Sub[], userRole = "user") {
  const store = subs.slice();
  let seq = store.length;
  return {
    subscription: {
      findFirst: vi.fn(async ({ where, orderBy }: any) => {
        let rows = store.filter((r) => matches(r, where));
        if (orderBy?.currentPeriodEnd === "desc") {
          rows = rows
            .slice()
            .sort((a, b) => +b.currentPeriodEnd - +a.currentPeriodEnd);
        }
        return rows[0] ?? null;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const r = store.find((s) => s.id === where.id)!;
        Object.assign(r, data);
        return r;
      }),
      create: vi.fn(async ({ data }: any) => {
        const r = { id: `gen${seq++}`, ...data };
        store.push(r);
        return r;
      }),
    },
    user: {
      findUnique: vi.fn(async () => ({ email: "a@b.c", locale: "ru", role: userRole })),
    },
    __store: store,
  };
}

const mail = { sendPremiumActivated: vi.fn() };
const notify = { notify: vi.fn(), configured: vi.fn(() => false) };

function future(days = 30): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function service(prisma: any) {
  return new BillingService(prisma as any, mail as any, notify as any);
}

beforeEach(() => {
  vi.clearAllMocks();
  paddle.paddleConfigured.mockReturnValue(true);
});

describe("entitlement()", () => {
  it("админ получает премиум даже без активной подписки", async () => {
    const prisma = makePrisma([], "admin");
    const res: any = await service(prisma).entitlement("u1");
    expect(res.premium).toBe(true);
    expect(res.plan).toBe("admin");
  });

  it("обычный пользователь с активной подпиской — премиум", async () => {
    const prisma = makePrisma(
      [{ id: "s1", userId: "u1", plan: "monthly", status: "active", provider: "paddle", externalId: "sub_1", currentPeriodEnd: future() }],
      "user",
    );
    const res: any = await service(prisma).entitlement("u1");
    expect(res.premium).toBe(true);
  });

  it("обычный пользователь с истёкшей подпиской — не премиум", async () => {
    const prisma = makePrisma(
      [{ id: "s1", userId: "u1", plan: "monthly", status: "active", provider: "paddle", externalId: "sub_1", currentPeriodEnd: new Date(Date.now() - 1000) }],
      "user",
    );
    const res: any = await service(prisma).entitlement("u1");
    expect(res.premium).toBe(false);
  });

  it("отменённая подписка в пределах периода — премиум сохраняется до конца", async () => {
    const prisma = makePrisma(
      [{ id: "s1", userId: "u1", plan: "monthly", status: "canceled", provider: "paddle", externalId: "sub_1", currentPeriodEnd: future() }],
      "user",
    );
    const res: any = await service(prisma).entitlement("u1");
    expect(res.premium).toBe(true);
  });
});

describe("subscription()", () => {
  it("возвращает активную подписку своего пользователя", async () => {
    const prisma = makePrisma([
      { id: "s1", userId: "u1", plan: "monthly", status: "active", provider: "paddle", externalId: "sub_1", currentPeriodEnd: future() },
    ]);
    const res: any = await service(prisma).subscription("u1");
    expect(res.hasSubscription).toBe(true);
    expect(res.active).toBe(true);
    expect(res.managementEnabled).toBe(true);
    expect(res.cancelAtPeriodEnd).toBe(false);
  });

  it("не отдаёт чужую подписку (изоляция по userId)", async () => {
    const prisma = makePrisma([
      { id: "s1", userId: "u1", plan: "monthly", status: "active", provider: "paddle", externalId: "sub_1", currentPeriodEnd: future() },
    ]);
    const res: any = await service(prisma).subscription("u2");
    expect(res.hasSubscription).toBe(false);
  });

  it("отменённая подписка в пределах периода → Активна + cancelAtPeriodEnd", async () => {
    const prisma = makePrisma([
      { id: "s1", userId: "u1", plan: "monthly", status: "canceled", provider: "paddle", externalId: "sub_1", currentPeriodEnd: future() },
    ]);
    const res: any = await service(prisma).subscription("u1");
    expect(res.active).toBe(true);
    expect(res.cancelAtPeriodEnd).toBe(true);
    expect(res.status).toBe("canceled");
    expect(res.managementEnabled).toBe(true);
  });

  it("отменённая подписка после конца периода → Неактивна", async () => {
    const prisma = makePrisma([
      { id: "s1", userId: "u1", plan: "monthly", status: "canceled", provider: "paddle", externalId: "sub_1", currentPeriodEnd: new Date(Date.now() - 1000) },
    ]);
    const res: any = await service(prisma).subscription("u1");
    expect(res.active).toBe(false);
    expect(res.cancelAtPeriodEnd).toBe(false);
  });

  it("managementEnabled=false без Paddle-ключа", async () => {
    paddle.paddleConfigured.mockReturnValue(false);
    const prisma = makePrisma([
      { id: "s1", userId: "u1", plan: "monthly", status: "active", provider: "paddle", externalId: "sub_1", currentPeriodEnd: future() },
    ]);
    const res: any = await service(prisma).subscription("u1");
    expect(res.managementEnabled).toBe(false);
  });

  it("админ без подписки → активный служебный доступ, бессрочно", async () => {
    const prisma = makePrisma([], "admin");
    const res: any = await service(prisma).subscription("admin1");
    expect(res.hasSubscription).toBe(true);
    expect(res.active).toBe(true);
    expect(res.plan).toBe("admin");
    expect(res.currentPeriodEnd).toBeNull();
    expect(res.managementEnabled).toBe(false);
  });

  it("админ с ИСТЁКШЕЙ dev-подпиской → показываем активный служебный доступ (кейс владельца)", async () => {
    const prisma = makePrisma(
      [{ id: "s1", userId: "admin1", plan: "monthly", status: "active", provider: "dev", externalId: null, currentPeriodEnd: new Date(Date.now() - 1000) }],
      "admin",
    );
    const res: any = await service(prisma).subscription("admin1");
    expect(res.active).toBe(true);
    expect(res.plan).toBe("admin");
    expect(res.currentPeriodEnd).toBeNull();
  });

  it("админ с реальной активной Paddle-подпиской → показываем её (управление доступно)", async () => {
    const prisma = makePrisma(
      [{ id: "s1", userId: "admin1", plan: "monthly", status: "active", provider: "paddle", externalId: "sub_1", currentPeriodEnd: future() }],
      "admin",
    );
    const res: any = await service(prisma).subscription("admin1");
    expect(res.active).toBe(true);
    expect(res.plan).toBe("monthly");
    expect(res.provider).toBe("paddle");
    expect(res.managementEnabled).toBe(true);
  });
});

describe("handlePaddleEvent()", () => {
  it("subscription.activated → статус active", async () => {
    const prisma = makePrisma([]);
    await service(prisma).handlePaddleEvent({
      event_type: "subscription.activated",
      data: { id: "sub_9", status: "active", custom_data: { userId: "u1" }, current_billing_period: { ends_at: future().toISOString() }, items: [] },
    });
    expect(prisma.__store[0]).toMatchObject({ userId: "u1", provider: "paddle", externalId: "sub_9", status: "active" });
  });

  it("subscription.canceled → статус canceled", async () => {
    const prisma = makePrisma([
      { id: "s1", userId: "u1", plan: "monthly", status: "active", provider: "paddle", externalId: "sub_9", currentPeriodEnd: future() },
    ]);
    await service(prisma).handlePaddleEvent({
      event_type: "subscription.canceled",
      data: { id: "sub_9", status: "canceled", custom_data: { userId: "u1" }, items: [] },
    });
    expect(prisma.__store[0].status).toBe("canceled");
  });

  it("subscription.updated со scheduled_change=cancel → статус canceled (не затирается в active)", async () => {
    const prisma = makePrisma([
      { id: "s1", userId: "u1", plan: "monthly", status: "active", provider: "paddle", externalId: "sub_9", currentPeriodEnd: future() },
    ]);
    await service(prisma).handlePaddleEvent({
      event_type: "subscription.updated",
      data: {
        id: "sub_9",
        status: "active",
        scheduled_change: { action: "cancel" },
        custom_data: { userId: "u1" },
        current_billing_period: { ends_at: future().toISOString() },
        items: [],
      },
    });
    expect(prisma.__store[0].status).toBe("canceled");
  });

  it("не-subscription событие игнорируется", async () => {
    const prisma = makePrisma([]);
    await service(prisma).handlePaddleEvent({ event_type: "transaction.completed", data: { id: "txn_1" } });
    expect(prisma.__store.length).toBe(0);
  });

  it("событие без userId игнорируется", async () => {
    const prisma = makePrisma([]);
    await service(prisma).handlePaddleEvent({ event_type: "subscription.activated", data: { id: "sub_x", status: "active" } });
    expect(prisma.__store.length).toBe(0);
  });
});

describe("оповещения владельцу (Telegram)", () => {
  it("оплата новой подписки → notify вызван", async () => {
    const prisma = makePrisma([]);
    await service(prisma).handlePaddleEvent({
      event_type: "subscription.activated",
      data: { id: "sub_7", status: "active", custom_data: { userId: "u1" }, current_billing_period: { ends_at: future().toISOString() }, items: [] },
    });
    expect(notify.notify).toHaveBeenCalled();
    expect(String(notify.notify.mock.calls[0][0])).toContain("Оплата");
  });

  it("оплата новой подписки → письмо «премиум» отправлено", async () => {
    const prisma = makePrisma([]);
    await service(prisma).handlePaddleEvent({
      event_type: "subscription.activated",
      data: { id: "sub_8", status: "active", custom_data: { userId: "u1" }, current_billing_period: { ends_at: future().toISOString() }, items: [] },
    });
    expect(mail.sendPremiumActivated).toHaveBeenCalled();
  });

  it("отмена подписки → notify вызван", async () => {
    const prisma = makePrisma([
      { id: "s1", userId: "u1", plan: "monthly", status: "active", provider: "paddle", externalId: "sub_7", currentPeriodEnd: future() },
    ]);
    await service(prisma).handlePaddleEvent({
      event_type: "subscription.canceled",
      data: { id: "sub_7", status: "canceled", custom_data: { userId: "u1" }, items: [] },
    });
    expect(notify.notify).toHaveBeenCalled();
    expect(String(notify.notify.mock.calls[0][0])).toContain("Отмена");
  });
});

describe("cancel() — изоляция и вызов Paddle", () => {
  it("нельзя отменить чужую подписку", async () => {
    const prisma = makePrisma([
      { id: "s1", userId: "u1", plan: "monthly", status: "active", provider: "paddle", externalId: "sub_1", currentPeriodEnd: future() },
    ]);
    await expect(service(prisma).cancel("u2")).rejects.toThrow();
    expect(paddle.cancelSubscription).not.toHaveBeenCalled();
  });

  it("отменяет свою подписку через Paddle и помечает canceled", async () => {
    const prisma = makePrisma([
      { id: "s1", userId: "u1", plan: "monthly", status: "active", provider: "paddle", externalId: "sub_1", currentPeriodEnd: future() },
    ]);
    const res: any = await service(prisma).cancel("u1");
    expect(paddle.cancelSubscription).toHaveBeenCalledWith("sub_1");
    expect(res.cancelAtPeriodEnd).toBe(true);
    expect(prisma.__store[0].status).toBe("canceled");
  });

  it("без Paddle-ключа отмена недоступна", async () => {
    paddle.paddleConfigured.mockReturnValue(false);
    const prisma = makePrisma([
      { id: "s1", userId: "u1", plan: "monthly", status: "active", provider: "paddle", externalId: "sub_1", currentPeriodEnd: future() },
    ]);
    await expect(service(prisma).cancel("u1")).rejects.toThrow();
    expect(paddle.cancelSubscription).not.toHaveBeenCalled();
  });
});
