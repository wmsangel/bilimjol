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
import { localizedAlternates, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { getDictionary } from "../../dictionaries";

// Квадраты чисел 1–20 — справочная таблица (то, что ищут по запросу),
// плюс ссылка на тренажёр. Таргет: «сандардын квадраттары» (KY) / «квадраты чисел» (RU).
const NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1);

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
      ? "Сандардын квадраттары: таблица жана тренажёр — акысыз | Bilimjol"
      : "Квадраты чисел: таблица и тренажёр онлайн — бесплатно | Bilimjol",
    description: ky
      ? "Сандардын квадраттарынын таблицасы 1ден 20га чейин (1²–20²) жана онлайн тренажёр — акысыз. Квадратты кантип эсептөө керек, түшүндүрмө менен. Кыргызча жана орусча."
      : "Таблица квадратов чисел от 1 до 20 (1²–20²) и онлайн-тренажёр — бесплатно. Как возвести число в квадрат, с объяснением. На русском и кыргызском.",
    alternates: localizedAlternates(lang, "/matematika/kvadraty"),
  };
}

export default async function SquaresPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);

  const trainer = tests.find((x) => x.id === "squares");

  const faq = [
    {
      q: t("Что такое квадрат числа?", "Сандын квадраты деген эмне?"),
      a: t(
        "Квадрат числа — это число, умноженное само на себя. Например, 5² = 5 × 5 = 25. Записывается маленькой цифрой 2 сверху: n².",
        "Сандын квадраты — бул сандын өзүнө көбөйтүлүшү. Мисалы, 5² = 5 × 5 = 25. Үстүндө кичине 2 менен жазылат: n².",
      ),
    },
    {
      q: t("Как быстро выучить квадраты чисел?", "Сандардын квадраттарын кантип тез жаттоо керек?"),
      a: t(
        "Сначала разберитесь, что квадрат — это площадь квадрата со стороной n. Потом тренируйтесь вразброс в тренажёре: повторение по чуть-чуть работает лучше, чем зубрёжка всей таблицы сразу.",
        "Адегенде квадрат — бул капталы n болгон чарчынын аянты экенин түшүнүңүз. Анан тренажёрдо аралаш машыгыңыз: азыраактан кайталоо баарын бирден жаттоого караганда жакшыраак.",
      ),
    },
    {
      q: t("До какого числа нужно знать квадраты?", "Квадраттарды кайсы санга чейин билүү керек?"),
      a: t(
        "В школе обычно нужны квадраты от 1 до 20 — их хватает для большинства задач, дробей и подготовки к ОРТ. Здесь дана вся таблица 1²–20².",
        "Мектепте көбүнчө 1ден 20га чейинки квадраттар керек — алар көпчүлүк маселелерге, бөлчөктөргө жана ЖРТга даярдыкка жетет. Бул жерде 1²–20² толук таблица берилген.",
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <JsonLd
        data={breadcrumbJsonLd(lang, [
          [t("Математика", "Математика"), "/matematika"],
          [t("Квадраты чисел", "Сандардын квадраттары"), "/matematika/kvadraty"],
        ])}
      />
      <JsonLd data={faqJsonLd(faq)} />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <Breadcrumbs
          lang={lang}
          items={[
            [t("Математика", "Математика"), "/matematika"],
            [t("Квадраты чисел", "Сандардын квадраттары"), "/matematika/kvadraty"],
          ]}
        />

        <div className="mb-8 text-center">
          <div className="text-6xl" aria-hidden="true">🔼</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            {t("Квадраты чисел", "Сандардын квадраттары")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#5c5880]">
            {t(
              "Таблица квадратов от 1 до 20 и тренажёр. Квадрат числа — это число, умноженное само на себя: n² = n × n.",
              "1ден 20га чейинки квадраттардын таблицасы жана тренажёр. Сандын квадраты — бул сандын өзүнө көбөйтүлүшү: n² = n × n.",
            )}
          </p>
        </div>

        <section className="rounded-[26px] bg-white p-6 shadow-[0_8px_24px_rgba(25,21,57,.06)]">
          <h2 className="font-display text-2xl font-bold">
            {t("Таблица квадратов (1–20)", "Квадраттар таблицасы (1–20)")}
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {NUMBERS.map((n) => (
              <div
                key={n}
                className="rounded-2xl bg-[#f7f5ff] px-3 py-3 text-center tabular-nums"
              >
                <div className="font-display text-sm font-bold text-[#8f8aa8]">
                  {n}² = {n} × {n}
                </div>
                <div className="font-display text-2xl font-extrabold text-[#6d5cf7]">
                  {n * n}
                </div>
              </div>
            ))}
          </div>
        </section>

        {trainer && (
          <div className="mt-10 rounded-[28px] bg-[#6d5cf7] p-7 text-center text-white">
            <h2 className="font-display text-2xl font-extrabold">
              {t("Проверь, как запомнил", "Кандай жаттаганыңды текшер")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-white/85">
              {t(
                "Тренажёр «Квадраты чисел»: примеры вразброс, к каждому запуску новые. Бесплатно, без регистрации.",
                "«Сандардын квадраттары» тренажёру: аралаш мисалдар, ар бир жолу жаңы. Акысыз, катталуусуз.",
              )}
            </p>
            <Link
              href={`/${lang}/tests/${trainer.id}`}
              className="mt-5 inline-flex rounded-full bg-white px-7 py-3 font-display font-bold text-[#6d5cf7] transition hover:scale-105"
            >
              {t("Открыть тренажёр →", "Тренажёрду ачуу →")}
            </Link>
          </div>
        )}

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">
            {t("Зачем нужны квадраты", "Квадраттар эмнеге керек")}
          </h2>
          <p className="mt-2 text-[#5c5880]">
            {t(
              "Квадраты встречаются повсюду: площадь фигур, теорема Пифагора, степени, проценты и задачи ОРТ. Если помнить квадраты до 20 наизусть, вычисления идут заметно быстрее.",
              "Квадраттар бардык жерде кездешет: фигуралардын аянты, Пифагордун теоремасы, даражалар, пайыздар жана ЖРТ маселелери. 20га чейинки квадраттарды жатка билсең, эсептөө бир топ тез жүрөт.",
            )}
          </p>
          <Link
            href={`/${lang}/matematika`}
            className="mt-4 inline-flex font-bold text-[#6d5cf7] hover:underline"
          >
            {t("Вся математика по классам →", "Бардык математика класстар боюнча →")}
          </Link>
        </section>

        <Faq title={t("Частые вопросы", "Көп берилүүчү суроолор")} items={faq} />
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
