import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { localizedAlternates, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import {
  LIBRARY_SOURCES,
  KITEP_GRADES,
  KITEP_BASE,
  kitepGradeUrl,
  SUMMER_READING,
} from "@/lib/library";
import { getDictionary } from "../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const ky = lang === "ky";
  return {
    title: ky
      ? "Виртуалдык китепкана: акысыз окуу китептери жана китептер | Bilimjol"
      : "Виртуальная библиотека: бесплатные учебники и книги | Bilimjol",
    description: ky
      ? "Кыргызстандын мектеп окуу китептери 1–11-класс — акысыз, расмий булактан. Жана «жайга» китептер тизмеси. Орусча жана кыргызча."
      : "Школьные учебники Кыргызстана 1–11 класс — бесплатно, из официального источника. И списки книг «на лето». На русском и кыргызском.",
    alternates: localizedAlternates(lang, "/library"),
  };
}

export default async function LibraryPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);
  const ext = { target: "_blank", rel: "noopener noreferrer" as const };

  const faq = [
    {
      q: t("Учебники правда бесплатные?", "Окуу китептери чын эле акысызбы?"),
      a: t(
        "Да. Мы ссылаемся на официальную электронную библиотеку Министерства просвещения Кыргызстана (kitep.edu.kg) — там все школьные учебники доступны бесплатно, на кыргызском, русском и узбекском.",
        "Ооба. Биз Кыргызстандын Агартуу министрлигинин расмий электрондук китепканасына (kitep.edu.kg) шилтейбиз — ал жерде бардык мектеп окуу китептери акысыз, кыргызча, орусча жана өзбекче жеткиликтүү.",
      ),
    },
    {
      q: t("Как читать учебник?", "Окуу китебин кантип окуу керек?"),
      a: t(
        "Выберите класс — откроется страница официального источника со всеми предметами этого класса. Там можно читать онлайн бесплатно.",
        "Класты тандаңыз — ошол класстын бардык предметтери менен расмий булактын барагы ачылат. Ал жерде онлайн акысыз окууга болот.",
      ),
    },
    {
      q: t("А книги «на лето» — где брать?", "«Жайга» китептерди кайдан алам?"),
      a: t(
        "В разделе ниже — списки классики по возрастам. Все эти книги в общественном достоянии, их можно читать бесплатно на Викитеке по ссылке.",
        "Төмөнкү бөлүмдө — жаш курагы боюнча классика тизмелери. Бул китептердин баары коомдук менчикте, Викитекада шилтеме боюнча акысыз окууга болот.",
      ),
    },
  ];

  const kg = LIBRARY_SOURCES[0];
  const cardLink =
    "flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-[0_6px_18px_rgba(25,21,57,.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(25,21,57,.1)]";

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <JsonLd data={breadcrumbJsonLd(lang, [[t("Библиотека", "Китепкана"), "/library"]])} />
      <JsonLd data={faqJsonLd(faq)} />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <Breadcrumbs lang={lang} items={[[t("Библиотека", "Китепкана"), "/library"]]} />

        <div className="mb-8 text-center">
          <div className="text-6xl" aria-hidden="true">📚</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            {t("Виртуальная библиотека", "Виртуалдык китепкана")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#5c5880]">
            {t(
              "Бесплатные школьные учебники и книги в одном месте — из официальных и открытых источников.",
              "Акысыз мектеп окуу китептери жана китептер бир жерде — расмий жана ачык булактардан.",
            )}
          </p>
        </div>

        {/* Учебники */}
        <section className="mt-6">
          <h2 className="font-display text-2xl font-bold">
            {t("Учебники по классам", "Окуу китептери класстар боюнча")}
          </h2>
          <div className="mt-4 flex items-start gap-3 rounded-[22px] bg-white p-5 shadow-[0_8px_24px_rgba(25,21,57,.06)]">
            <span className="text-3xl" aria-hidden="true">{kg.flag}</span>
            <div className="min-w-0">
              <div className="font-display text-lg font-bold">
                {t("Кыргызстан", "Кыргызстан")} ·{" "}
                <a href={kg.url} {...ext} className="text-[#6d5cf7] hover:underline">{kg.name}</a>
              </div>
              <p className="mt-1 text-sm text-[#5c5880]">{kg.note[lang]}</p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {KITEP_GRADES.map((g) => (
              <a key={g.grade} href={kitepGradeUrl(g.grade)} {...ext} className={cardLink}>
                <span className="font-display text-base font-bold">
                  {t(`${g.grade} класс`, `${g.grade}-класс`)}
                </span>
                <span className="text-sm font-extrabold text-[#8f8aa8]">
                  {g.subjects} {t("предм.", "предмет")} ↗
                </span>
              </a>
            ))}
          </div>
          <p className="mt-3 text-sm text-[#8f8aa8]">
            {t(
              "Ссылки ведут на официальный источник — чтение бесплатно, на кыргызском, русском и узбекском.",
              "Шилтемелер расмий булакка алып барат — окуу акысыз, кыргызча, орусча жана өзбекче.",
            )}
          </p>
        </section>

        {/* На лето */}
        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">
            {t("Книги на лето", "Жайга китептер")}
          </h2>
          <p className="mt-2 text-[#5c5880]">
            {t(
              "Классика по возрастам — вся в общественном достоянии, читается бесплатно.",
              "Жаш курагы боюнча классика — баары коомдук менчикте, акысыз окулат.",
            )}
          </p>
          <div className="mt-5 flex flex-col gap-5">
            {SUMMER_READING.map((group) => (
              <div key={group.id} className="rounded-[22px] bg-white p-5 shadow-[0_8px_24px_rgba(25,21,57,.06)]">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="font-display text-xl font-bold">{group.label[lang]}</h3>
                  <span className="whitespace-nowrap text-sm font-extrabold text-[#8f8aa8]">
                    {group.ages} {t("лет", "жаш")}
                  </span>
                </div>
                <ul className="mt-3 flex flex-col gap-3">
                  {group.books.map((b) => (
                    <li key={b.title + b.author}>
                      <a href={b.href} {...ext} className="font-bold text-[#6d5cf7] hover:underline">
                        {b.title}
                      </a>
                      <span className="text-sm text-[#8f8aa8]"> · {b.author} ↗</span>
                      <p className="text-sm text-[#5c5880]">{b.note[lang]}</p>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 rounded-[28px] bg-[#6d5cf7] p-7 text-center text-white">
          <h2 className="font-display text-2xl font-extrabold">
            {t("Учиться — на Bilimjol", "Окуу — Bilimjol'до")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-white/85">
            {t(
              "Читаете учебник — а закрепить тему помогут задания с разбором по классам 0–11.",
              "Окуу китебин окуйсуз — теманы 0–11-класс боюнча түшүндүрмөлүү тапшырмалар бекемдейт.",
            )}
          </p>
          <Link
            href={`/${lang}/play`}
            className="mt-5 inline-flex rounded-full bg-white px-7 py-3 font-display font-bold text-[#6d5cf7] transition hover:scale-105"
          >
            {t("Начать бесплатно →", "Акысыз баштоо →")}
          </Link>
        </div>

        <Faq title={t("Частые вопросы", "Көп берилүүчү суроолор")} items={faq} />

        <p className="mt-8 text-center text-xs text-[#8f8aa8]">
          {t(
            "Bilimjol не хранит учебники у себя — мы даём ссылки на официальные бесплатные источники. Книги «на лето» — в общественном достоянии.",
            "Bilimjol окуу китептерин өзүндө сактабайт — биз расмий акысыз булактарга шилтейбиз. «Жайга» китептер — коомдук менчикте.",
          )}
        </p>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
