import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GRADES, tests } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { localizedAlternates, breadcrumbJsonLd, faqJsonLd, itemListJsonLd } from "@/lib/seo";
import { GAME_META } from "@/lib/classGames";
import { getDictionary } from "../dictionaries";

const MATH_TESTS = ["mult-table", "add", "sub", "division", "squares", "compare", "mixed", "ort-math"];
const MATH_GAMES = ["sprint", "build", "compare", "clock"] as const;

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
      ? "Математика онлайн: 1–11-класс үчүн маселелер жана мисалдар — акысыз | Bilimjol"
      : "Математика онлайн: задачи и примеры для 1–11 класса — бесплатно | Bilimjol",
    description: ky
      ? "Математикадан маселелерди жана мисалдарды онлайн акысыз чыгар — 1–11-класстар боюнча, түшүндүрмө менен. Тренажёрлор, оюндар жана ЖРТга даярдык. Кыргызча жана орусча."
      : "Решайте задачи и примеры по математике онлайн бесплатно — по классам 1–11, с объяснением каждого ответа. Тренажёры, игры и подготовка к ОРТ. На русском и кыргызском.",
    alternates: localizedAlternates(lang, "/matematika"),
  };
}

export default async function MathLandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);

  const classLabel = (g: number) =>
    g === 0 ? t("Подготовка", "Даярдык") : t(`${g} класс`, `${g}-класс`);

  const mathTests = MATH_TESTS.map((id) => tests.find((x) => x.id === id)).filter(
    (x): x is NonNullable<typeof x> => Boolean(x),
  );
  const mathGames = MATH_GAMES.map((id) => GAME_META[id]);

  const faq = [
    {
      q: t("Можно ли решать задачи по математике онлайн бесплатно?", "Математикадан маселелерди онлайн акысыз чыгарса болобу?"),
      a: t(
        "Да. Большая часть заданий, тренажёров и игр по математике доступна бесплатно, без регистрации. Выбирайте класс и решайте примеры и задачи прямо в браузере — к каждому ответу есть объяснение.",
        "Ооба. Математикадан тапшырмалардын, тренажёрлордун жана оюндардын көбү акысыз, катталуусуз жеткиликтүү. Классты тандап, мисалдарды браузерде эле чыгарыңыз — ар бир жоопко түшүндүрмө бар.",
      ),
    },
    {
      q: t("С какого класса есть математика?", "Математика кайсы класстан бар?"),
      a: t(
        "С подготовки к школе (счёт, сравнение) и до 11 класса (дроби, проценты, уравнения, степени). Задания подобраны по школьной программе и возрасту.",
        "Мектепке даярдыктан (эсеп, салыштыруу) 11-класска чейин (бөлчөктөр, пайыздар, теңдемелер, даражалар). Тапшырмалар мектеп программасы жана жаш боюнча тандалган.",
      ),
    },
    {
      q: t("Есть ли объяснения к задачам?", "Маселелерге түшүндүрмө барбы?"),
      a: t(
        "Да. После ответа показывается разбор — как решать, а не только правильный ответ. Это помогает понять тему, а не просто угадать.",
        "Ооба. Жооптон кийин талдоо көрүнөт — туура жоопту гана эмес, кантип чыгарууну. Бул теманы жөн гана божомолдобой, түшүнүүгө жардам берет.",
      ),
    },
    {
      q: t("Нужна ли регистрация?", "Катталуу керекпи?"),
      a: t(
        "Нет, начать можно без аккаунта. Регистрация нужна, только чтобы сохранять прогресс и заниматься на нескольких устройствах.",
        "Жок, аккаунтсуз баштаса болот. Катталуу прогрессти сактоо жана бир нече түзмөктө иштөө үчүн гана керек.",
      ),
    },
  ];

  const cardLink =
    "flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(25,21,57,.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(25,21,57,.1)]";

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <JsonLd
        data={breadcrumbJsonLd(lang, [[t("Математика", "Математика"), "/matematika"]])}
      />
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd
        data={itemListJsonLd(
          lang,
          GRADES.map((g) => [`${t("Математика", "Математика")} — ${classLabel(g)}`, `/matematika/${g}`] as [string, string]),
        )}
      />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <div className="mb-10 text-center">
          <div className="text-6xl" aria-hidden="true">🔢</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            {t("Математика онлайн", "Математика онлайн")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#5c5880]">
            {t(
              "Решайте задачи и примеры по математике онлайн и бесплатно — по классам с 1 по 11, с объяснением каждого ответа. На русском и кыргызском.",
              "Математикадан маселелерди жана мисалдарды онлайн, акысыз чыгарыңыз — 1ден 11-класска чейин, ар бир жоопко түшүндүрмө менен. Орусча жана кыргызча.",
            )}
          </p>
          <Link
            href={`/${lang}/play`}
            className="mt-6 inline-flex rounded-full bg-[#6d5cf7] px-8 py-4 text-lg font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5"
          >
            {t("Начать бесплатно", "Акысыз баштоо")}
          </Link>
        </div>

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">
            {t("Задачи по математике по классам", "Математикадан маселелер класстар боюнча")}
          </h2>
          <p className="mt-2 text-[#5c5880]">
            {t(
              "Выберите класс — внутри задачи и примеры по программе: счёт, таблица умножения, дроби, проценты, уравнения.",
              "Классты тандаңыз — ичинде программа боюнча маселелер жана мисалдар: эсеп, көбөйтүү таблицасы, бөлчөктөр, пайыздар, теңдемелер.",
            )}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {GRADES.map((g) => (
              <Link
                key={g}
                href={`/${lang}/matematika/${g}`}
                className="group flex items-center justify-between rounded-2xl bg-white px-4 py-3.5 shadow-[0_6px_18px_rgba(25,21,57,.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(25,21,57,.1)]"
              >
                <span className="font-display text-base font-bold group-hover:text-[#6d5cf7]">
                  {t("Математика", "Математика")} {g === 0 ? "" : g}
                </span>
                <span className="text-sm font-extrabold text-[#8f8aa8]">{classLabel(g)}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
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

        <section className="mt-12">
          <h2 className="font-display text-2xl font-bold">
            {t("Математические игры", "Математикалык оюндар")}
          </h2>
          <p className="mt-2 text-[#5c5880]">
            {t(
              "Счёт и логика в игре — чтобы тренироваться было не скучно.",
              "Оюн түрүндөгү эсеп жана логика — машыгуу зеригерлик болбошу үчүн.",
            )}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {mathGames.map((g) => (
              <Link key={g.id} href={`/${lang}${g.slug}`} className={cardLink}>
                <span className="flex-none text-2xl">{g.icon}</span>
                <span className="min-w-0 truncate text-sm font-bold">{g.title[lang]}</span>
              </Link>
            ))}
          </div>
        </section>

        <div className="mt-12 rounded-[28px] bg-[#6d5cf7] p-7 text-center text-white">
          <h2 className="font-display text-2xl font-extrabold">
            {t("Старшие классы — к ОРТ", "Жогорку класстар — ЖРТга")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-white/85">
            {t(
              "Для 10–11 классов — тренажёр «Математика ОРТ» и пробный тест.",
              "10–11-класстар үчүн — «ЖРТ математика» тренажёру жана сыноо тест.",
            )}
          </p>
          <Link
            href={`/${lang}/podgotovka-k-ort`}
            className="mt-5 inline-flex rounded-full bg-white px-7 py-3 font-display font-bold text-[#6d5cf7] transition hover:scale-105"
          >
            {t("Подготовка к ОРТ →", "ЖРТга даярдык →")}
          </Link>
        </div>

        <Faq title={t("Частые вопросы", "Көп берилүүчү суроолор")} items={faq} />
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
