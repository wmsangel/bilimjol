import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { localizedAlternates, breadcrumbJsonLd } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "wmsangel@gmail.com";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bilimjol.com";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const ky = lang === "ky";
  return {
    title: ky ? "Байланыш — Bilimjol" : "Контакты — Bilimjol",
    description: ky
      ? "Bilimjol менен байланыш: суроолор, сунуштар, кызматташуу — электрондук почта аркылуу. Орусча жана кыргызча."
      : "Связь с Bilimjol: вопросы, предложения, сотрудничество — по электронной почте. На русском и кыргызском.",
    alternates: localizedAlternates(lang, "/contact"),
  };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);

  const reasons: [string, string][] = [
    [
      t("Вопросы родителей", "Ата-энелердин суроолору"),
      t("Как заниматься, подписка, доступ, прогресс ребёнка.", "Кантип иштөө, жазылуу, жеткиликтүүлүк, баланын прогресси."),
    ],
    [
      t("Ошибки и предложения", "Каталар жана сунуштар"),
      t("Нашли неточность в задании или идею, как улучшить, — напишите.", "Тапшырмада каталык таптыңызбы же жакшыртуу идеясы барбы — жазыңыз."),
    ],
    [
      t("Сотрудничество", "Кызматташуу"),
      t("Школы, учителя, партнёрство и медиа.", "Мектептер, мугалимдер, өнөктөштүк жана медиа."),
    ],
  ];

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: t("Контакты Bilimjol", "Bilimjol байланышы"),
    url: `${SITE}/${lang}/contact`,
    inLanguage: lang,
    about: {
      "@type": "EducationalOrganization",
      "@id": `${SITE}/#org`,
      name: "Bilimjol",
      email: CONTACT,
      url: SITE,
    },
  };

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <JsonLd data={breadcrumbJsonLd(lang, [[t("Контакты", "Байланыш"), "/contact"]])} />
      <JsonLd data={contactJsonLd} />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10 font-sans text-[#191539]">
        <Breadcrumbs lang={lang} items={[[t("Контакты", "Байланыш"), "/contact"]]} />

        <div className="mt-2">
          <h1 className="font-display text-4xl font-extrabold tracking-tight">
            {t("Контакты", "Байланыш")}
          </h1>
          <p className="mt-4 text-lg text-[#5c5880]">
            {t(
              "Bilimjol — бесплатная обучающая платформа для детей 0–11 класса на русском и кыргызском. Напишите нам по любому вопросу — отвечаем по электронной почте.",
              "Bilimjol — 0–11-класс балдар үчүн акысыз окуу платформасы, орусча жана кыргызча. Каалаган суроо боюнча жазыңыз — электрондук почта аркылуу жооп беребиз.",
            )}
          </p>
        </div>

        <div className="mt-8 rounded-[26px] bg-white p-7 text-center shadow-[0_8px_24px_rgba(25,21,57,.06)]">
          <div className="text-5xl" aria-hidden="true">✉️</div>
          <p className="mt-3 text-sm font-bold uppercase tracking-wide text-[#8f8aa8]">
            {t("Электронная почта", "Электрондук почта")}
          </p>
          <a
            href={`mailto:${CONTACT}`}
            className="mt-2 inline-block break-all font-display text-2xl font-extrabold text-[#6d5cf7] hover:underline"
          >
            {CONTACT}
          </a>
          <p className="mx-auto mt-4 max-w-md text-sm text-[#5c5880]">
            {t(
              "Пишите на русском или кыргызском. Обычно отвечаем в течение нескольких дней.",
              "Орусча же кыргызча жазыңыз. Адатта бир нече күндүн ичинде жооп беребиз.",
            )}
          </p>
        </div>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">
            {t("С чем можно обратиться", "Эмне менен кайрылса болот")}
          </h2>
          <div className="mt-5 flex flex-col gap-3">
            {reasons.map(([title, desc]) => (
              <div
                key={title}
                className="rounded-2xl bg-white p-5 shadow-[0_6px_18px_rgba(25,21,57,.06)]"
              >
                <div className="font-display text-base font-bold">{title}</div>
                <p className="mt-1 text-sm text-[#5c5880]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-8 text-sm text-[#8f8aa8]">
          {t(
            "Юридические документы: ",
            "Юридикалык документтер: ",
          )}
          <a href={`/${lang}/privacy`} className="font-bold text-[#6d5cf7] hover:underline">
            {t("Конфиденциальность", "Купуялык")}
          </a>
          {" · "}
          <a href={`/${lang}/terms`} className="font-bold text-[#6d5cf7] hover:underline">
            {t("Соглашение", "Келишим")}
          </a>
          {" · "}
          <a href={`/${lang}/about`} className="font-bold text-[#6d5cf7] hover:underline">
            {t("О проекте", "Долбоор жөнүндө")}
          </a>
        </p>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
