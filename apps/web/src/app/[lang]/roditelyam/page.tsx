import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { localizedAlternates, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

const tr = (lang: Locale) => (ru: string, ky: string) => (lang === "ky" ? ky : ru);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = tr(lang);
  return {
    title: t(
      "Родителям — как заниматься с ребёнком на Bilimjol",
      "Ата-энелерге — Bilimjolдо бала менен кантип машыгуу",
    ),
    description: t(
      "Что такое Bilimjol, как устроены занятия, безопасность и советы, как заниматься с ребёнком дома по 10–15 минут в день.",
      "Bilimjol деген эмне, сабактар кантип түзүлгөн, коопсуздук жана бала менен күнүнө 10–15 мүнөт үйдө машыгуу боюнча кеңештер.",
    ),
    alternates: localizedAlternates(lang, "/roditelyam"),
  };
}

export default async function ParentsLanding({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = tr(lang);

  const features = [
    {
      icon: "⏱️",
      title: t("Короткие занятия", "Кыска сабактар"),
      text: t(
        "10–15 минут в день в игровой форме — регулярность важнее длительности. Ребёнок не устаёт и возвращается сам.",
        "Күнүнө оюн түрүндө 10–15 мүнөт — узактыктан туруктуулук маанилүү. Бала чарчабайт жана өзү кайра келет.",
      ),
    },
    {
      icon: "🔊",
      title: t("Озвучка заданий", "Тапшырмалардын үнү"),
      text: t(
        "Вопросы и картинки озвучиваются — заниматься может даже тот, кто ещё не умеет читать.",
        "Суроолор жана сүрөттөр үн менен — окуй элек бала да машыга алат.",
      ),
    },
    {
      icon: "🧩",
      title: t("Разные предметы", "Ар түрдүү предметтер"),
      text: t(
        "Логика, математика, чтение, окружающий мир и олимпиадные задачи — по классам от подготовки к школе до 11.",
        "Логика, математика, окуу, айлана-чөйрө жана олимпиада маселелери — мектепке даярдыктан 11ге чейин класстар боюнча.",
      ),
    },
    {
      icon: "🛡️",
      title: t("Без сторонней рекламы", "Бөтөн жарнаксыз"),
      text: t(
        "Никаких отвлекающих баннеров и чужих ссылок — ребёнок сосредоточен на заданиях.",
        "Эч кандай алаксыткан баннерлер жана бөтөн шилтемелер жок — бала тапшырмаларга топтолот.",
      ),
    },
    {
      icon: "⭐",
      title: t("Мотивация и прогресс", "Мотивация жана прогресс"),
      text: t(
        "Звёзды, серия дней и герой, которого можно наряжать за успехи, — ребёнку хочется продолжать.",
        "Жылдыздар, күндөр сериясы жана ийгилик үчүн кийиндирилчү каарман — балага улантууну каалатат.",
      ),
    },
    {
      icon: "🌐",
      title: t("Русский и кыргызский", "Орусча жана кыргызча"),
      text: t(
        "Весь материал доступен на двух языках — можно переключаться в один тап.",
        "Бардык материал эки тилде жеткиликтүү — бир тап менен которо аласыз.",
      ),
    },
  ];

  const faq = [
    {
      q: t("С какого возраста можно заниматься?", "Кайсы жаштан баштап машыгууга болот?"),
      a: t(
        "Есть раздел «Подготовка к школе» для тех, кто ещё не читает: задания с картинками и озвучкой. Дальше — материал по классам с 1 по 11.",
        "Окуй элек балдар үчүн «Мектепке даярдык» бөлүмү бар: сүрөттүү жана үн менен тапшырмалар. Андан ары — 1ден 11ге чейин класстар боюнча материал.",
      ),
    },
    {
      q: t("Это бесплатно?", "Бул акысызбы?"),
      a: t(
        "Первые задания в каждой теме бесплатны и доступны без регистрации. Полный доступ открывается по недорогой подписке.",
        "Ар бир темадагы биринчи тапшырмалар акысыз жана катталуусуз жеткиликтүү. Толук доступ арзан жазылуу менен ачылат.",
      ),
    },
    {
      q: t("Нужно ли устанавливать приложение?", "Тиркемени орнотуу керекпи?"),
      a: t(
        "Нет, всё работает в браузере. При желании сайт можно установить на телефон как приложение — иконкой на экране.",
        "Жок, баары браузерде иштейт. Кааласаңыз, сайтты телефонго тиркеме катары орнотсоңуз болот — экранга иконка менен.",
      ),
    },
    {
      q: t("На каком языке материалы?", "Материалдар кайсы тилде?"),
      a: t(
        "Всё доступно на русском и кыргызском — язык переключается в один тап.",
        "Баары орусча жана кыргызча жеткиликтүү — тил бир тап менен которулат.",
      ),
    },
    {
      q: t("Сколько времени заниматься в день?", "Күнүнө канча убакыт машыгуу керек?"),
      a: t(
        "Достаточно 10–15 минут в день. Регулярность важнее длительности: короткие занятия каждый день дают больше, чем редкие длинные.",
        "Күнүнө 10–15 мүнөт жетиштүү. Туруктуулук узактыктан маанилүү: күн сайын кыска сабактар сейрек узундарга караганда көбүрөөк пайда берет.",
      ),
    },
  ];

  const tips = [
    t(
      "Занимайтесь понемногу, но каждый день — привычка важнее объёма.",
      "Аздан, бирок күн сайын машыгыңыз — адат көлөмдөн маанилүү.",
    ),
    t(
      "Хвалите за старание и разбор ошибок, а не только за правильный ответ.",
      "Туура жооп үчүн гана эмес, аракет жана каталарды талдоо үчүн мактаңыз.",
    ),
    t(
      "Чередуйте предметы, чтобы ребёнок не уставал и не скучал.",
      "Бала чарчабашы жана зерикпеши үчүн предметтерди алмаштырыңыз.",
    ),
    t(
      "Заканчивайте на успехе — с ощущением «у меня получается».",
      "Ийгилик менен бүтүрүңүз — «менин колумдан келет» деген сезим менен.",
    ),
  ];

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <JsonLd
        data={breadcrumbJsonLd(lang, [
          [t("Родителям", "Ата-энелерге"), "/roditelyam"],
        ])}
      />
      <JsonLd data={faqJsonLd(faq)} />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        {/* Hero */}
        <section className="text-center">
          <div className="text-6xl">👨‍👩‍👧</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            {t("Родителям", "Ата-энелерге")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
            {t(
              "Bilimjol — это развивающие занятия для детей от подготовки к школе до 11 класса. Логика, счёт, чтение и окружающий мир в коротких игровых заданиях на русском и кыргызском.",
              "Bilimjol — мектепке даярдыктан 11-класска чейинки балдар үчүн өнүктүрүүчү сабактар. Логика, эсеп, окуу жана айлана-чөйрө кыска оюн тапшырмаларында, орусча жана кыргызча.",
            )}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/${lang}/play`}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3.5 text-lg font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
            >
              {t("Начать бесплатно", "Акысыз баштоо")}
            </Link>
            <Link
              href={`/${lang}/gotovnost-k-shkole`}
              className="rounded-full border-2 border-indigo-200 bg-white px-8 py-3.5 text-lg font-bold text-indigo-600 transition hover:border-indigo-400 dark:border-white/15 dark:bg-zinc-900 dark:text-indigo-300"
            >
              🎒 {t("Тест готовности к школе", "Мектепке даярдык тести")}
            </Link>
          </div>
        </section>

        {/* Преимущества */}
        <section className="mt-14">
          <h2 className="text-center font-display text-2xl font-extrabold">
            {t("Как это работает", "Кантип иштейт")}
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-3xl border border-black/[.06] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900"
              >
                <div className="text-3xl">{f.icon}</div>
                <h3 className="mt-3 font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Советы */}
        <section className="mt-14 rounded-[2rem] border border-black/[.06] bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-900">
          <h2 className="font-display text-2xl font-extrabold">
            {t("Как заниматься дома", "Үйдө кантип машыгуу")}
          </h2>
          <ul className="mt-5 space-y-3">
            {tips.map((tip, i) => (
              <li key={i} className="flex gap-3 text-lg leading-8 text-zinc-700 dark:text-zinc-300">
                <span className="flex-none text-indigo-500">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-zinc-600 dark:text-zinc-400">
            {t("Подробнее — в наших материалах для родителей:", "Толугураак — ата-энелер үчүн материалдарда:")}{" "}
            <Link href={`/${lang}/articles`} className="font-bold text-indigo-600 hover:underline dark:text-indigo-400">
              {t("читать статьи", "макалаларды окуу")} →
            </Link>
          </p>
        </section>

        {/* FAQ */}
        <Faq title={t("Частые вопросы", "Көп берилүүчү суроолор")} items={faq} />

        {/* Финальный CTA */}
        <section className="mt-14 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-600 px-6 py-10 text-center text-white shadow-xl">
          <p className="font-display text-2xl font-extrabold">
            {t("Попробуйте вместе с ребёнком", "Бала менен бирге сынап көрүңүз")}
          </p>
          <p className="mx-auto mt-2 max-w-xl text-white/85">
            {t(
              "Первые задания — бесплатно и без регистрации. Позанимайтесь пять минут и посмотрите, как ребёнку понравится.",
              "Биринчи тапшырмалар — акысыз жана катталуусуз. Беш мүнөт машыгып, балага кандай жагаарын көрүңүз.",
            )}
          </p>
          <Link
            href={`/${lang}/play`}
            className="mt-6 inline-block rounded-full bg-white px-8 py-3.5 text-lg font-bold text-indigo-600 shadow-lg transition hover:brightness-95"
          >
            {t("Начать бесплатно", "Акысыз баштоо")}
          </Link>
        </section>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
