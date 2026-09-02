"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getEntitlement, isLoggedIn, loadAuth } from "@/lib/api";
import {
  countryForLocale,
  formatPrice,
  priceForCountry,
} from "@/lib/pricing";
import { pushEvent, currencyIso } from "@/lib/gtm";
import { loadLastGrade } from "@/lib/prefs";

// Контакт администратора (пока оплата картой не подключена). Переопределяется env.
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
  const [priceText, setPriceText] = useState(() =>
    formatPrice(priceForCountry(countryForLocale(locale))),
  );
  // Страна для события клика (цена/валюта) — уточняется в useEffect по профилю.
  const [country, setCountry] = useState(() => countryForLocale(locale));

  useEffect(() => {
    const auth = loadAuth();
    setEmail(auth?.user.email ?? null);
    const c = auth?.user.country ?? countryForLocale(locale);
    setCountry(c);
    setPriceText(formatPrice(priceForCountry(c)));

    // Событие просмотра страницы подписки (SPA — шлём вручную).
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
  }, []);

  const primaryBtn =
    "flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-center text-lg font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[.99]";

  return (
    <div className="rounded-[2rem] border border-black/[.06] bg-white p-8 shadow-xl dark:border-white/10 dark:bg-zinc-900">
      {/* Цена / план */}
      <div className="flex items-baseline gap-2">
        <span className="font-display text-5xl font-extrabold tracking-tight">
          {priceText}
        </span>
        <span className="text-lg text-zinc-500 dark:text-zinc-400">
          {labels.period}
        </span>
      </div>
      <p className="mt-1 font-semibold text-zinc-600 dark:text-zinc-400">
        {labels.planName}
      </p>

      {/* Что входит */}
      <ul className="mt-6 space-y-3">
        {labels.benefits.map((b) => (
          <li key={b} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              ✓
            </span>
            <span className="text-zinc-700 dark:text-zinc-300">{b}</span>
          </li>
        ))}
      </ul>

      {/* Действие */}
      <div className="mt-8">
        {status === "loading" && (
          <div className="h-14 w-full animate-pulse rounded-full bg-black/[.05] dark:bg-white/10" />
        )}

        {status === "guest" && (
          <Link
            href={loginHref}
            className={primaryBtn + " bg-gradient-to-r from-amber-400 to-orange-500 shadow-orange-500/30"}
          >
            {labels.ctaLogin}
          </Link>
        )}

        {status === "available" && (
          <>
            <a
              href={ADMIN_TG}
              target="_blank"
              rel="noopener"
              onClick={() =>
                pushEvent("subscribe_click", {
                  grade: loadLastGrade(),
                  plan: "premium",
                  price: priceForCountry(country).amount,
                  currency: currencyIso(country),
                  source: "subscribe_page",
                })
              }
              className={primaryBtn + " bg-gradient-to-r from-sky-400 to-indigo-500 shadow-indigo-500/30"}
            >
              ✈️ {labels.cta}
            </a>
            {email && (
              <p className="mt-3 text-center text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                {labels.emailHint.replace("{email}", email)}
              </p>
            )}
          </>
        )}

        {status === "active" && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-400 px-6 py-4 text-center font-bold text-amber-900">
            ⭐ {labels.activeTitle}
            <div className="mt-0.5 text-sm font-semibold">
              {labels.activeUntil.replace("{date}", fmtDate(until, locale))}
            </div>
          </div>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {labels.note}
      </p>
    </div>
  );
}
