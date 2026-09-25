"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { getEntitlement, isLoggedIn } from "@/lib/api";
import { pushEvent } from "@/lib/gtm";
import { PRICE, approxLocal } from "@/lib/pricing";

/**
 * Гейт премиум-контента (напр. премиум-игры). Пока проверяем entitlement —
 * скелетон; премиум → показываем детей (игру); иначе — пейвол с CTA на подписку.
 * Серверная обёртка страницы (заголовок, описание, крошки) остаётся ради SEO —
 * заменяется только сам интерактив.
 */
export function PremiumGate({
  locale,
  subscribeHref,
  gameTitle,
  source,
  children,
}: {
  locale: string;
  subscribeHref: string;
  gameTitle: string;
  source: string;
  children: ReactNode;
}) {
  const [state, setState] = useState<"loading" | "premium" | "locked">("loading");
  const t = (ru: string, ky: string) => (locale === "ky" ? ky : ru);

  useEffect(() => {
    if (!isLoggedIn()) {
      setState("locked");
      return;
    }
    getEntitlement()
      .then((e) => setState(e.premium ? "premium" : "locked"))
      .catch(() => setState("locked"));
  }, []);

  if (state === "loading")
    return <div className="h-56 w-full animate-pulse rounded-3xl bg-white/70" />;

  if (state === "premium") return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-[#191539] p-8 text-center text-white shadow-[0_20px_50px_rgba(25,21,57,.25)]">
      <div className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[#6d5cf7] opacity-40 blur-[60px]" />
      <div className="relative">
        <div className="mb-3 text-5xl">🔒</div>
        <h2 className="font-display text-2xl font-bold">
          {t("Эта игра — в премиуме", "Бул оюн — премиумда")}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-[#d9d5f5]">
          {t(
            `«${gameTitle}» открывается по подписке — вместе со всеми заданиями, тестами, олимпиадой и гардеробом.`,
            `«${gameTitle}» жазылуу менен ачылат — бардык тапшырмалар, тесттер, олимпиада жана гардероб менен бирге.`,
          )}
        </p>
        <Link
          href={subscribeHref}
          onClick={() => pushEvent("subscribe_click", { source, plan: "premium" })}
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#6d5cf7] px-7 py-3.5 text-base font-extrabold text-white shadow-[0_0_0_3px_#e6c079] transition hover:-translate-y-0.5 active:scale-[.99]"
        >
          {t(
            `Открыть за ${PRICE.monthly.display}/мес`,
            `${PRICE.monthly.display}/айга ачуу`,
          )}{" "}
          →
        </Link>
        <div className="mt-2 text-xs text-[#b9b3e6]">
          {approxLocal("monthly")} · {t("примерно", "болжолдуу")}
        </div>
      </div>
    </div>
  );
}
