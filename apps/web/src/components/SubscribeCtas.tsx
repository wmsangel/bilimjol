"use client";

import type { ReactNode } from "react";
import { sendGa4Event } from "@/lib/gtm";
import { ADMIN_TG } from "@/lib/contacts";

/** Событие выбора тарифа: его слушает тарифная карточка (SubscribePlans). */
export const PLAN_EVENT = "bilimjol:select-plan";

/**
 * Призыв «оформить»: считает клик, выбирает тариф в карточке и прокручивает к ней.
 * Сама оплата — только кнопкой в карточке (там email, статус и чекаут Paddle).
 */
export function PlanCta({
  plan,
  placement,
  className,
  children,
}: {
  plan: "monthly" | "annual";
  placement: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        sendGa4Event("cta_click", { placement, item: plan });
        window.dispatchEvent(new CustomEvent(PLAN_EVENT, { detail: plan }));
        document.getElementById("plans")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }}
    >
      {children}
    </button>
  );
}

/** Ссылка «написать в Telegram» со счётчиком кликов. */
export function TelegramCta({
  placement,
  className,
  children,
}: {
  placement: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={ADMIN_TG}
      target="_blank"
      rel="noopener"
      className={className}
      onClick={() => sendGa4Event("cta_click", { placement, item: "telegram" })}
    >
      {children}
    </a>
  );
}
