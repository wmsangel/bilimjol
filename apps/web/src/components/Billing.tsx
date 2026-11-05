"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@izn-study/shared";
import { getSubscription, isLoggedIn, type SubscriptionInfo } from "@/lib/api";

function fmtDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "ky" ? "ky-KG" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

const card = "rounded-[24px] bg-white p-6 shadow-[0_8px_24px_rgba(25,21,57,.06)]";

const PLAN_LABEL: Record<string, { ru: string; ky: string }> = {
  monthly: { ru: "Помесячная", ky: "Айлык" },
  annual: { ru: "Годовая", ky: "Жылдык" },
};

export function Billing({
  locale,
  subscribeHref,
  loginHref,
}: {
  locale: Locale;
  subscribeHref: string;
  loginHref: string;
}) {
  const t = (ru: string, ky: string) => (locale === "ky" ? ky : ru);

  const [loaded, setLoaded] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [sub, setSub] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    const logged = isLoggedIn();
    setAuthed(logged);
    if (logged) {
      getSubscription()
        .then((s) => setSub(s))
        .catch(() => undefined)
        .finally(() => setLoaded(true));
    } else {
      setLoaded(true);
    }
  }, []);

  if (!loaded) {
    return <div className={card}>{t("Загрузка…", "Жүктөлүүдө…")}</div>;
  }

  if (!authed) {
    return (
      <div className={card}>
        <p className="mb-3 text-[#5c5880]">
          {t("Войдите, чтобы увидеть подписку.", "Жазылууну көрүү үчүн кириңиз.")}
        </p>
        <Link href={loginHref} className="font-extrabold text-[#6d5cf7] hover:underline">
          {t("Войти", "Кирүү")}
        </Link>
      </div>
    );
  }

  if (!sub || sub.hasSubscription === false) {
    return (
      <div className={card}>
        <div className="mb-1 font-display text-lg font-bold">
          {t("Подписка не оформлена", "Жазылуу жок")}
        </div>
        <p className="mb-4 text-[#5c5880]">
          {t(
            "Премиум открывает все задания, тесты и отчёт для родителя.",
            "Премиум бардык тапшырмаларды, тесттерди жана ата-эне отчётун ачат.",
          )}
        </p>
        <Link
          href={subscribeHref}
          className="inline-block rounded-full bg-[#6d5cf7] px-6 py-3 font-extrabold text-white transition hover:-translate-y-0.5"
        >
          {t("Оформить подписку", "Жазылууну тариздөө")}
        </Link>
      </div>
    );
  }

  const planLabel = PLAN_LABEL[sub.plan]?.[locale] ?? sub.plan;
  const end = fmtDate(sub.currentPeriodEnd, locale);

  return (
    <div className={card}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <div className="font-display text-lg font-bold">
          {t("Ваша подписка", "Сиздин жазылууңуз")}
        </div>
        <span
          className={
            "rounded-full px-3 py-1 text-xs font-extrabold " +
            (sub.active
              ? "bg-[#e7f6ec] text-[#1b7a42]"
              : "bg-[#f3eef0] text-[#8a6d74]")
          }
        >
          {sub.active
            ? sub.cancelAtPeriodEnd
              ? t("Отменена", "Жокко чыгарылган")
              : t("Активна", "Активдүү")
            : t("Неактивна", "Активдүү эмес")}
        </span>
      </div>

      <dl className="divide-y divide-[#efecff] text-[15px]">
        <div className="flex items-center justify-between py-3">
          <dt className="text-[#5c5880]">{t("Тариф", "Тариф")}</dt>
          <dd className="font-bold">{planLabel}</dd>
        </div>
        <div className="flex items-center justify-between py-3">
          <dt className="text-[#5c5880]">
            {sub.cancelAtPeriodEnd
              ? t("Доступ до", "Жеткиликтүү")
              : sub.active
                ? t("Продлится", "Узартылат")
                : t("Закончилась", "Аяктады")}
          </dt>
          <dd className="font-bold">{end}</dd>
        </div>
      </dl>

      {sub.cancelAtPeriodEnd && (
        <p className="mt-4 rounded-2xl bg-[#fbf3e3] px-4 py-3 text-sm text-[#7a5a1e]">
          {t(
            "Подписка отменена и не продлится. Доступ сохранится до конца оплаченного периода.",
            "Жазылуу жокко чыгарылды жана узартылбайт. Жеткиликтүүлүк төлөнгөн мөөнөттүн аягына чейин сакталат.",
          )}
        </p>
      )}
    </div>
  );
}
