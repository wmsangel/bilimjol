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

// Таблица умножения 1–10 — справочная сетка (то, что ищут) + тренажёр.
// Таргет: «таблица умножения», «как выучить таблицу умножения» (RU) /
// «көбөйтүү таблицасы» (KY). Образец — страница kvadraty.
const ROWS = Array.from({ length: 10 }, (_, i) => i + 1);

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
      ? "Көбөйтүү таблицасы: онлайн үйрөнүү жана тренажёр | Bilimjol"
      : "Таблица умножения: учить онлайн, таблица и тренажёр | Bilimjol",
    description: ky
      ? "1ден 10го чейинки толук көбөйтүү таблицасы жана акысыз тренажёр катталуусуз. Көбөйтүү таблицасын кантип тез жаттоо керек — тартиби менен жана мисалдар аркылуу."
      : "Полная таблица умножения от 1 до 10 и бесплатный тренажёр без регистрации. Как быстро выучить таблицу умножения — по порядку, через примеры, с проверкой вразброс.",
    alternates: localizedAlternates(lang, "/matematika/tablica-umnozheniya"),
  };
}

export default async function MultTablePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);

  const trainer = tests.find((x) => x.id === "mult-table");

  const faq = [
    {
      q: t("Как быстро выучить таблицу умножения?", "Көбөйтүү таблицасын кантип тез жаттоо керек?"),
      a: t(
        "Сначала поймите смысл: умножение — это сложение одинаковых чисел (4 × 3 = 4 + 4 + 4). Учите по столбикам и от простого: ×1, ×10, ×5, ×2 запоминаются легче всего, потом ×9 и остальные. Короткие ежедневные подходы и тренажёр вразброс работают лучше, чем зубрёжка всей таблицы сразу.",
        "Адегенде маанисин түшүнүңүз: көбөйтүү — бул бирдей сандарды кошуу (4 × 3 = 4 + 4 + 4). Мамычалар боюнча жана жөнөкөйдөн баштаңыз: ×1, ×10, ×5, ×2 эң оңой жатталат, анан ×9 жана калгандары. Күнүмдүк кыска машыгуулар жана аралаш тренажёр баарын бирден жаттоого караганда жакшыраак.",
      ),
    },
    {
      q: t("До какого числа нужна таблица умножения?", "Көбөйтүү таблицасы кайсы санга чейин керек?"),
      a: t(
        "В школе нужна таблица умножения от 1 до 10 — её достаточно для деления, дробей, процентов и большинства задач. Здесь дана вся сетка 1×1 … 10×10.",
        "Мектепте 1ден 10го чейинки көбөйтүү таблицасы керек — ал бөлүү, бөлчөктөр, пайыздар жана көпчүлүк маселелерге жетет. Бул жерде 1×1 … 10×10 толук тор берилген.",
      ),
    },
    {
      q: t("Нужно ли знать таблицу умножения наизусть?", "Көбөйтүү таблицасын жатка билүү керекпи?"),
      a: t(
        "Да. Когда таблица умножения в памяти, все вычисления идут быстрее: деление, сокращение дробей, проценты, задачи ОРТ. Проверить себя можно в тренажёре — примеры идут вразброс.",
        "Ооба. Көбөйтүү таблицасы эсте болгондо бардык эсептөөлөр тезирээк жүрөт: бөлүү, бөлчөктөрдү кыскартуу, пайыздар, ЖРТ маселелери. Өзүңдү тренажёрдо текшерсе болот — мисалдар аралаш берилет.",
      ),
    },
  ];

  const title = t("Таблица умножения", "Көбөйтүү таблицасы");

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <JsonLd
        data={breadcrumbJsonLd(lang, [
          [t("Математика", "Математика"), "/matematika"],
          [title, "/matematika/tablica-umnozheniya"],
        ])}
      />
      <JsonLd data={faqJsonLd(faq)} />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <Breadcrumbs
          lang={lang}
          items={[
            [t("Математика", "Математика"), "/matematika"],
            [title, "/matematika/tablica-umnozheniya"],
          ]}
        />

        <div className="mb-8 text-center">
          <div className="text-6xl" aria-hidden="true">✖️</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#5c5880]">
            {t(
              "Полная таблица умножения от 1 до 10 и тренажёр. Умножение — это сложение одинаковых чисел: a × b.",
              "1ден 10го чейинки толук көбөйтүү таблицасы жана тренажёр. Көбөйтүү — бул бирдей сандарды кошуу: a × b.",
            )}
          </p>
        </div>

        <section className="rounded-[26px] bg-white p-5 shadow-[0_8px_24px_rgba(25,21,57,.06)] sm:p-6">
          <h2 className="font-display text-2xl font-bold">
            {t("Таблица умножения (1–10)", "Көбөйтүү таблицасы (1–10)")}
          </h2>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-center tabular-nums">
              <thead>
                <tr>
                  <th className="rounded-tl-xl bg-[#191539] p-2 text-sm font-extrabold text-white">×</th>
                  {ROWS.map((c) => (
                    <th key={c} className="bg-[#191539] p-2 text-sm font-extrabold text-white">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r}>
                    <th className="bg-[#191539] p-2 text-sm font-extrabold text-white">{r}</th>
                    {ROWS.map((c) => (
                      <td
                        key={c}
                        className={
                          "p-2 text-sm font-bold " +
                          (r === c
                            ? "bg-[#efecff] text-[#4b3cc9]"
                            : "bg-[#f7f5ff] text-[#191539]")
                        }
                      >
                        {r * c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-[#8f8aa8]">
            {t(
              "Строка × столбец = ответ. Например, 7 × 8 = 56.",
              "Сап × мамыча = жооп. Мисалы, 7 × 8 = 56.",
            )}
          </p>
        </section>

        {trainer && (
          <div className="mt-10 rounded-[28px] bg-[#6d5cf7] p-7 text-center text-white">
            <h2 className="font-display text-2xl font-extrabold">
              {t("Проверь, как запомнил", "Кандай жаттаганыңды текшер")}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-white/85">
              {t(
                "Тренажёр «Таблица умножения»: примеры вразброс, к каждому запуску новые. Бесплатно, без регистрации.",
                "«Көбөйтүү таблицасы» тренажёру: аралаш мисалдар, ар бир жолу жаңы. Акысыз, катталуусуз.",
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
            {t("Как выучить таблицу умножения", "Көбөйтүү таблицасын кантип жаттоо керек")}
          </h2>
          <p className="mt-2 text-[#5c5880]">
            {t(
              "Не зубрите всю таблицу сразу. Идите по столбикам от простого к сложному: ×1 и ×10 — очевидны, ×5 заканчивается на 0 или 5, ×2 — удвоение. Опирайтесь на смысл: 6 × 4 — это шесть раз по четыре. Каждый день — короткий подход и проверка вразброс, чтобы ответ вспоминался сразу, а не пересчётом.",
              "Бүт таблицаны бирден жаттабаңыз. Мамычалар боюнча жөнөкөйдөн татаалга өтүңүз: ×1 жана ×10 — айкын, ×5 0 же 5 менен бүтөт, ×2 — эки эсе. Маанисине таяныңыз: 6 × 4 — бул алты жолу төрттөн. Күн сайын кыска машыгуу жана аралаш текшерүү — жооп кайра эсептөө менен эмес, дароо эске келиши үчүн.",
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
