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
    return row[k] === v;
  });
}

function makePrisma(subs: Sub[]) {
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
      findUnique: vi.fn(async () => ({ email: "a@b.c", locale: "ru" })),
    },
    __store: store,
  };
}

const mail = { sendPremiumActivated: vi.fn() };

function future(days = 30): Date {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function service(prisma: any) {
  return new BillingService(prisma as any, mail as any);
}

beforeEach(() => {
  vi.clearAllMocks();
  paddle.paddleConfigured.mockReturnValue(true);
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

  it("managementEnabled=false без Paddle-ключа", async () => {
    paddle.paddleConfigured.mockReturnValue(false);
    const prisma = makePrisma([
      { id: "s1", userId: "u1", plan: "monthly", status: "active", provider: "paddle", externalId: "sub_1", currentPeriodEnd: future() },
    ]);
    const res: any = await service(prisma).subscription("u1");
    expect(res.managementEnabled).toBe(false);
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
