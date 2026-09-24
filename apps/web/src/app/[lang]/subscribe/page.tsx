import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";
import { SubscribePlans } from "@/components/SubscribePlans";
import { getDictionary } from "../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: `${dict.subscribe.title} — Bilimjol`,
    description: dict.subscribe.subtitle,
    alternates: localizedAlternates(lang, "/subscribe"),
  };
}

export default async function SubscribePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const s = dict.subscribe;

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff] font-sans text-[#191539]">
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <div className="grid items-start gap-10 lg:grid-cols-[1fr_420px]">
          {/* Левая колонка: описание + выгоды */}
          <div>
            <span className="inline-block rounded-full bg-[#fbf3e3] px-3.5 py-1.5 text-sm font-extrabold text-[#7a5a1e]">
              ⭐ Premium
            </span>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              {s.title}
            </h1>
            <p className="mt-3 max-w-xl text-lg leading-relaxed text-[#5c5880]">
              {s.subtitle}
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {s.benefits.map((b) => (
                <div
                  key={b}
                  className="flex items-start gap-3 rounded-[20px] bg-white p-4 text-[15px] font-bold shadow-[0_8px_24px_rgba(25,21,57,.05)]"
                >
                  <span className="font-extrabold text-[#6d5cf7]">✓</span>
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Правая колонка: тарифная карточка */}
          <div className="lg:sticky lg:top-6">
            <SubscribePlans
              labels={s}
              locale={lang}
              loginHref={`/${lang}/login`}
              playHref={`/${lang}/play`}
            />
            <div className="mt-6 text-center">
              <Link
                href={`/${lang}`}
                className="text-sm font-extrabold text-[#5c5880] transition hover:text-[#191539]"
              >
                {s.back}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
