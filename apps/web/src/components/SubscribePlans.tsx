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
    "flex w-full items-center justify-center gap-2 rounded-full bg-[#6d5cf7] px-6 py-4 text-center text-lg font-extrabold text-white shadow-[0_0_0_3px_#e6c079] transition hover:-translate-y-0.5 active:scale-[.99]";

  return (
    <div className="relative overflow-hidden rounded-[32px] bg-[#191539] p-8 font-sans text-white shadow-[0_30px_60px_rgba(25,21,57,.3)]">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#6d5cf7] opacity-45 blur-[60px]" />

      {/* Цена / план */}
      <div className="relative">
        <span className="inline-block rounded-full bg-[#e6c079] px-3 py-1 text-[13px] font-extrabold text-[#191539]">
          ⭐ {labels.planName}
        </span>
        <div className="mt-4 flex items-baseline gap-2">
          <span className="font-display text-5xl font-bold tracking-tight text-[#e6c079]">
            {priceText}
          </span>
          <span className="text-lg text-[#d9d5f5]">{labels.period}</span>
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
              className={primaryBtn}
            >
              ✈️ {labels.cta}
            </a>
            {email && (
              <p className="mt-3 text-center text-sm font-semibold text-[#b9b3e6]">
                {labels.emailHint.replace("{email}", email)}
              </p>
            )}
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
