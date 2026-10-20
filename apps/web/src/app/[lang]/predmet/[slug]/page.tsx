import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getSubjectLanding,
  getTasks,
  subjectLandings,
  tests,
  type Subject,
} from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { SubjectOpenTracker, ClassOpenLink } from "@/components/OpenTracker";
import { localizedAlternates, faqJsonLd, courseJsonLd } from "@/lib/seo";
import { getDictionary } from "../../dictionaries";

type Copy = {
  emoji: string;
  lead: { ru: string; ky: string };
  /** Относящийся тест (id из tests), если есть. */
  testId?: string;
};

// Короткое, честное описание того, что внутри предмета. Грейд подставляется.
const SUBJECT_COPY: Partial<Record<Subject, Copy>> = {
  geography: {
    emoji: "🗺️",
    lead: {
      ru: "Материки и океаны, карта и компас, страны, реки и природные зоны — с разбором каждого ответа.",
      ky: "Материктер жана океандар, карта жана компас, өлкөлөр, дарыялар жана табигый аймактар — ар бир жоопко түшүндүрмө менен.",
    },
    testId: "kyrgyzstan",
  },
  biology: {
    emoji: "🧬",
    lead: {
      ru: "Организм человека, органы и системы, живая природа — задания с понятным разбором.",
      ky: "Адамдын организми, органдар жана системалар, жандуу жаратылыш — түшүнүктүү талдоо менен тапшырмалар.",
    },
  },
  physics: {
    emoji: "⚛️",
    lead: {
      ru: "Вещество и его состояния, сила и движение, электричество, свет, Солнечная система — с разбором каждого ответа.",
      ky: "Зат жана анын абалдары, күч жана кыймыл, электр, жарык, Күн системасы — ар бир жоопко түшүндүрмө менен.",
    },
  },
  chemistry: {
    emoji: "🧪",
    lead: {
      ru: "Вещества и их обозначения, атомы и молекулы, простые реакции — задания с понятным разбором.",
      ky: "Заттар жана алардын белгилери, атомдор жана молекулалар, жөнөкөй реакциялар — түшүнүктүү талдоо менен тапшырмалар.",
    },
  },
};

export function generateStaticParams() {
  return subjectLandings.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const landing = getSubjectLanding(slug);
  if (!isLocale(lang) || !landing) return {};
  const name = landing.title[lang];
  const klass = lang === "ky" ? `${landing.grade}-класс` : `${landing.grade} класс`;
  return {
    title:
      lang === "ky"
        ? `${name} ${klass}: онлайн тапшырмалар акысыз | Bilimjol`
        : `${name} ${klass}: задания онлайн бесплатно | Bilimjol`,
    description:
      lang === "ky"
        ? `${name} боюнча ${klass} тапшырмаларын онлайн, акысыз иштеңиз — ар бир жоопко түшүндүрмө менен. Орусча жана кыргызча.`
        : `Задания по предмету «${name}» за ${klass} — онлайн и бесплатно, с объяснением каждого ответа. На русском и кыргызском.`,
    alternates: localizedAlternates(lang, `/predmet/${slug}`),
  };
}

export default async function SubjectLandingPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const landing = getSubjectLanding(slug);
  if (!landing) notFound();
  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);

  const copy = SUBJECT_COPY[landing.subject];
  const name = landing.title[lang];
  const grade = landing.grade;
  const klass = t(`${grade} класс`, `${grade}-класс`);
  const taskCount = getTasks({ subject: landing.subject, grade: landing.grade }).length;

  const siblings = subjectLandings.filter(
    (l) => l.subject === landing.subject && l.slug !== slug,
  );
  const relatedTest = copy?.testId
    ? tests.find((x) => x.id === copy.testId)
    : undefined;

  const faq = [
    {
      q: t(
        `«${name}», ${klass} — можно заниматься онлайн бесплатно?`,
        `«${name}», ${klass} — онлайн акысыз иштесе болобу?`,
      ),
      a: t(
        "Да. Задания доступны бесплатно и без регистрации — выбирайте и решайте прямо в браузере. К каждому ответу есть объяснение.",
        "Ооба. Тапшырмалар акысыз жана катталуусуз жеткиликтүү — браузерде эле тандап иштеңиз. Ар бир жоопко түшүндүрмө бар.",
      ),
    },
    {
      q: t("Есть ли объяснения к заданиям?", "Тапшырмаларга түшүндүрмө барбы?"),
      a: t(
        "Да. После ответа показывается разбор — как прийти к решению, а не только правильный вариант.",
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

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <SubjectOpenTracker grade={grade} subject={landing.subject} lang={lang} />
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd
        data={courseJsonLd(lang, {
          name: `${name} — ${klass}`,
          description: copy?.lead[lang] ?? `${name}, ${klass}`,
          path: `/predmet/${slug}`,
          level: klass,
        })}
      />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <Breadcrumbs
          lang={lang}
          items={[
            [t("Классы", "Класстар"), "/class"],
            [t(`${grade} класс`, `${grade}-класс`), `/class/${grade}`],
            [name, `/predmet/${slug}`],
          ]}
        />

        <div className="mb-8 text-center">
          <div className="text-6xl" aria-hidden="true">{copy?.emoji ?? "📘"}</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            {name} {grade === 0 ? "" : klass}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#5c5880]">
            {copy?.lead[lang] ?? `${name}, ${klass}`}
          </p>
          <ClassOpenLink
            href={`/${lang}/class/${grade}`}
            placement="landing"
            className="mt-6 inline-flex rounded-full bg-[#6d5cf7] px-8 py-4 text-lg font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5"
          >
            {t("Начать бесплатно", "Акысыз баштоо")}
          </ClassOpenLink>
          {taskCount > 0 && (
            <p className="mt-3 text-sm font-bold text-[#8f8aa8]">
              {taskCount}{" "}
              {t(
                taskCount % 10 === 1 && taskCount % 100 !== 11
                  ? "задание с разбором"
                  : "заданий с разбором",
                "тапшырма — түшүндүрмө менен",
              )}
            </p>
          )}
        </div>

        <section className="mt-10 rounded-[26px] bg-white p-6 shadow-[0_8px_24px_rgba(25,21,57,.06)]">
          <h2 className="font-display text-xl font-bold">
            {t(`Что в предмете «${name}» за ${klass}`, `«${name}» (${klass}) эмнелерди камтыйт`)}
          </h2>
          <p className="mt-2 text-[#5c5880]">
            {copy?.lead[lang] ?? `${name}, ${klass}`}
          </p>
          <p className="mt-3 text-[#5c5880]">
            {t(
              `Задания входят в общую программу за ${klass} — открываются на странице класса вместе с математикой, логикой и чтением.`,
              `Тапшырмалар ${klass} жалпы программасына кирет — класс барагында математика, логика жана окуу менен бирге ачылат.`,
            )}
          </p>
          <ClassOpenLink
            href={`/${lang}/class/${grade}`}
            placement="landing"
            className="mt-4 inline-flex font-bold text-[#6d5cf7] hover:underline"
          >
            {t(`Программа за ${klass} →`, `${klass} программасы →`)}
          </ClassOpenLink>
        </section>

        {siblings.length > 0 && (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold">
              {t(`${name} — другие классы`, `${name} — башка класстар`)}
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {siblings.map((s) => (
                <Link key={s.slug} href={`/${lang}/predmet/${s.slug}`} className={cardLink}>
                  <span className="flex-none text-2xl">{copy?.emoji ?? "📘"}</span>
                  <span className="min-w-0 truncate text-sm font-bold">
                    {s.title[lang]} {t(`${s.grade} класс`, `${s.grade}-класс`)}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {relatedTest && (
          <section className="mt-10">
            <h2 className="font-display text-2xl font-bold">
              {t("Проверь себя", "Өзүңдү текшер")}
            </h2>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Link href={`/${lang}/tests/${relatedTest.id}`} className={cardLink}>
                <span className="flex-none text-2xl">{relatedTest.icon}</span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold">{relatedTest.title[lang]}</span>
                  <span className="block truncate text-xs text-[#8f8aa8]">{relatedTest.description[lang]}</span>
                </span>
              </Link>
            </div>
          </section>
        )}

        <Faq title={t("Частые вопросы", "Көп берилүүчү суроолор")} items={faq} />
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
