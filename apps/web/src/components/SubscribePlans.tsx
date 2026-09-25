"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEntitlement, isLoggedIn, loadAuth } from "@/lib/api";
import { pushEvent } from "@/lib/gtm";
import { loadLastGrade } from "@/lib/prefs";
import { PADDLE_PLANS, openPaddleCheckout, type PlanKey } from "@/lib/paddle";

// Запасной путь: если оплата картой недоступна (домен ещё на апруве / Paddle не
// загрузился) — написать администратору. Переопределяется env.
const ADMIN_TG =
  process.env.NEXT_PUBLIC_ADMIN_TELEGRAM ?? "https://t.me/izagorodnyi";

export interface SubscribeLabels {
  benefits: string[];
  planName: string;
  period: string;
  cta: string;
  ctaLogin: string;
  emailHint: string;
  activeTitle: string;
  activeUntil: string;
  note: string;
}

type Status = "loading" | "guest" | "available" | "active";

function fmtDate(iso: string | null, locale: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale === "ky" ? "ky-KG" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function SubscribePlans({
  labels,
  locale,
  loginHref,
}: {
  labels: SubscribeLabels;
  locale: string;
  loginHref: string;
  playHref: string;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [until, setUntil] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanKey>("monthly");
  const [paying, setPaying] = useState(false);
  const [checkoutFailed, setCheckoutFailed] = useState(false);

  const t = (ru: string, ky: string) => (locale === "ky" ? ky : ru);
  const selected = PADDLE_PLANS.find((p) => p.key === plan) ?? PADDLE_PLANS[0];

  useEffect(() => {
    const auth = loadAuth();
    setEmail(auth?.user.email ?? null);
    setUserId(auth?.user.id ?? null);
    pushEvent("view_subscribe", { grade: loadLastGrade(), lang: locale });

    if (!isLoggedIn()) {
      setStatus("guest");
      return;
    }
    getEntitlement()
      .then((e) => {
        if (e.premium) {
          setUntil(e.until);
          setStatus("active");
        } else {
          setStatus("available");
        }
      })
      .catch(() => setStatus("available"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Вебхук Paddle может отстать на секунду-две — опрашиваем entitlement.
  async function pollEntitlement() {
    for (let i = 0; i < 8; i++) {
      try {
        const e = await getEntitlement();
        if (e.premium) {
          setUntil(e.until);
          setStatus("active");
          return;
        }
      } catch {
        /* ignore */
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  async function startCheckout() {
    setCheckoutFailed(false);
    setPaying(true);
    pushEvent("subscribe_click", {
      grade: loadLastGrade(),
      plan: selected.key,
      price: selected.key === "annual" ? 15.99 : 1.99,
      currency: "USD",
      source: "subscribe_page",
    });
    try {
      await openPaddleCheckout({
        priceId: selected.priceId,
        userId: userId ?? undefined,
        email: email ?? undefined,
        locale,
        onComplete: () => pollEntitlement(),
      });
    } catch {
      setCheckoutFailed(true);
    }
    setPaying(false);
  }

  const primaryBtn =
    "flex w-full items-center justify-center gap-2 rounded-full bg-[#6d5cf7] px-6 py-4 text-center text-lg font-extrabold text-white shadow-[0_0_0_3px_#e6c079] transition hover:-translate-y-0.5 active:scale-[.99] disabled:cursor-wait disabled:opacity-60 disabled:hover:translate-y-0";

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[#191539] p-8 font-sans text-white shadow-[0_30px_60px_rgba(25,21,57,.3)]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#6d5cf7] opacity-45 blur-[60px]" />

      {/* Бейдж + переключатель тарифа + цена */}
      <div className="relative">
        <span className="inline-block rounded-full bg-[#e6c079] px-3 py-1 text-[13px] font-extrabold text-[#191539]">
          ⭐ {labels.planName}
        </span>

        <div className="mt-4 grid grid-cols-2 gap-1 rounded-2xl bg-white/[.08] p-1">
          {PADDLE_PLANS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => setPlan(p.key)}
              className={
                "rounded-xl py-2.5 text-sm font-extrabold transition " +
                (plan === p.key ? "bg-white text-[#191539]" : "text-[#d9d5f5]")
              }
            >
              {p.key === "monthly" ? t("Месяц", "Ай") : t("Год", "Жыл")}
              {p.save && <span className="ml-1 text-[#c9a04f]">{p.save}</span>}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-5xl font-bold tracking-tight text-[#e6c079]">
            {selected.price}
          </span>
          <span className="text-lg text-[#d9d5f5]">
            / {selected.per[locale === "ky" ? "ky" : "ru"]}
          </span>
        </div>
      </div>

      {/* Действие */}
      <div className="relative mt-7">
        {status === "loading" && (
          <div className="h-14 w-full animate-pulse rounded-full bg-white/10" />
        )}

        {status === "guest" && (
          <Link href={loginHref} className={primaryBtn}>
            {labels.ctaLogin}
          </Link>
        )}

        {status === "available" && (
          <>
            <button onClick={startCheckout} disabled={paying} className={primaryBtn}>
              {paying
                ? t("Открываем оплату…", "Төлөм ачылууда…")
                : t("Оформить подписку", "Жазылууну тариздөө")}
            </button>
            <a
              href={ADMIN_TG}
              target="_blank"
              rel="noopener"
              onClick={() =>
                pushEvent("subscribe_click", {
                  plan: selected.key,
                  source: "subscribe_admin_fallback",
                })
              }
              className="mt-3 block text-center text-sm font-semibold text-[#b9b3e6] transition hover:text-white"
            >
              {checkoutFailed
                ? t(
                    "Оплата недоступна — напишите администратору",
                    "Төлөм жеткиликсиз — администраторго жазыңыз",
                  )
                : t(
                    "Не получается оплатить? Напишите администратору",
                    "Төлөй албай жатасызбы? Администраторго жазыңыз",
                  )}
            </a>
          </>
        )}

        {status === "active" && (
          <div className="rounded-2xl bg-[#e6c079] px-6 py-4 text-center font-bold text-[#191539]">
            ⭐ {labels.activeTitle}
            <div className="mt-0.5 text-sm font-semibold">
              {labels.activeUntil.replace("{date}", fmtDate(until, locale))}
            </div>
          </div>
        )}
      </div>

      <p className="relative mt-5 text-center text-sm text-[#b9b3e6]">
        {labels.note}
      </p>
    </div>
  );
}
