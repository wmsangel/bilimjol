"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { checkout, getEntitlement, isLoggedIn, loadAuth } from "@/lib/api";
import {
  countryForLocale,
  formatPrice,
  priceForCountry,
} from "@/lib/pricing";

export interface SubscribeLabels {
  benefits: string[];
  planName: string;
  period: string;
  cta: string;
  ctaLogin: string;
  processing: string;
  activeTitle: string;
  activeUntil: string;
  successTitle: string;
  successText: string;
  goPlay: string;
  note: string;
  error: string;
}

type Status = "loading" | "guest" | "available" | "active" | "success";

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
  playHref,
}: {
  labels: SubscribeLabels;
  locale: string;
  loginHref: string;
  playHref: string;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [until, setUntil] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  // Начальная цена — по языку (детерминированно для SSR); уточняем в effect.
  const [priceText, setPriceText] = useState(() =>
    formatPrice(priceForCountry(countryForLocale(locale))),
  );

  useEffect(() => {
    const auth = loadAuth();
    const country = auth?.user.country ?? countryForLocale(locale);
    setPriceText(formatPrice(priceForCountry(country)));

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

  async function onSubscribe() {
    setBusy(true);
    setError(false);
    try {
      const r = await checkout();
      if (r.premium) {
        setUntil(r.until);
        setStatus("success");
      } else if (r.redirectUrl) {
        window.location.href = r.redirectUrl;
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  }

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
            className="block w-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-4 text-center text-lg font-bold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110 active:scale-[.99]"
          >
            {labels.ctaLogin}
          </Link>
        )}

        {status === "available" && (
          <button
            onClick={onSubscribe}
            disabled={busy}
            className="block w-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-4 text-center text-lg font-bold text-white shadow-lg shadow-orange-500/30 transition hover:brightness-110 active:scale-[.99] disabled:opacity-50"
          >
            {busy ? labels.processing : labels.cta}
          </button>
        )}

        {status === "active" && (
          <div className="rounded-2xl bg-gradient-to-r from-amber-300 to-yellow-400 px-6 py-4 text-center font-bold text-amber-900">
            ⭐ {labels.activeTitle}
            <div className="mt-0.5 text-sm font-semibold">
              {labels.activeUntil.replace("{date}", fmtDate(until, locale))}
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-5 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
            <p className="font-display text-xl font-bold text-emerald-700 dark:text-emerald-300">
              {labels.successTitle}
            </p>
            <p className="mt-1 text-sm text-emerald-700/80 dark:text-emerald-300/80">
              {labels.successText}
            </p>
            <Link
              href={playHref}
              className="mt-4 inline-block rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 font-bold text-white shadow-md transition hover:brightness-110"
            >
              {labels.goPlay}
            </Link>
          </div>
        )}

        {error && (
          <p className="mt-3 text-center text-sm font-semibold text-red-600 dark:text-red-400">
            {labels.error}
          </p>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-zinc-500 dark:text-zinc-400">
        {labels.note}
      </p>
    </div>
  );
}
