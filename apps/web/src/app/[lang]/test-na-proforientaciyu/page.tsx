import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { careerTypes } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CareerTest } from "@/components/CareerTest";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { localizedAlternates, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
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
      ? "Профориентация тести — мектеп окуучусу үчүн онлайн | Bilimjol"
      : "Тест на профориентацию для школьника — онлайн | Bilimjol",
    description: ky
      ? "Кайсы кесип сизге ылайык? 8–11-класс үчүн акысыз профориентация тести RIASEC методикасы боюнча: жөндөм профили, кесиптер жана предметтер. Кыргызча жана орусча."
      : "Кем стать? Бесплатный тест на профориентацию для 8–11 классов по методике RIASEC: профиль склонностей, профессии и школьные предметы. На русском и кыргызском.",
    alternates: localizedAlternates(lang, "/test-na-proforientaciyu"),
  };
}

export default async function CareerPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);

  const faq = [
    {
      q: t("Что показывает тест на профориентацию?", "Профориентация тести эмнени көрсөтөт?"),
      a: t(
        "Тест определяет ваш профиль склонностей по методике RIASEC — к какому типу деятельности вы тяготеете. По результату вы увидите подходящие направления, профессии и школьные предметы, которые стоит усилить.",
        "Тест RIASEC методикасы боюнча жөндөм профилиңизди аныктайт — кайсы иш түрүнө жакынсыз. Жыйынтык боюнча ылайыктуу багыттарды, кесиптерди жана чыңдоо керек болгон мектеп предметтерин көрөсүз.",
      ),
    },
    {
      q: t("Что такое RIASEC?", "RIASEC деген эмне?"),
      a: t(
        "Это признанная методика профориентации (коды Холланда): 6 типов — Практик, Исследователь, Творец, Помощник, Лидер и Систематик. У каждого человека выражены несколько типов; их сочетание и подсказывает подходящие профессии.",
        "Бул профориентациянын таанылган методикасы (Холланд коддору): 6 тип — Практик, Изилдөөчү, Чыгармачыл, Жардамчы, Лидер жана Системалоочу. Ар бир адамда бир нече тип байкалат; алардын айкалышы ылайыктуу кесиптерди сунуштайт.",
      ),
    },
    {
      q: t("Для какого возраста тест?", "Тест кайсы жашка арналган?"),
      a: t(
        "Лучше всего подходит для 8–11 классов, когда пора выбирать профиль и думать о поступлении. Но попробовать может любой — вопросы простые и честные.",
        "8–11-класстар үчүн эң ылайыктуу, профиль тандоо жана окууга тапшыруу жөнүндө ойлонгон кез. Бирок каалаган адам сынап көрө алат — суроолор жөнөкөй жана чынчыл.",
      ),
    },
    {
      q: t("Результат — это окончательный выбор?", "Жыйынтык — бул акыркы тандообу?"),
      a: t(
        "Нет. Это подсказка, а не приговор: тест показывает склонности, а не единственный путь. Используйте его, чтобы понять, в какую сторону смотреть и какие предметы подтянуть.",
        "Жок. Бул өкүм эмес, кеңеш: тест жөндөмдү көрсөтөт, бирден-бир жол эмес. Аны кайсы жакка кароону жана кайсы предметтерди чыңдоону түшүнүү үчүн колдонуңуз.",
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <JsonLd
        data={breadcrumbJsonLd(lang, [
          [t("Тест на профориентацию", "Профориентация тести"), "/test-na-proforientaciyu"],
        ])}
      />
      <JsonLd data={faqJsonLd(faq)} />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <div className="mb-8 text-center">
          <div className="text-6xl">🧭</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            {t("Тест на профориентацию", "Профориентация тести")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#5c5880]">
            {t(
              "Кем стать? Пройдите тест по методике RIASEC и узнайте свой профиль склонностей — с профессиями, направлениями и предметами, которые стоит усилить.",
              "Ким болуу керек? RIASEC методикасы боюнча тестти өтүп, жөндөм профилиңизди билиңиз — кесиптер, багыттар жана чыңдоо керек болгон предметтер менен.",
            )}
          </p>
        </div>

        <CareerTest
          locale={lang}
          classHref={`/${lang}/class`}
          ortHref={`/${lang}/podgotovka-k-ort`}
        />

        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">
            {t("6 типов по методике RIASEC", "RIASEC боюнча 6 тип")}
          </h2>
          <p className="mt-3 text-[#5c5880]">
            {t(
              "В основе теста — признанная модель профориентации. У каждого человека выражены несколько типов, а их сочетание подсказывает подходящие профессии.",
              "Тесттин негизинде — профориентациянын таанылган модели. Ар бир адамда бир нече тип байкалат, алардын айкалышы ылайыктуу кесиптерди сунуштайт.",
            )}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {careerTypes.map((ty) => (
              <div
                key={ty.id}
                className="rounded-[22px] bg-white p-4 shadow-[0_8px_24px_rgba(25,21,57,.06)]"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{ty.emoji}</span>
                  <h3 className="font-display text-lg font-bold">{ty.name[lang]}</h3>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-[#5c5880]">{ty.tagline[lang]}</p>
              </div>
            ))}
          </div>
        </section>

        <Faq title={t("Частые вопросы", "Көп берилүүчү суроолор")} items={faq} />
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
