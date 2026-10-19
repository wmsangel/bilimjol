import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTasks, getTopics, type Grade } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { localizedAlternates, faqJsonLd, courseJsonLd } from "@/lib/seo";
import { getDictionary } from "../../dictionaries";

// Алгебра идёт с 7 класса. Берём алгебраические темы математики (без геометрии).
const ALG_GRADES = [7, 8, 9, 10, 11] as const;

function toAlgGrade(raw: string): Grade | null {
  const n = Number(raw);
  return (ALG_GRADES as readonly number[]).includes(n) ? (n as Grade) : null;
}

// Алгебра-темы класса = математика без геометрии (у геом-тем id содержит "geo").
function algebraTopics(g: Grade) {
  return getTopics({ subject: "math", grade: g }).filter((t) => !t.id.includes("geo"));
}

export function generateStaticParams() {
  return ALG_GRADES.map((g) => ({ grade: String(g) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; grade: string }>;
}): Promise<Metadata> {
  const { lang, grade } = await params;
  const g = toAlgGrade(grade);
  if (!isLocale(lang) || g === null) return {};
  const ky = lang === "ky";
  return {
    title: ky
      ? `${g}-класс алгебра: онлайн тапшырмалар — акысыз | Bilimjol`
      : `Алгебра ${g} класс: задания онлайн, с разбором — бесплатно | Bilimjol`,
    description: ky
      ? `${g}-класс алгебрадан тапшырмаларды онлайн, акысыз иштеңиз — даражалар, теңдемелер, тамырлар, ар бир жоопко түшүндүрмө менен. Катталуусуз, кыргызча жана орусча.`
      : `Онлайн-подготовка по алгебре за ${g} класс бесплатно — степени, уравнения, корни, с объяснением каждого ответа. Без регистрации, на русском и кыргызском.`,
    alternates: localizedAlternates(lang, `/algebra/${g}`),
  };
}

export default async function AlgebraGradePage({
  params,
}: {
  params: Promise<{ lang: string; grade: string }>;
}) {
  const { lang, grade } = await params;
  if (!isLocale(lang)) notFound();
  const g = toAlgGrade(grade);
  if (g === null) notFound();
  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);
  const klass = t(`${g} класс`, `${g}-класс`);

  const topics = algebraTopics(g);
  const topicIds = new Set(topics.map((x) => x.id));
  const topicNames = topics.map((x) => x.title[lang]);
  const taskCount = getTasks({ subject: "math" }).filter(
    (x) => x.grade === g && topicIds.has(x.topic),
  ).length;

  const otherGrades = ALG_GRADES.filter((x) => x !== g);

  const plural = (n: number, one: string, few: string) =>
    n % 10 === 1 && n % 100 !== 11 ? one : few;

  const faq = [
    {
      q: t(
        `Можно ли готовиться по алгебре за ${klass} онлайн бесплатно?`,
        `${klass} алгебрадан онлайн акысыз даярдансам болобу?`,
      ),
      a: t(
        "Да. Задания по алгебре доступны бесплатно и без регистрации — решайте прямо в браузере, к каждому ответу есть разбор.",
        "Ооба. Алгебрадан тапшырмалар акысыз жана катталуусуз — браузерде эле иштеңиз, ар бир жоопко талдоо бар.",
      ),
    },
    topicNames.length > 0
      ? {
          q: t(`Какие темы по алгебре — ${klass}?`, `${klass} алгебрада кайсы темалар бар?`),
          a: t(
            `${topicNames.join(", ")} — задания по каждой теме с объяснением.`,
            `${topicNames.join(", ")} — ар бир тема боюнча түшүндүрмөлүү тапшырмалар.`,
          ),
        }
      : {
          q: t("Есть ли объяснения к заданиям?", "Тапшырмаларга түшүндүрмө барбы?"),
          a: t(
            "Да. После ответа показывается разбор — как прийти к решению.",
            "Ооба. Жооптон кийин талдоо көрүнөт — чечимге кантип жетүүнү.",
          ),
        },
    {
      q: t("Чем алгебра отличается от общей математики?", "Алгебра жалпы математикадан эмнеси менен айырмаланат?"),
      a: t(
        "С 7 класса математика делится на алгебру (степени, уравнения, корни, прогрессии) и геометрию (фигуры, площади). Здесь собрана алгебраическая часть; геометрия — в общем разделе математики по классу.",
        "7-класстан математика алгебрага (даражалар, теңдемелер, тамырлар, прогрессиялар) жана геометрияга (фигуралар, аянттар) бөлүнөт. Бул жерде алгебра бөлүгү; геометрия — класс боюнча жалпы математика бөлүмүндө.",
      ),
    },
  ];

  const cardLink =
    "flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-[0_6px_18px_rgba(25,21,57,.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(25,21,57,.1)]";

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd
        data={courseJsonLd(lang, {
          name: `${t("Алгебра", "Алгебра")} — ${klass}`,
          description: t(
            `Задания по алгебре за ${klass}: степени, уравнения, корни — с объяснением.`,
            `${klass} алгебрадан тапшырмалар: даражалар, теңдемелер, тамырлар — түшүндүрмө менен.`,
          ),
          path: `/algebra/${g}`,
          level: klass,
        })}
      />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <Breadcrumbs
          lang={lang}
          items={[
            [t("Математика", "Математика"), "/matematika"],
            [t(`Алгебра ${g} класс`, `${klass} алгебра`), `/algebra/${g}`],
          ]}
        />

        <div className="mb-8 text-center">
          <div className="text-6xl" aria-hidden="true">🟰</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            {t(`Алгебра ${g} класс`, `${klass} алгебра`)}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#5c5880]">
            {t(
              `Онлайн-подготовка по алгебре за ${klass}: степени, уравнения, корни — с объяснением каждого ответа. Бесплатно.`,
              `${klass} алгебрадан онлайн даярдык: даражалар, теңдемелер, тамырлар — ар бир жоопко түшүндүрмө менен. Акысыз.`,
            )}
          </p>
          <Link
            href={`/${lang}/matematika/${g}`}
            className="mt-6 inline-flex rounded-full bg-[#6d5cf7] px-8 py-4 text-lg font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5"
          >
            {t("Начать бесплатно", "Акысыз баштоо")}
          </Link>
          {taskCount > 0 && (
            <p className="mt-3 text-sm font-bold text-[#8f8aa8]">
              {taskCount}{" "}
              {t(
                plural(taskCount, "задание с разбором", "заданий с разбором"),
                "тапшырма — түшүндүрмө менен",
              )}
            </p>
          )}
        </div>

        {topicNames.length > 0 && (
          <section className="rounded-[26px] bg-white p-6 shadow-[0_8px_24px_rgba(25,21,57,.06)]">
            <h2 className="font-display text-xl font-bold">
              {t(`Темы по алгебре — ${klass}`, `${klass} алгебра темалары`)}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {topicNames.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-[#f1eefe] px-3.5 py-1.5 text-sm font-bold text-[#6d5cf7]"
                >
                  {name}
                </span>
              ))}
            </div>
            <Link
              href={`/${lang}/matematika/${g}`}
              className="mt-4 inline-flex font-bold text-[#6d5cf7] hover:underline"
            >
              {t(`Вся математика за ${klass} →`, `${klass} бардык математика →`)}
            </Link>
          </section>
        )}

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">
            {t("Алгебра — другие классы", "Алгебра — башка класстар")}
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {otherGrades.map((og) => (
              <Link key={og} href={`/${lang}/algebra/${og}`} className={cardLink}>
                <span className="font-display text-sm font-bold">
                  {t("Алгебра", "Алгебра")} {og}
                </span>
                <span className="text-xs font-extrabold text-[#8f8aa8]">
                  {t(`${og} кл.`, `${og}-кл.`)}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <Faq title={t("Частые вопросы", "Көп берилүүчү суроолор")} items={faq} />
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
