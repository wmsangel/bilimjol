"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@izn-study/shared";
import {
  getSubscription,
  getTransactions,
  cancelSubscription,
  startPaymentMethodUpdate,
  isLoggedIn,
  type SubscriptionInfo,
  type BillingTransaction,
} from "@/lib/api";
import { openPaddleTransaction, type PlanKey } from "@/lib/paddle";
import { resumeSubscriptionFlow } from "@/lib/resume";
import { sendGa4Event } from "@/lib/gtm";
import { PRICE, approxLocal } from "@/lib/pricing";

function fmtDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "ky" ? "ky-KG" : "ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Paddle отдаёт суммы в минимальных единицах валюты строкой («199» = 1.99).
function fmtAmount(amount: string | null, currency: string | null): string {
  if (!amount) return "—";
  const n = Number(amount);
  if (!Number.isFinite(n)) return amount;
  const value = (n / 100).toFixed(2);
  return currency ? `${value} ${currency}` : value;
}

const card = "rounded-[24px] bg-white p-6 shadow-[0_8px_24px_rgba(25,21,57,.06)]";

const PLAN_LABEL: Record<string, { ru: string; ky: string }> = {
  monthly: { ru: "Помесячная", ky: "Айлык" },
  annual: { ru: "Годовая", ky: "Жылдык" },
  admin: { ru: "Доступ администратора", ky: "Администратор мүмкүнчүлүгү" },
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
  const [txns, setTxns] = useState<BillingTransaction[]>([]);
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    return getSubscription()
      .then((s) => {
        setSub(s);
        if (s.managementEnabled) {
          getTransactions()
            .then((r) => setTxns(r.items))
            .catch(() => undefined);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    const logged = isLoggedIn();
    setAuthed(logged);
    if (logged) {
      load().finally(() => setLoaded(true));
    } else {
      setLoaded(true);
    }
  }, [load]);

  async function onCancel() {
    setBusy(true);
    setError(null);
    try {
      await cancelSubscription();
      setConfirmCancel(false);
      await load();
    } catch {
      setError(t("Не удалось отменить. Попробуйте позже.", "Жокко чыгаруу болбоду. Кийинчерээк аракет кылыңыз."));
    } finally {
      setBusy(false);
    }
  }

  // Возобновление отменённой подписки (доступ ещё действует). Сервер сам решает:
  // снять запланированную отмену (без платежа) или открыть новый чекаут.
  async function onResume(plan: PlanKey) {
    setBusy(true);
    setError(null);
    try {
      await resumeSubscriptionFlow({
        locale,
        plan,
        source: "billing",
        onActive: () => void load(),
        onCheckoutOpened: () => void load(),
      });
    } catch {
      setError(
        t(
          "Не удалось возобновить. Попробуйте позже или напишите нам.",
          "Калыбына келтирүү болбоду. Кийинчерээк аракет кылыңыз же бизге жазыңыз.",
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function onChangeCard() {
    setBusy(true);
    setError(null);
    try {
      const { transactionId } = await startPaymentMethodUpdate();
      await openPaddleTransaction({
        transactionId,
        locale,
        onComplete: () => void load(),
      });
    } catch {
      setError(t("Не удалось открыть смену карты.", "Картаны алмаштыруу ачылбады."));
    } finally {
      setBusy(false);
    }
  }

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
        <p className="mb-4 text-sm font-bold text-[#191539]">
          {PRICE.monthly.display} / {t("мес", "ай")}{" "}
          <span className="font-semibold text-[#8f8aa8]">({approxLocal("monthly")})</span>
          {" · "}
          {t("отмена в любой момент", "каалаган убакта токтотсо болот")}
        </p>
        <Link
          href={subscribeHref}
          onClick={() => sendGa4Event("cta_click", { placement: "subscription-renew", item: "no_subscription" })}
          className="inline-block rounded-full bg-[#6d5cf7] px-6 py-3 font-extrabold text-white transition hover:-translate-y-0.5"
        >
          {t("Оформить подписку", "Жазылууну тариздөө")}
        </Link>
      </div>
    );
  }

  const planLabel = PLAN_LABEL[sub.plan]?.[locale] ?? sub.plan;
  const end = sub.currentPeriodEnd ? fmtDate(sub.currentPeriodEnd, locale) : null;
  const canManage = sub.managementEnabled;
  const canCancel = canManage && sub.active && !sub.cancelAtPeriodEnd;
  const planKey: PlanKey = sub.plan === "annual" ? "annual" : "monthly";
  const priceLine =
    planKey === "annual"
      ? `${PRICE.annual.display} / ${t("год", "жыл")}`
      : `${PRICE.monthly.display} / ${t("мес", "ай")}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Статус + дата */}
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
              {!end
                ? t("Доступ", "Мүмкүнчүлүк")
                : sub.cancelAtPeriodEnd
                  ? t("Доступ до", "Жеткиликтүү")
                  : sub.active
                    ? t("Продлится", "Узартылат")
                    : t("Закончилась", "Аяктады")}
            </dt>
            <dd className="font-bold">
              {end ?? t("Бессрочно", "Мөөнөтсүз")}
            </dd>
          </div>
        </dl>

        {sub.cancelAtPeriodEnd && (
          <div className="mt-4 rounded-2xl bg-[#fbf3e3] px-4 py-4 text-sm text-[#7a5a1e]">
            <p className="font-bold">
              {end
                ? t(
                    `Подписка отменена и не продлится. Доступ — до ${end}`,
                    `Жазылуу жокко чыгарылды жана узартылбайт. Жеткиликтүүлүк — ${end} чейин.`,
                  )
                : t("Подписка отменена и не продлится.", "Жазылуу жокко чыгарылды жана узартылбайт.")}
            </p>
            <p className="mt-2">
              {t(
                "После этой даты закроются: все задания без блокировок, разбор каждого ответа, отчёт для родителя и бонусные игры.",
                "Бул күндөн кийин жабылат: бөгөтсүз бардык тапшырмалар, ар бир жооптун талдоосу, ата-эне отчёту жана бонус оюндар.",
              )}
            </p>
            {canManage && (
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onResume(planKey)}
                  className="rounded-full bg-[#6d5cf7] px-6 py-3 text-sm font-extrabold text-white shadow-[0_8px_22px_rgba(109,92,247,.3)] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
                >
                  {busy
                    ? t("Возобновляем…", "Калыбына келтирилүүдө…")
                    : t("Возобновить подписку", "Жазылууну калыбына келтирүү")}
                </button>
                <span className="font-bold text-[#191539]">
                  {priceLine}{" "}
                  <span className="font-semibold text-[#8f8aa8]">({approxLocal(planKey)})</span>
                </span>
              </div>
            )}
            <p className="mt-2 text-xs text-[#8a7340]">
              {t(
                "Если отмена ещё не вступила в силу — подписка просто продолжится, списание пройдёт в обычную дату. Иначе откроется оплата новой подписки.",
                "Эгер токтотуу али күчүнө кире элек болсо — жазылуу жөн эле улантылат, төлөм кадимки күнү алынат. Болбосо жаңы жазылуунун төлөмү ачылат.",
              )}
            </p>
          </div>
        )}

        {!sub.active && (
          <div className="mt-4 rounded-2xl bg-[#f7f5ff] px-4 py-4 text-sm text-[#5c5880]">
            <p className="font-bold text-[#191539]">
              {t("Подписка закончилась — премиум-задания закрыты.", "Жазылуу аяктады — премиум тапшырмалар жабык.")}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <Link
                href={subscribeHref}
                onClick={() => sendGa4Event("cta_click", { placement: "subscription-renew", item: "expired" })}
                className="rounded-full bg-[#6d5cf7] px-6 py-3 text-sm font-extrabold text-white transition hover:-translate-y-0.5"
              >
                {t("Оформить снова", "Кайра тариздөө")}
              </Link>
              <span className="font-bold text-[#191539]">
                {PRICE.monthly.display} / {t("мес", "ай")}{" "}
                <span className="font-semibold text-[#8f8aa8]">({approxLocal("monthly")})</span>
              </span>
            </div>
          </div>
        )}

        {error && (
          <p className="mt-4 rounded-2xl bg-[#fdeaea] px-4 py-3 text-sm text-[#a23b3b]">
            {error}
          </p>
        )}

        {/* Управление (только когда задан серверный Paddle-ключ) */}
        {canManage && (
          <div className="mt-5 flex flex-wrap gap-3">
            {/* Смена карты имеет смысл только у действующей подписки. */}
            {sub.active && <button
              type="button"
              disabled={busy}
              onClick={onChangeCard}
              className="rounded-full border-2 border-[#6d5cf7] px-5 py-2.5 text-sm font-extrabold text-[#6d5cf7] transition hover:bg-[#f1eefe] disabled:opacity-50"
            >
              {t("Сменить карту", "Картаны алмаштыруу")}
            </button>}
            {canCancel &&
              (confirmCancel ? (
                <span className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={onCancel}
                    className="rounded-full bg-[#c0392b] px-5 py-2.5 text-sm font-extrabold text-white transition hover:brightness-110 disabled:opacity-50"
                  >
                    {busy
                      ? t("Отмена…", "Жокко чыгаруу…")
                      : t("Точно отменить", "Чын жокко чыгаруу")}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => setConfirmCancel(false)}
                    className="rounded-full px-4 py-2.5 text-sm font-bold text-[#5c5880] hover:underline"
                  >
                    {t("Назад", "Артка")}
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setConfirmCancel(true)}
                  className="rounded-full px-5 py-2.5 text-sm font-extrabold text-[#a23b3b] transition hover:bg-[#fdeaea] disabled:opacity-50"
                >
                  {t("Отменить подписку", "Жазылууну жокко чыгаруу")}
                </button>
              ))}
          </div>
        )}
      </div>

      {/* История списаний */}
      {canManage && (
        <div className={card}>
          <div className="mb-4 font-display text-lg font-bold">
            {t("История списаний", "Төлөмдөр тарыхы")}
          </div>
          {txns.length === 0 ? (
            <p className="text-[#5c5880]">{t("Списаний пока нет.", "Азырынча төлөмдөр жок.")}</p>
          ) : (
            <ul className="divide-y divide-[#efecff] text-[15px]">
              {txns.map((tx) => (
                <li key={tx.id} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-[#5c5880]">
                    {tx.date ? fmtDate(tx.date, locale) : "—"}
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="font-bold">{fmtAmount(tx.amount, tx.currency)}</span>
                    <span className="rounded-full bg-[#f7f5ff] px-2.5 py-0.5 text-xs font-bold text-[#6d5cf7]">
                      {tx.status}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
