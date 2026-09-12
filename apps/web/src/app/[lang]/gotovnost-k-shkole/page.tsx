import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ReadinessTest } from "@/components/ReadinessTest";
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
  const dict = await getDictionary(lang);
  return {
    title: `${dict.readiness.title} — Bilimjol`,
    description: dict.readiness.intro,
    alternates: localizedAlternates(lang, "/gotovnost-k-shkole"),
  };
}

export default async function ReadinessPage({
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
      q: t("Во сколько лет ребёнок готов к школе?", "Бала канча жашында мектепке даяр болот?"),
      a: t(
        "Возраст в паспорте — не главное. Важнее зрелость: умеет ли ребёнок 15 минут заниматься одним делом, слушать взрослого и доводить начатое до конца. Этот тест поможет оценить готовность по ключевым навыкам.",
        "Паспорттогу жаш — башкысы эмес. Жетилгендик маанилүү: бала 15 мүнөт бир иш менен алектене алабы, чоңду угабы жана баштаганын аягына чыгарабы. Бул тест негизги көндүмдөр боюнча даярдыкты баалоого жардам берет.",
      ),
    },
    {
      q: t("Сколько занимает тест?", "Тест канча убакыт алат?"),
      a: t(
        "Около двух минут — 12 коротких вопросов о ребёнке. Регистрация не нужна.",
        "Болжол менен эки мүнөт — бала жөнүндө 12 кыска суроо. Катталуу керек эмес.",
      ),
    },
    {
      q: t("Что делать, если результат низкий?", "Жыйынтык төмөн болсо эмне кылуу керек?"),
      a: t(
        "Это нормально — до школы всё тренируется. Начните с 5–10 минут в день коротких игровых заданий и постепенно увеличивайте время. В конце теста мы даём конкретные рекомендации.",
        "Бул кадимкидей — мектепке чейин баары машыгат. Күнүнө 5–10 мүнөт кыска оюн тапшырмаларынан баштап, убакытты акырындык менен көбөйтүңүз. Тесттин аягында конкреттүү сунуштарды беребиз.",
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <JsonLd
        data={breadcrumbJsonLd(lang, [
          [dict.readiness.title, "/gotovnost-k-shkole"],
        ])}
      />
      <JsonLd data={faqJsonLd(faq)} />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <div className="mb-8 text-center">
          <div className="text-6xl">🎒</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            {dict.readiness.title}
          </h1>
        </div>
        <ReadinessTest labels={dict.readiness} playHref={`/${lang}/play`} />

        <Faq title={t("Частые вопросы", "Көп берилүүчү суроолор")} items={faq} />
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
