// Общий сценарий «Возобновить подписку» — для кабинета (/billing) и страницы
// подписки (/subscribe). Что именно делать, решает сервер (он спрашивает Paddle):
//  - "resumed"  — отмена была запланирована на конец периода и снята. Денег не
//                 списано, следующее списание пройдёт по прежнему графику.
//  - "checkout" — подписка в Paddle уже завершена, вернуть её нельзя: открываем
//                 обычный чекаут (новая подписка).
import { getSubscription, loadAuth, resumeSubscription } from "@/lib/api";
import { sendGa4Event } from "@/lib/gtm";
import { PADDLE_PLANS, openPaddleCheckout, type PlanKey } from "@/lib/paddle";

/** Ждём вебхук Paddle: подписка активна и не помечена отменённой. */
async function waitActive(): Promise<boolean> {
  for (let i = 0; i < 8; i++) {
    try {
      const s = await getSubscription();
      if (s.hasSubscription && s.active && !s.cancelAtPeriodEnd) return true;
    } catch {
      /* ignore */
    }
    await new Promise((r) => setTimeout(r, 1500));
  }
  return false;
}

export async function resumeSubscriptionFlow(opts: {
  locale: string;
  /** Тариф для нового чекаута (если подписку придётся оформлять заново). */
  plan: PlanKey;
  /** Откуда нажали: "billing" | "subscribe_page". */
  source: string;
  /** Подписка снова активна — обновить экран. */
  onActive: () => void;
  /**
   * Открыт новый чекаут: сервер уже выровнял подписку по Paddle (она закрыта,
   * доступ мог закончиться) — перечитать состояние, не дожидаясь оплаты.
   */
  onCheckoutOpened?: () => void;
}): Promise<"resumed" | "checkout"> {
  sendGa4Event("cta_click", { placement: "subscription-resume", item: opts.source });
  const res = await resumeSubscription();

  if (res.mode === "resumed") {
    sendGa4Event("tool_used", {
      tool: "subscription",
      item: "subscription_resumed",
      mode: "resumed",
    });
    opts.onActive();
    return "resumed";
  }

  const auth = loadAuth();
  const selected = PADDLE_PLANS.find((p) => p.key === opts.plan) ?? PADDLE_PLANS[0];
  await openPaddleCheckout({
    priceId: selected.priceId,
    userId: auth?.user.id,
    email: auth?.user.email,
    locale: opts.locale,
    onComplete: () => {
      void waitActive().then((ok) => {
        if (ok) {
          sendGa4Event("tool_used", {
            tool: "subscription",
            item: "subscription_resumed",
            mode: "checkout",
          });
        }
        opts.onActive();
      });
    },
  });
  sendGa4Event("checkout_open", { plan: selected.key, source: "subscription-resume" });
  opts.onCheckoutOpened?.();
  return "checkout";
}
