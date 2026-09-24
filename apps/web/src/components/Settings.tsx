"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Locale } from "@izn-study/shared";
import { getEntitlement, isLoggedIn, loadAuth, logout } from "@/lib/api";
import { isMuted, toggleMuted, playSound } from "@/lib/sound";

function fmtDate(iso: string | null, locale: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale === "ky" ? "ky-KG" : "ru-RU", {
    day: "numeric",
    month: "long",
  });
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onClick}
      className={
        "relative h-7 w-12 flex-none rounded-full transition " +
        (on ? "bg-[#6d5cf7]" : "bg-[#dcd8ee]")
      }
    >
      <span
        className={
          "absolute top-[3px] h-[22px] w-[22px] rounded-full bg-white shadow transition-all " +
          (on ? "left-[23px]" : "left-[3px]")
        }
      />
    </button>
  );
}

const card = "rounded-[24px] bg-white p-6 shadow-[0_8px_24px_rgba(25,21,57,.06)]";
const rowTitle = "mb-3 font-display text-lg font-bold";

export function Settings({
  locale,
  loginHref,
  playHref,
  subscribeHref,
}: {
  locale: Locale;
  loginHref: string;
  playHref: string;
  subscribeHref: string;
}) {
  const t = (ru: string, ky: string) => (locale === "ky" ? ky : ru);

  const [loaded, setLoaded] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [premiumUntil, setPremiumUntil] = useState<string | null>(null);
  const [muted, setMutedState] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const auth = loadAuth();
    setEmail(auth?.user.email ?? null);
    setMutedState(isMuted());
    setDark(document.documentElement.classList.contains("dark"));
    setLoaded(true);
    if (isLoggedIn()) {
      getEntitlement()
        .then((e) => setPremiumUntil(e.premium ? e.until : null))
        .catch(() => undefined);
    }
  }, []);

  function toggleSound() {
    const nextMuted = toggleMuted();
    setMutedState(nextMuted);
    if (!nextMuted) playSound("click");
  }

  function toggleTheme() {
    const el = document.documentElement;
    const next = !el.classList.contains("dark");
    el.classList.toggle("dark", next);
    document.cookie = `izn-theme=${next ? "dark" : "light"}; path=/; max-age=31536000; samesite=lax`;
    setDark(next);
  }

  async function onLogout() {
    await logout().catch(() => undefined);
    window.location.href = loginHref;
  }

  if (!loaded) {
    return <div className="h-64 w-full animate-pulse rounded-[24px] bg-white shadow-[0_8px_24px_rgba(25,21,57,.06)]" />;
  }

  const langActive = "rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-[#191539] shadow-[0_2px_8px_rgba(25,21,57,.08)]";
  const langIdle = "rounded-full px-3 py-1.5 text-sm font-extrabold text-[#5c5880]";

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-4 font-sans text-[#191539] md:grid-cols-2">
      {/* Аккаунт */}
      <div className={card}>
        <h3 className={rowTitle}>{t("Аккаунт родителя", "Ата-эне аккаунту")}</h3>
        {email ? (
          <div className="divide-y divide-black/[.06]">
            <div className="flex items-center justify-between gap-3 py-3 text-[15px]">
              <span className="font-bold text-[#5c5880]">Email</span>
              <span className="truncate font-extrabold">{email}</span>
            </div>
            <div className="flex items-center justify-between gap-3 py-3 text-[15px]">
              <span className="font-bold text-[#5c5880]">{t("Подписка", "Жазылуу")}</span>
              {premiumUntil ? (
                <span className="rounded-full bg-[#e6c079] px-3 py-1 text-xs font-extrabold text-[#191539]">
                  ⭐ {t("до", "чейин")} {fmtDate(premiumUntil, locale)}
                </span>
              ) : (
                <Link href={subscribeHref} className="font-extrabold text-[#6d5cf7]">
                  {t("Оформить", "Тариздөө")}
                </Link>
              )}
            </div>
            <div className="pt-3">
              <button onClick={onLogout} className="text-sm font-extrabold text-[#b42318]">
                {t("Выйти", "Чыгуу")}
              </button>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <p className="text-[15px] text-[#5c5880]">
              {t(
                "Войдите, чтобы сохранять прогресс на всех устройствах.",
                "Прогрессти бардык түзмөктө сактоо үчүн кириңиз.",
              )}
            </p>
            <Link
              href={loginHref}
              className="mt-4 inline-block rounded-full bg-[#6d5cf7] px-6 py-3 font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5"
            >
              {t("Войти", "Кирүү")}
            </Link>
          </div>
        )}
      </div>

      {/* Настройки */}
      <div className={card}>
        <h3 className={rowTitle}>{t("Настройки", "Жөндөөлөр")}</h3>
        <div className="divide-y divide-black/[.06]">
          <div className="flex items-center justify-between gap-3 py-3">
            <span className="font-extrabold">🗣️ {t("Язык", "Тил")}</span>
            <div className="flex rounded-full bg-[#f1eefc] p-1">
              <Link href="/ru/settings" className={locale === "ru" ? langActive : langIdle}>
                Русский
              </Link>
              <Link href="/ky/settings" className={locale === "ky" ? langActive : langIdle}>
                Кыргызча
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 py-3">
            <span className="font-extrabold">🔊 {t("Звуки и озвучка", "Үн жана окуу")}</span>
            <Toggle on={!muted} onClick={toggleSound} />
          </div>
          <div className="flex items-center justify-between gap-3 py-3">
            <span className="font-extrabold">🌙 {t("Тёмная тема", "Караңгы тема")}</span>
            <Toggle on={dark} onClick={toggleTheme} />
          </div>
          <div className="flex items-center justify-between gap-3 py-3">
            <span className="font-extrabold">🦊 {t("Герой ребёнка", "Баланын каарманы")}</span>
            <Link href={playHref} className="text-sm font-extrabold text-[#6d5cf7]">
              {t("Сменить", "Алмаштыруу")}
            </Link>
          </div>
        </div>
      </div>

      {/* Данные и документы */}
      <div className={card + " md:col-span-2"}>
        <h3 className={rowTitle}>{t("Данные и документы", "Маалымат жана документтер")}</h3>
        <div className="divide-y divide-black/[.06]">
          <Link
            href={`/${locale}/privacy`}
            className="flex items-center justify-between py-3 font-extrabold transition hover:text-[#6d5cf7]"
          >
            <span>🔒 {t("Политика конфиденциальности", "Купуялык саясаты")}</span>
            <span className="text-[#5c5880]">›</span>
          </Link>
          <Link
            href={`/${locale}/terms`}
            className="flex items-center justify-between py-3 font-extrabold transition hover:text-[#6d5cf7]"
          >
            <span>📄 {t("Условия использования", "Колдонуу шарттары")}</span>
            <span className="text-[#5c5880]">›</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
