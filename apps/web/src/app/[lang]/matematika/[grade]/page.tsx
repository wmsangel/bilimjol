import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GRADES,
  getTasks,
  getTopics,
  tests,
  type Grade,
} from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { ClassOpenLink } from "@/components/OpenTracker";
import { localizedAlternates, faqJsonLd, courseJsonLd } from "@/lib/seo";
import { getDictionary } from "../../dictionaries";

// Тренажёры-примеры, которые показываем на лендинге (не привязаны к классу).
const MATH_TESTS = ["mult-table", "add", "sub", "division", "squares", "compare"];

function toGrade(raw: string): Grade | null {
  const n = Number(raw);
  return Number.isInteger(n) && (GRADES as readonly number[]).includes(n)
    ? (n as Grade)
    : null;
}

export function generateStaticParams() {
  return GRADES.map((g) => ({ grade: String(g) }));
}

const klassOf = (g: number, ru: boolean) =>
  g === 0 ? (ru ? "подготовка к школе" : "мектепке даярдык") : ru ? `${g} класс` : `${g}-класс`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; grade: string }>;
}): Promise<Metadata> {
  const { lang, grade } = await params;
  const g = toGrade(grade);
  if (!isLocale(lang) || g === null) return {};
  const ru = lang !== "ky";
  const klass = klassOf(g, ru);
  const title =
    g === 0
      ? ru
        ? "Математика для подготовки к школе — онлайн, бесплатно | Bilimjol"
        : "Мектепке даярдык математикасы — онлайн, акысыз | Bilimjol"
      : ru
        ? `Решение задач по математике ${klass} — онлайн, бесплатно | Bilimjol`
        : `${klass} математика: маселелерди онлайн чыгаруу — акысыз | Bilimjol`;
  const klassZa = g === 0 && ru ? "подготовку к школе" : klass; // винительный после «за»
  const description = ru
    ? `Решайте задачи и примеры по математике за ${klassZa} онлайн и бесплатно — с объяснением каждого ответа. Без регистрации, на русском и кыргызском.`
    : `${klass} математикадан маселелерди жана мисалдарды онлайн, акысыз чыгарыңыз — ар бир жоопко түшүндүрмө менен. Катталуусуз, орусча жана кыргызча.`;
  return { title, description, alternates: localizedAlternates(lang, `/matematika/${g}`) };
}

export default async function MathGradePage({
  params,
}: {
  params: Promise<{ lang: string; grade: string }>;
}) {
  const { lang, grade } = await params;
  if (!isLocale(lang)) notFound();
  const g = toGrade(grade);
  if (g === null) notFound();
  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);
  const ru = lang !== "ky";
  const klass = klassOf(g, ru);
  const klassZa = g === 0 && ru ? "подготовку к школе" : klass; // винительный после «за»

  // Темы и число заданий по математике за этот класс.
  const topics = getTopics({ subject: "math", grade: g });
  // getTasks игнорирует grade===0, поэтому фильтруем вручную.
  const taskCount = getTasks({ subject: "math" }).filter((x) => x.grade === g).length;
  const topicNames = topics.map((x) => x.title[lang]);

  const mathTests = MATH_TESTS.map((id) => tests.find((x) => x.id === id)).filter(
    (x): x is NonNullable<typeof x> => Boolean(x),
  );
  const otherGrades = GRADES.filter((x) => x !== g);

  const plural = (n: number, one: string, few: string) =>
    n % 10 === 1 && n % 100 !== 11 ? one : few;

  const faq = [
    {
      q: t(
        `Можно ли решать задачи по математике за ${klassZa} онлайн бесплатно?`,
        `${klass} математикадан маселелерди онлайн акысыз чыгарса болобу?`,
      ),
      a: t(
        "Да. Задания и примеры доступны бесплатно и без регистрации — выбирайте тему и решайте прямо в браузере. К каждому ответу есть объяснение.",
        "Ооба. Тапшырмалар жана мисалдар акысыз жана катталуусуз жеткиликтүү — теманы тандап, браузерде эле чыгарыңыз. Ар бир жоопко түшүндүрмө бар.",
      ),
    },
    topicNames.length > 0
      ? {
          q: t(`Какие темы по математике — ${klass}?`, `${klass} математикада кайсы темалар бар?`),
          a: t(
            `${topicNames.join(", ")} — задания по каждой теме с разбором.`,
            `${topicNames.join(", ")} — ар бир тема боюнча түшүндүрмөлүү тапшырмалар.`,
          ),
        }
      : {
          q: t("Есть ли объяснения к задачам?", "Маселелерге түшүндүрмө барбы?"),
          a: t(
            "Да. После ответа показывается разбор — как прийти к решению, а не только правильный ответ.",
            "Ооба. Жооптон кийин талдоо көрүнөт — туура жоопту гана эмес, чечимге кантип жетүүнү.",
          ),
        },
    {
      q: t("Нужна ли регистрация?", "Катталуу керекпи?"),
      a: t(
        "Нет, начать можно без аккаунта. Регистрация нужна только для сохранения прогресса и занятий на нескольких устройствах.",
        "Жок, аккаунтсуз баштаса болот. Катталуу прогрессти сактоо жана бир нече түзмөктө иштөө үчүн гана керек.",
      ),
    },
  ];

  const cardLink =
    "flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(25,21,57,.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(25,21,57,.1)]";

  const h1 =
    g === 0
      ? t("Математика для подготовки к школе", "Мектепке даярдык математикасы")
      : t(`Математика за ${klassZa}`, `${klass} математика`);

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd
        data={courseJsonLd(lang, {
          name: `${t("Математика", "Математика")} — ${klass}`,
          description: t(
            `Задачи и примеры по математике за ${klassZa} с объяснением.`,
            `${klass} математикадан маселелер жана мисалдар түшүндүрмө менен.`,
          ),
          path: `/matematika/${g}`,
          level: klass,
        })}
      />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <Breadcrumbs
          lang={lang}
          items={[
            [t("Математика", "Математика"), "/matematika"],
            [klass, `/matematika/${g}`],
          ]}
        />

        <div className="mb-8 text-center">
          <div className="text-6xl" aria-hidden="true">🔢</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">{h1}</h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#5c5880]">
            {t(
              `Решайте задачи и примеры по математике за ${klassZa} онлайн и бесплатно — с объяснением каждого ответа.`,
              `${klass} математикадан маселелерди жана мисалдарды онлайн, акысыз чыгарыңыз — ар бир жоопко түшүндүрмө менен.`,
            )}
          </p>
          <ClassOpenLink
            href={`/${lang}/class/${g}`}
            placement="landing"
            className="mt-6 inline-flex rounded-full bg-[#6d5cf7] px-8 py-4 text-lg font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5"
          >
            {t("Начать бесплатно", "Акысыз баштоо")}
          </ClassOpenLink>
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

        {g >= 7 && (
          <p className="mb-8 text-center">
            <Link
              href={`/${lang}/algebra/${g}`}
              className="inline-flex rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#6d5cf7] shadow-[0_6px_18px_rgba(25,21,57,.06)] hover:underline"
            >
              {t(`Готовитесь по алгебре? Алгебра ${g} класс →`, `Алгебрага даярданасызбы? ${klass} алгебра →`)}
            </Link>
          </p>
        )}

        {topicNames.length > 0 && (
          <section className="mt-6 rounded-[26px] bg-white p-6 shadow-[0_8px_24px_rgba(25,21,57,.06)]">
            <h2 className="font-display text-xl font-bold">
              {t(`Темы по математике за ${klassZa}`, `${klass} математика темалары`)}
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
            <ClassOpenLink
              href={`/${lang}/class/${g}`}
              placement="landing"
              className="mt-4 inline-flex font-bold text-[#6d5cf7] hover:underline"
            >
              {t(`Все задания за ${klassZa} →`, `${klass} бардык тапшырмалар →`)}
            </ClassOpenLink>
          </section>
        )}

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">
            {t("Тренажёры: примеры по математике", "Тренажёрлор: математикадан мисалдар")}
          </h2>
          <p className="mt-2 text-[#5c5880]">
            {t(
              "Примеры вразброс на скорость — к каждому запуску новые.",
              "Ылдамдыкка аралаш мисалдар — ар бир жолу жаңы.",
            )}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {mathTests.map((test) => (
              <Link key={test.id} href={`/${lang}/tests/${test.id}`} className={cardLink}>
                <span className="flex-none text-2xl">{test.icon}</span>
                <span className="min-w-0 truncate text-sm font-bold">{test.title[lang]}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">
            {t("Математика — другие классы", "Математика — башка класстар")}
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {otherGrades.map((og) => (
              <Link
                key={og}
                href={`/${lang}/matematika/${og}`}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-[0_6px_18px_rgba(25,21,57,.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(25,21,57,.1)]"
              >
                <span className="font-display text-sm font-bold">
                  {t("Математика", "Математика")} {og === 0 ? "" : og}
                </span>
                <span className="text-xs font-extrabold text-[#8f8aa8]">
                  {klassOf(og, ru)}
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
