import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tests } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
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
    title: `${dict.tests.title} — Bilimjol`,
    description: dict.tests.subtitle,
    alternates: localizedAlternates(lang, "/tests"),
  };
}

export default async function TestsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          {dict.tests.title}
        </h1>
        <p className="mt-3 text-lg text-[#5c5880]">{dict.tests.subtitle}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {tests.map((t) => (
            <Link
              key={t.id}
              href={`/${lang}/tests/${t.id}`}
              className="flex items-center gap-4 rounded-[26px] bg-white p-5 shadow-[0_8px_24px_rgba(25,21,57,.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(25,21,57,.1)]"
            >
              <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[20px] bg-[#efecff] text-3xl">
                {t.icon}
              </span>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-bold">{t.title[lang]}</h2>
                <p className="mt-1 text-sm text-[#5c5880]">{t.description[lang]}</p>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
