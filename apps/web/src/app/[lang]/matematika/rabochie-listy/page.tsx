import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { WorksheetMaker } from "@/components/WorksheetMaker";
import { localizedAlternates, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { getDictionary } from "../../dictionaries";

// Посадочная «рабочие листы по математике для печати» — таргет GSC:
// «рабочие листы по математике распечатать», «примеры/задания по математике
// N класс распечатать», «математика карточки для печати».
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
      ? "Математикадан басып чыгаруучу рабочий барактар — акысыз PDF | Bilimjol"
      : "Рабочие листы по математике для печати — бесплатно, PDF | Bilimjol",
    description: ky
      ? "Математикадан басып чыгаруучу барактарды түзүңүз: кошуу, кемитүү, көбөйтүү таблицасы, бөлүү. Ар бир барак жаңы, жооптор менен. Акысыз, катталуусуз, PDF."
      : "Генератор рабочих листов по математике: сложение, вычитание, таблица умножения, деление, квадраты. Каждый лист новый, с ответами. Бесплатно, без регистрации, сохранить в PDF.",
    alternates: localizedAlternates(lang, "/matematika/rabochie-listy"),
  };
}

export default async function WorksheetsPage({
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
      q: t(
        "Как распечатать рабочий лист по математике?",
        "Математикадан рабочий баракты кантип басып чыгарса болот?",
      ),
      a: t(
        "Выберите тему и количество примеров, нажмите «Новый лист», затем «Распечатать / PDF». В окне печати выберите принтер или «Сохранить как PDF» — ответы выйдут на отдельной странице.",
        "Теманы жана мисалдардын санын тандап, «Жаңы барак», анан «Басып чыгаруу / PDF» басыңыз. Басуу терезесинде принтерди же «PDF катары сактоо» тандаңыз — жооптор өзүнчө баракка чыгат.",
      ),
    },
    {
      q: t(
        "Листы каждый раз одинаковые?",
        "Барактар ар дайым бирдейби?",
      ),
      a: t(
        "Нет. Примеры генерируются заново при каждом нажатии «Новый лист», поэтому можно распечатать сколько угодно разных вариантов на одну тему.",
        "Жок. Мисалдар «Жаңы барак» басылган сайын кайрадан түзүлөт, ошондуктан бир темага каалагандай көп башка варианттарды басып чыгарса болот.",
      ),
    },
    {
      q: t("Это бесплатно и без регистрации?", "Бул акысызбы жана катталуусузбу?"),
      a: t(
        "Да. Листы бесплатны и не требуют аккаунта. Всё считается прямо в браузере — ничего не загружается на сервер.",
        "Ооба. Барактар акысыз жана аккаунт талап кылбайт. Баары түздөн-түз браузерде эсептелет — серверге эч нерсе жүктөлбөйт.",
      ),
    },
    {
      q: t("Для какого класса подходят листы?", "Барактар кайсы класска ылайыктуу?"),
      a: t(
        "Сложение и вычитание — для 1–2 класса, таблица умножения — 2–3, деление — 3–4, квадраты — с 5 класса. Рядом с каждой темой указан ориентир по классу.",
        "Кошуу жана кемитүү — 1–2-класс, көбөйтүү таблицасы — 2–3, бөлүү — 3–4, квадраттар — 5-класстан. Ар бир теманын жанында класс боюнча багыт көрсөтүлгөн.",
      ),
    },
  ];

  const cardLink =
    "flex items-center gap-3 rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(25,21,57,.06)] transition hover:-translate-y-1 hover:shadow-[0_14px_32px_rgba(25,21,57,.1)]";

  const steps: [string, string][] = [
    [t("Выберите тему и количество примеров", "Теманы жана мисалдардын санын тандаңыз"), "🎯"],
    [t("Нажмите «Новый лист» — примеры сгенерируются", "«Жаңы барак» басыңыз — мисалдар түзүлөт"), "↻"],
    [t("«Распечатать / PDF» — ответы на отдельной странице", "«Басып чыгаруу / PDF» — жооптор өзүнчө баракта"), "⤓"],
  ];

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <JsonLd
        data={breadcrumbJsonLd(lang, [
          [t("Математика", "Математика"), "/matematika"],
          [t("Рабочие листы", "Рабочий барактар"), "/matematika/rabochie-listy"],
        ])}
      />
      <JsonLd data={faqJsonLd(faq)} />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <Breadcrumbs
          lang={lang}
          items={[
            [t("Математика", "Математика"), "/matematika"],
            [t("Рабочие листы", "Рабочий барактар"), "/matematika/rabochie-listy"],
          ]}
        />

        <div className="mb-8 text-center">
          <div className="text-6xl" aria-hidden="true">🖨️</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            {t("Рабочие листы по математике для печати", "Математикадан басып чыгаруучу барактар")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#5c5880]">
            {t(
              "Генератор печатных листов с примерами: сложение, вычитание, таблица умножения, деление, квадраты. Каждый лист новый, ответы — на отдельной странице. Бесплатно, без регистрации.",
              "Мисалдары бар басып чыгаруучу барактардын генератору: кошуу, кемитүү, көбөйтүү таблицасы, бөлүү, квадраттар. Ар бир барак жаңы, жооптор — өзүнчө баракта. Акысыз, катталуусуз.",
            )}
          </p>
        </div>

        <WorksheetMaker lang={lang} />

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">
            {t("Как это работает", "Бул кантип иштейт")}
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {steps.map(([text, icon], i) => (
              <div key={i} className="rounded-2xl bg-white p-4 shadow-[0_6px_18px_rgba(25,21,57,.06)]">
                <div className="text-2xl" aria-hidden="true">{icon}</div>
                <p className="mt-2 text-sm font-semibold text-[#5c5880]">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">
            {t("Зачем печатать листы", "Эмне үчүн барактарды басып чыгаруу керек")}
          </h2>
          <p className="mt-2 text-[#5c5880]">
            {t(
              "Распечатанный лист — это тренировка без экрана: ребёнок считает ручкой, а не глазами. Удобно для домашних заданий, повторения перед контрольной и отработки навыка счёта. Ответы на отдельной странице — родителю не нужно решать самому, проверка занимает минуту.",
              "Басылган барак — экрансыз машыгуу: бала көзү менен эмес, калеми менен эсептейт. Үй тапшырмасы, текшерүү алдында кайталоо жана эсептөө көндүмүн бышыктоо үчүн ыңгайлуу. Жооптор өзүнчө баракта — ата-энеге өзү чыгаруунун кереги жок, текшерүү бир мүнөт алат.",
            )}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl font-bold">
            {t("Ещё по математике", "Дагы математика боюнча")}
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Link href={`/${lang}/matematika/primery`} className={cardLink}>
              <span className="flex-none text-2xl">➗</span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">
                  {t("Примеры онлайн", "Мисалдар онлайн")}
                </span>
                <span className="block truncate text-xs text-[#8f8aa8]">
                  {t("решать на скорость в браузере", "браузерде ылдамдыкка чыгаруу")}
                </span>
              </span>
            </Link>
            <Link href={`/${lang}/matematika/tablica-umnozheniya`} className={cardLink}>
              <span className="flex-none text-2xl">✖️</span>
              <span className="min-w-0">
                <span className="block text-sm font-bold">
                  {t("Таблица умножения", "Көбөйтүү таблицасы")}
                </span>
                <span className="block truncate text-xs text-[#8f8aa8]">
                  {t("таблица и тренажёр", "таблица жана тренажёр")}
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
