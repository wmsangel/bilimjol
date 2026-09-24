import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "../dictionaries";
import { SiteHeader } from "@/components/SiteHeader";
import { AccountForm } from "@/components/AccountForm";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const AVATARS: [string, string][] = [
  ["🦊", "#ffedd5"],
  ["🐱", "#fce7f3"],
  ["🐼", "#e2e8f0"],
];

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);

  const benefits = [
    t("Прогресс гостя перенесётся в аккаунт", "Коноктун прогресси аккаунтка өтөт"),
    t("Несколько детей в одном аккаунте", "Бир аккаунтта бир нече бала"),
    t("Отчёт для родителей", "Ата-энелер үчүн отчёт"),
  ];

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff] font-sans text-[#191539]">
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto grid w-full max-w-5xl flex-1 items-stretch gap-8 px-6 py-10 lg:grid-cols-2">
        {/* Левая маркетинговая панель */}
        <div className="relative hidden overflow-hidden rounded-[28px] bg-[#191539] p-10 text-white lg:flex lg:flex-col lg:justify-center">
          <div className="pointer-events-none absolute -right-24 top-40 h-[420px] w-[420px] rounded-full bg-[#6d5cf7] opacity-35 blur-[80px]" />
          <div className="relative mb-7 flex gap-2.5">
            {AVATARS.map(([emoji, bg]) => (
              <div
                key={emoji}
                className="flex h-[72px] w-[72px] items-center justify-center rounded-full text-[40px]"
                style={{ background: bg }}
              >
                {emoji}
              </div>
            ))}
          </div>
          <h1 className="relative font-display text-4xl font-bold leading-tight">
            {t("Сохраните прогресс ребёнка", "Баланын прогрессин сактаңыз")}
          </h1>
          <p className="relative mt-4 max-w-[400px] text-lg leading-relaxed text-[#d9d5f5]">
            {t(
              "Аккаунт создаёт родитель. Звёзды, награды и отчёт будут доступны на всех устройствах.",
              "Аккаунтту ата-эне түзөт. Жылдыздар, сыйлыктар жана отчёт бардык түзмөктөрдө жеткиликтүү болот.",
            )}
          </p>
          <div className="relative mt-7 flex flex-col gap-3 text-base font-bold">
            {benefits.map((b) => (
              <div key={b} className="flex gap-2.5">
                <span className="text-[#e6c079]">✓</span>
                {b}
              </div>
            ))}
          </div>
        </div>

        {/* Форма входа / регистрации */}
        <div className="flex flex-col items-center justify-center">
          <AccountForm locale={lang} labels={dict.auth} meHref={`/${lang}/me`} />
          <Link
            href={`/${lang}/play`}
            className="mt-5 text-center text-sm font-semibold text-[#5c5880] transition hover:text-[#191539]"
          >
            {t("Можно заниматься и без входа — ", "Кирбей эле окууга болот — ")}
            <span className="font-extrabold text-[#6d5cf7]">
              {t("продолжить как гость", "конок катары улантуу")}
            </span>
          </Link>
        </div>
      </main>
    </div>
  );
}
