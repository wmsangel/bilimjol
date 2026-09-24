import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  tasks,
  GRADES,
  subjectsForGrade,
  getTopics,
  subjectLabels,
  type Grade,
  type Subject,
} from "@izn-study/shared";
import { isLocale, type Locale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { localizedAlternates, breadcrumbJsonLd } from "@/lib/seo";
import { pluralRu } from "@/lib/plural";
import { getDictionary } from "../../dictionaries";

const SUBJECT_ICON: Record<Subject, string> = {
  logic: "🧩",
  math: "🔢",
  reading: "📖",
  world: "🌍",
  olympiad: "🏆",
};

const SUBJECT_BLURB: Record<Subject, { ru: string; ky: string }> = {
  logic: { ru: "Найди лишнее, продолжи ряд, сравни — тренируем мышление.", ky: "Ашыгын тап, катарды улант, салыштыр — ой жүгүртүүнү машыктырабыз." },
  math: { ru: "Счёт, примеры и задачи по программе класса.", ky: "Класстын программасы боюнча эсеп, мисалдар жана маселелер." },
  reading: { ru: "Буквы, слова, грамотность и работа с текстом.", ky: "Тамгалар, сөздөр, сабаттуулук жана текст менен иштөө." },
  world: { ru: "Природа, наука и как устроен мир вокруг.", ky: "Жаратылыш, илим жана айланадагы дүйнө кандай түзүлгөн." },
  olympiad: { ru: "Задачи на смекалку посложнее — для тех, кто любит думать.", ky: "Татаалыраак тапшырмалар — ойлонгонду сүйгөндөр үчүн." },
};

const parseGrade = (raw: string): Grade | null => {
  const n = Number(raw);
  return Number.isInteger(n) && (GRADES as number[]).includes(n) ? (n as Grade) : null;
};

export function generateStaticParams() {
  return GRADES.map((g) => ({ grade: String(g) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; grade: string }>;
}): Promise<Metadata> {
  const { lang, grade } = await params;
  const g = parseGrade(grade);
  if (!isLocale(lang) || g === null) return {};
  const dict = await getDictionary(lang);
  const name = dict.grades[String(g) as keyof typeof dict.grades];
  const title =
    lang === "ky"
      ? `${name} — онлайн тапшырмалар | Bilimjol`
      : `${name} — задания онлайн | Bilimjol`;
  const description =
    lang === "ky"
      ? `${name} үчүн акысыз өнүктүрүүчү тапшырмалар: логика, эсеп, окуу жана айлана-чөйрө. Сүрөт жана үн менен, кыргызча жана орусча.`
      : `${name}: бесплатные развивающие задания — логика, счёт, чтение и окружающий мир. С картинками и озвучкой, на русском и кыргызском.`;
  return {
    title,
    description,
    alternates: localizedAlternates(lang, `/class/${g}`),
  };
}

export default async function ClassLandingPage({
  params,
}: {
  params: Promise<{ lang: string; grade: string }>;
}) {
  const { lang, grade } = await params;
  if (!isLocale(lang)) notFound();
  const g = parseGrade(grade);
  if (g === null) notFound();
  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);

  const name = dict.grades[String(g) as keyof typeof dict.grades];
  const subjects = subjectsForGrade(g);
  const totalTasks = tasks.filter((task) => task.grade === g).length;

  const classesLabel = t("Классы", "Класстар");

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <JsonLd
        data={breadcrumbJsonLd(lang as Locale, [
          [classesLabel, "/class"],
          [name, `/class/${g}`],
        ])}
      />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <Link
          href={`/${lang}/class`}
          className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          ← {classesLabel}
        </Link>

        {/* Hero */}
        <section className="mt-4 text-center">
          <div className="text-6xl">{g === 0 ? "🎒" : "🏫"}</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            {name}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            {t(
              `Бесплатные развивающие задания для «${name}» на Bilimjol: короткие упражнения с картинками и озвучкой, на русском и кыргызском. Всего в этом классе — ${totalTasks} ${pluralRu(totalTasks, "задание", "задания", "заданий")}.`,
              `«${name}» үчүн Bilimjolдогу акысыз өнүктүрүүчү тапшырмалар: сүрөт жана үн менен кыска көнүгүүлөр, кыргызча жана орусча. Бул класста бардыгы — ${totalTasks} тапшырма.`,
            )}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/${lang}/play`}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3.5 text-lg font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
            >
              ▶ {t("Начать заниматься", "Машыгууну баштоо")}
            </Link>
            {g === 0 && (
              <Link
                href={`/${lang}/gotovnost-k-shkole`}
                className="rounded-full border-2 border-indigo-200 bg-white px-8 py-3.5 text-lg font-bold text-indigo-600 transition hover:border-indigo-400 dark:border-white/15 dark:bg-zinc-900 dark:text-indigo-300"
              >
                🎒 {t("Тест готовности к школе", "Мектепке даярдык тести")}
              </Link>
            )}
          </div>
        </section>

        {/* Предметы класса */}
        <section className="mt-14">
          <h2 className="text-center font-display text-2xl font-extrabold">
            {t("Что осваивают в этом классе", "Бул класста эмнени өздөштүрөт")}
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {subjects.map((s) => {
              const topicCount = getTopics({ grade: g, subject: s }).length;
              const taskCount = tasks.filter(
                (task) => task.grade === g && task.subject === s,
              ).length;
              return (
                <div
                  key={s}
                  className="flex gap-4 rounded-3xl border border-black/[.06] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900"
                >
                  <div className="text-3xl">{SUBJECT_ICON[s]}</div>
                  <div>
                    <h3 className="font-display text-lg font-bold">
                      {subjectLabels[s][lang]}
                    </h3>
                    <p className="mt-1 leading-7 text-zinc-600 dark:text-zinc-400">
                      {SUBJECT_BLURB[s][lang]}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-zinc-400">
                      {t(
                        `${topicCount} ${pluralRu(topicCount, "тема", "темы", "тем")} · ${taskCount} ${pluralRu(taskCount, "задание", "задания", "заданий")}`,
                        `${topicCount} тема · ${taskCount} тапшырма`,
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA */}
        <section className="mt-14 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-600 px-6 py-10 text-center text-white shadow-xl">
          <p className="font-display text-2xl font-extrabold">
            {t(
              `Начните заниматься по программе «${name}»`,
              `«${name}» программасы боюнча машыгууну баштаңыз`,
            )}
          </p>
          <p className="mx-auto mt-2 max-w-xl text-white/85">
            {t(
              "Первые задания — бесплатно и без регистрации. Выберите класс на экране и вперёд.",
              "Биринчи тапшырмалар — акысыз жана катталуусуз. Экрандан классты тандап, алдыга.",
            )}
          </p>
          <Link
            href={`/${lang}/play`}
            className="mt-6 inline-block rounded-full bg-white px-8 py-3.5 text-lg font-bold text-indigo-600 shadow-lg transition hover:brightness-95"
          >
            {t("Начать бесплатно", "Акысыз баштоо")}
          </Link>
        </section>

        {/* Другие классы */}
        <section className="mt-12">
          <h2 className="mb-4 font-display text-lg font-bold text-zinc-500 dark:text-zinc-400">
            {t("Другие классы", "Башка класстар")}
          </h2>
          <div className="flex flex-wrap gap-2">
            {GRADES.filter((x) => x !== g).map((x) => (
              <Link
                key={x}
                href={`/${lang}/class/${x}`}
                className="rounded-full border border-black/[.06] bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
              >
                {dict.grades[String(x) as keyof typeof dict.grades]}
              </Link>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
