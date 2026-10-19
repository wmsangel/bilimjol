import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { localizedAlternates, breadcrumbJsonLd, faqJsonLd, itemListJsonLd } from "@/lib/seo";
import { GAME_META } from "@/lib/classGames";
import { getDictionary } from "../../dictionaries";

// Математические игры — таргет: «математикалык оюндар» (KY) / «математические игры» (RU).
const MATH_GAMES = ["sprint", "build", "compare", "bubbles", "clock", "pattern"] as const;

// Короткое, честное описание каждой игры.
const GAME_DESC: Record<string, { ru: string; ky: string }> = {
  sprint: { ru: "Примеры на скорость — сколько решишь за 60 секунд", ky: "Ылдамдыкка мисалдар — 60 секундда канча чыгарасың" },
  build: { ru: "Собери верный пример из чисел и знаков", ky: "Сандардан жана белгилерден туура мисал түз" },
  compare: { ru: "Что больше, что меньше — сравнивай числа", ky: "Чоңбу же кичине — сандарды салыштыр" },
  bubbles: { ru: "Лови шарики с правильными ответами", ky: "Туура жооптуу шарларды кар" },
  clock: { ru: "Учимся понимать время по часам", ky: "Саат боюнча убакытты түшүнүүнү үйрөнөбүз" },
  pattern: { ru: "Продолжи числовой ряд — найди закономерность", ky: "Сандык катарды улант — мыйзам ченемди тап" },
};

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
      ? "Математикалык оюндар: математика боюнча онлайн оюндар — акысыз | Bilimjol"
      : "Математические игры онлайн — бесплатно | Bilimjol",
    description: ky
      ? "Математикалык оюндар онлайн, акысыз: эсеп, салыштыруу, сандык катарлар жана саат. Балдарга математиканы оюн түрүндө машыктыруу. Кыргызча жана орусча, катталуусуз."
      : "Математические игры онлайн и бесплатно: счёт, сравнение, числовые ряды и часы. Тренировка математики для детей в игре. На русском и кыргызском, без регистрации.",
    alternates: localizedAlternates(lang, "/matematika/igry"),
  };
}

export default async function MathGamesPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);

  const games = MATH_GAMES.map((id) => GAME_META[id]);

  const faq = [
    {
      q: t("Математические игры правда бесплатные?", "Математикалык оюндар чын эле акысызбы?"),
      a: t(
        "Да. Игры по математике доступны бесплатно и без регистрации — запускайте прямо в браузере. Часть бонусных игр открывается в премиуме.",
        "Ооба. Математикалык оюндар акысыз жана катталуусуз жеткиликтүү — браузерде эле ойноңуз. Айрым бонус оюндар премиумда ачылат.",
      ),
    },
    {
      q: t("С какого возраста можно играть?", "Канча жаштан ойносо болот?"),
      a: t(
        "С подготовки к школе и дальше. Для малышей — счёт, сравнение и часы; для старших — скорость и числовые ряды. Сложность подстраивается под класс.",
        "Мектепке даярдыктан баштап. Кичүүлөр үчүн — эсеп, салыштыруу жана саат; чоңдор үчүн — ылдамдык жана сандык катарлар. Татаалдык класска ылайыкташат.",
      ),
    },
    {
      q: t("Чем игры лучше обычных примеров?", "Оюндар кадимки мисалдардан эмнеси менен жакшы?"),
      a: t(
        "В игре ребёнок тренирует счёт без ощущения «урока» — короткие заходы по минуте не утомляют и возвращают интерес. Это хорошее дополнение к заданиям с разбором.",
        "Оюндо бала «сабак» сезими жок эле эсепти машыктырат — бир мүнөттүк кыска киришүүлөр чарчатпайт. Бул түшүндүрмөлүү тапшырмаларга жакшы кошумча.",
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
          [t("Математические игры", "Математикалык оюндар"), "/matematika/igry"],
        ])}
      />
      <JsonLd data={faqJsonLd(faq)} />
      <JsonLd
        data={itemListJsonLd(
          lang,
          games.map((g) => [g.title[lang], g.slug] as [string, string]),
        )}
      />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <Breadcrumbs
          lang={lang}
          items={[
            [t("Математика", "Математика"), "/matematika"],
            [t("Математические игры", "Математикалык оюндар"), "/matematika/igry"],
          ]}
        />

        <div className="mb-8 text-center">
          <div className="text-6xl" aria-hidden="true">🎮</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            {t("Математические игры", "Математикалык оюндар")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#5c5880]">
            {t(
              "Счёт, сравнение, числовые ряды и часы — в игре. Бесплатно, без регистрации, на русском и кыргызском.",
              "Эсеп, салыштыруу, сандык катарлар жана саат — оюн түрүндө. Акысыз, катталуусуз, орусча жана кыргызча.",
            )}
          </p>
        </div>

        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {games.map((g) => (
            <Link key={g.id} href={`/${lang}${g.slug}`} className={cardLink}>
              <span className="flex-none text-3xl">{g.icon}</span>
              <span className="min-w-0">
                <span className="block font-display text-base font-bold">{g.title[lang]}</span>
                <span className="block text-sm text-[#8f8aa8]">{GAME_DESC[g.id][lang]}</span>
              </span>
            </Link>
          ))}
        </section>

        <div className="mt-10 rounded-[28px] bg-[#6d5cf7] p-7 text-center text-white">
          <h2 className="font-display text-2xl font-extrabold">
            {t("А ещё — задания по классам", "Дагы — класстар боюнча тапшырмалар")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-white/85">
            {t(
              "После игр закрепите тему заданиями с разбором — по математике с 0 по 11 класс.",
              "Оюндан кийин теманы түшүндүрмөлүү тапшырмалар менен бекемдеңиз — 0–11-класс математикасы.",
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
            {t("Другие игры", "Башка оюндар")}
          </h2>
          <p className="mt-2 text-[#5c5880]">
            {t(
              "Кроме математики есть игры на внимание, память и логику.",
              "Математикадан тышкары көңүл буруу, эс тутум жана логикага оюндар бар.",
            )}
          </p>
          <Link
            href={`/${lang}/games`}
            className="mt-3 inline-flex font-bold text-[#6d5cf7] hover:underline"
          >
            {t("Все игры →", "Бардык оюндар →")}
          </Link>
        </section>

        <Faq title={t("Частые вопросы", "Көп берилүүчү суроолор")} items={faq} />
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
