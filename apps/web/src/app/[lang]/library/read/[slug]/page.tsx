import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { localizedAlternates, breadcrumbJsonLd } from "@/lib/seo";
import { readerWorks, getReaderWork } from "@/lib/library-reader";
import { getDictionary } from "../../../dictionaries";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bilimjol.com";

export function generateStaticParams() {
  return readerWorks.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const work = getReaderWork(slug);
  if (!isLocale(lang) || !work) return {};
  const ky = lang === "ky";
  return {
    title: ky
      ? `${work.title} — ${work.author}: онлайн окуу | Bilimjol`
      : `${work.title} — ${work.author}: читать онлайн | Bilimjol`,
    description: ky
      ? `${work.title} (${work.author}) — толук текстти онлайн акысыз окуңуз. ${work.summary.ky}`
      : `${work.title} (${work.author}) — читать полный текст онлайн бесплатно. ${work.summary.ru}`,
    alternates: localizedAlternates(lang, `/library/read/${slug}`),
  };
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const work = getReaderWork(slug);
  if (!work) notFound();
  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);
  const ext = { target: "_blank", rel: "noopener noreferrer" as const };

  // Строфы/абзацы разделены пустой строкой; строки — переносом.
  const blocks = work.body.split("\n\n").map((b) => b.split("\n"));

  const creativeWorkJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: work.title,
    author: { "@type": "Person", name: work.author },
    inLanguage: "ru",
    isAccessibleForFree: true,
    isFamilyFriendly: true,
    ...(work.year ? { datePublished: work.year } : {}),
    license: "https://creativecommons.org/publicdomain/mark/1.0/",
    url: `${SITE}/${lang}/library/read/${slug}`,
    publisher: { "@type": "EducationalOrganization", "@id": `${SITE}/#org`, name: "Bilimjol" },
  };

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <JsonLd
        data={breadcrumbJsonLd(lang, [
          [t("Библиотека", "Китепкана"), "/library"],
          [work.title, `/library/read/${slug}`],
        ])}
      />
      <JsonLd data={creativeWorkJsonLd} />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <Breadcrumbs
          lang={lang}
          items={[
            [t("Библиотека", "Китепкана"), "/library"],
            [work.title, `/library/read/${slug}`],
          ]}
        />

        <article className="mt-4">
          <header className="text-center">
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              {work.title}
            </h1>
            <p className="mt-3 text-lg text-[#5c5880]">
              {work.author}
              {work.year ? <span className="text-[#8f8aa8]">{` · ${work.year}`}</span> : null}
            </p>
            <p className="mx-auto mt-3 max-w-lg text-[#8f8aa8]">{work.summary[lang]}</p>
          </header>

          <div className="mt-8 rounded-[26px] bg-white p-7 shadow-[0_8px_24px_rgba(25,21,57,.06)] sm:p-9">
            <div
              className={
                work.kind === "poem"
                  ? "flex flex-col gap-5 font-serif text-[18px] leading-[1.7] text-[#2a2550]"
                  : "flex flex-col gap-4 font-serif text-[18px] leading-[1.8] text-[#2a2550]"
              }
            >
              {blocks.map((block, bi) =>
                work.kind === "poem" ? (
                  <p key={bi} className="whitespace-pre-line">
                    {block.join("\n")}
                  </p>
                ) : (
                  <p key={bi}>{block.join(" ")}</p>
                ),
              )}
            </div>
          </div>

          <p className="mt-5 text-center text-sm text-[#8f8aa8]">
            {t(
              "Текст в общественном достоянии. Источник: ",
              "Текст коомдук менчикте. Булагы: ",
            )}
            <a href={work.sourceUrl} {...ext} className="text-[#6d5cf7] hover:underline">
              {t("Викитека ↗", "Викитека ↗")}
            </a>
          </p>
        </article>

        <div className="mt-10 rounded-[28px] bg-[#6d5cf7] p-7 text-center text-white">
          <h2 className="font-display text-2xl font-extrabold">
            {t("Учиться — на Bilimjol", "Окуу — Bilimjol'до")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-white/85">
            {t(
              "Прочитали — а закрепить помогут задания с разбором по классам 0–11.",
              "Окудуңуз — бекемдөөгө 0–11-класс боюнча түшүндүрмөлүү тапшырмалар жардам берет.",
            )}
          </p>
          <Link
            href={`/${lang}/play`}
            className="mt-5 inline-flex rounded-full bg-white px-7 py-3 font-display font-bold text-[#6d5cf7] transition hover:scale-105"
          >
            {t("Начать бесплатно →", "Акысыз баштоо →")}
          </Link>
        </div>

        <p className="mt-6 text-center">
          <Link href={`/${lang}/library`} className="font-bold text-[#6d5cf7] hover:underline">
            {t("← Вся библиотека", "← Бардык китепкана")}
          </Link>
        </p>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
