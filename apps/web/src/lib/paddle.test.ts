import { describe, it, expect, vi, beforeEach } from "vitest";

const gtm = vi.hoisted(() => ({ sendGa4Event: vi.fn() }));
vi.mock("@/lib/gtm", () => gtm);

import { trackCheckoutStep } from "./paddle";

describe("trackCheckoutStep — шаги чекаута Paddle без персональных данных", () => {
  beforeEach(() => gtm.sendGa4Event.mockClear());

  it("checkout.loaded → checkout_step{item:loaded}", () => {
    trackCheckoutStep({ name: "checkout.loaded", data: { customer: { email: "a@b.c" } } });
    expect(gtm.sendGa4Event).toHaveBeenCalledWith("checkout_step", { item: "loaded" });
  });

  it("отклонённый платёж: тип способа оплаты и код, без email/адреса", () => {
    trackCheckoutStep({
      name: "checkout.payment.failed",
      data: {
        customer: { email: "parent@example.test", address: { country_code: "KG" } },
        payment: { method_details: { type: "card", card: { last4: "4242" } } },
        error: { code: "declined" },
      },
    });
    const [, params] = gtm.sendGa4Event.mock.calls[0];
    expect(params).toEqual({ item: "payment_failed", method: "card", code: "declined" });
    expect(JSON.stringify(params)).not.toContain("example.test");
    expect(JSON.stringify(params)).not.toContain("4242");
  });

  it("ошибка приходит с type вместо name", () => {
    trackCheckoutStep({ type: "checkout.error", code: "transaction_default_checkout_url_not_set", detail: "..." });
    expect(gtm.sendGa4Event).toHaveBeenCalledWith("checkout_step", {
      item: "error",
      code: "transaction_default_checkout_url_not_set",
    });
  });

  it("незнакомые события Paddle не шлём", () => {
    trackCheckoutStep({ name: "checkout.items.updated" });
    trackCheckoutStep(undefined);
    expect(gtm.sendGa4Event).not.toHaveBeenCalled();
  });
});
