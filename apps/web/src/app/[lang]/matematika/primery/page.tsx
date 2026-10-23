import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tests } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { localizedAlternates, breadcrumbJsonLd, faqJsonLd, itemListJsonLd } from "@/lib/seo";
import { GAME_META } from "@/lib/classGames";
import { getDictionary } from "../../dictionaries";

// Посадочная «примеры онлайн» — таргет GSC: «решать примеры онлайн»,
// «онлайн примеры по математике». Собрана вокруг игры «Быстрый счёт» (sprint)
// и тренажёров-примеров (новые при каждом запуске).
const EXAMPLE_TESTS = ["add", "sub", "mult-table", "division", "squares", "compare", "mixed"];

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
      ? "Математикадан мисалдарды онлайн чыгаруу — акысыз | Bilimjol"
      : "Решать примеры по математике онлайн бесплатно | Bilimjol",
    description: ky
      ? "Математикадан мисалдарды онлайн, акысыз чыгарыңыз: кошуу, кемитүү, көбөйтүү, бөлүү — ылдамдык тренажёрлору жана «Ылдам эсеп» оюну. Катталуусуз, орусча жана кыргызча."
      : "Решайте примеры по математике онлайн и бесплатно: сложение, вычитание, умножение, деление — тренажёры на скорость и игра «Быстрый счёт». Без регистрации, на русском и кыргызском.",
    alternates: localizedAlternates(lang, "/matematika/primery"),
  };
}

export default async function MathExamplesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);

  const sprint = GAME_META["sprint"];
  const exampleTests = EXAMPLE_TESTS.map((id) => tests.find((x) => x.id === id)).filter(
    (x): x is NonNullable<typeof x> => Boolean(x),
  );

  const faq = [
    {
      q: t(
        "Можно ли решать примеры по математике онлайн бесплатно?",
        "Математикадан мисалдарды онлайн акысыз чыгарса болобу?",
      ),
      a: t(
        "Да. Примеры и тренажёры доступны бесплатно и без регистрации — решайте прямо в браузере. Примеры каждый раз новые, а после ответа сразу виден разбор.",
        "Ооба. Мисалдар жана тренажёрлор акысыз жана катталуусуз жеткиликтүү — браузерде эле чыгарыңыз. Мисалдар ар жолу жаңы, жооптон кийин талдоо дароо көрүнөт.",
      ),
    },
    {
      q: t("Какие примеры можно порешать?", "Кандай мисалдарды чыгарса болот?"),
      a: t(
        "Сложение, вычитание, умножение (таблица умножения), деление, квадраты чисел, сравнение и примеры вразброс на скорость. Сложность подстраивается под уровень.",
        "Кошуу, кемитүү, көбөйтүү (көбөйтүү таблицасы), бөлүү, сандардын квадраттары, салыштыруу жана ылдамдыкка аралаш мисалдар. Татаалдык деңгээлге ылайыкташат.",
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
      <JsonLd
        data={breadcrumbJsonLd(lang, [
          [t("Математика", "Математика"), "/matematika"],
          [t("Примеры", "Мисалдар"), "/matematika/primery"],
        ])}
      />
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd
        data={itemListJsonLd(
          lang,
          exampleTests.map((x) => [x.title[lang], `/tests/${x.id}`] as [string, string]),
        )}
      />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <Breadcrumbs
          lang={lang}
          items={[
            [t("Математика", "Математика"), "/matematika"],
            [t("Примеры", "Мисалдар"), "/matematika/primery"],
          ]}
        />

        <div className="mb-8 text-center">
          <div className="text-6xl" aria-hidden="true">➗</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            {t("Решать примеры по математике онлайн бесплатно", "Математикадан мисалдарды онлайн чыгаруу")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#5c5880]">
            {t(
              "Сложение, вычитание, умножение и деление — примеры вразброс на скорость, новые к каждому запуску. Бесплатно, без регистрации, на русском и кыргызском.",
              "Кошуу, кемитүү, көбөйтүү жана бөлүү — ылдамдыкка аралаш мисалдар, ар бир жолу жаңы. Акысыз, катталуусуз, орусча жана кыргызча.",
            )}
          </p>
          <Link
            href={`/${lang}${sprint.slug}`}
            className="mt-6 inline-flex rounded-full bg-[#6d5cf7] px-8 py-4 text-lg font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5"
          >
            {t("Решать примеры на скорость →", "Ылдамдыкка мисалдарды чыгаруу →")}
          </Link>
          <p className="mt-3 text-sm font-bold text-[#8f8aa8]">
            {t("Игра «Быстрый счёт» — сколько примеров решишь за 60 секунд", "«Ылдам эсеп» оюну — 60 секундда канча мисал чыгарасың")}
          </p>
        </div>

        <section className="mt-6">
          <h2 className="font-display text-2xl font-bold">
            {t("Тренажёры: примеры по действиям", "Тренажёрлор: амалдар боюнча мисалдар")}
          </h2>
          <p className="mt-2 text-[#5c5880]">
            {t(
              "Выберите действие и решайте примеры онлайн — к каждому запуску новые.",
              "Амалды тандап, мисалдарды онлайн чыгарыңыз — ар бир жолу жаңы.",
            )}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {exampleTests.map((test) => (
              <Link key={test.id} href={`/${lang}/tests/${test.id}`} className={cardLink}>
                <span className="flex-none text-2xl">{test.icon}</span>
                <span className="min-w-0 truncate text-sm font-bold">{test.title[lang]}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-10 rounded-[28px] bg-[#6d5cf7] p-7 text-center text-white">
          <h2 className="font-display text-2xl font-extrabold">
            {t("Примеры по классам — с разбором", "Класстар боюнча мисалдар — талдоо менен")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-white/85">
            {t(
              "Нужны примеры под программу класса? Откройте математику с 0 по 11 класс — задания с объяснением каждого ответа.",
              "Класстын программасына мисалдар керекпи? 0дөн 11-класска чейин математиканы ачыңыз — ар бир жоопко түшүндүрмө.",
            )}
          </p>
          <Link
            href={`/${lang}/matematika`}
            className="mt-5 inline-flex rounded-full bg-white px-7 py-3 font-display font-bold text-[#6d5cf7] transition hover:scale-105"
          >
            {t("Математика по классам →", "Математика класстар боюнча →")}
          </Link>
        </div>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">
            {t("Ещё по математике", "Дагы математика боюнча")}
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link href={`/${lang}/matematika/kvadraty`} className={cardLink}>
              <span className="flex-none text-2xl">🔼</span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">
                  {t("Квадраты чисел — таблица", "Сандардын квадраттары — таблица")}
                </span>
                <span className="block truncate text-xs text-[#8f8aa8]">
                  {t("1²–20² и тренажёр", "1²–20² жана тренажёр")}
                </span>
              </span>
            </Link>
            <Link href={`/${lang}/matematika/igry`} className={cardLink}>
              <span className="flex-none text-2xl">🎮</span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">
                  {t("Математические игры", "Математикалык оюндар")}
                </span>
                <span className="block truncate text-xs text-[#8f8aa8]">
                  {t("счёт и логика в игре", "оюн түрүндөгү эсеп жана логика")}
                </span>
              </span>
            </Link>
          </div>
        </section>

        <Faq title={t("Частые вопросы", "Көп берилүүчү суроолор")} items={faq} />
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
