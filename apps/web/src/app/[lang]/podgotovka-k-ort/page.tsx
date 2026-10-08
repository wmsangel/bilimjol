import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
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
      ? "ЖРТга онлайн даярдык — акысыз тренажёр | Bilimjol"
      : "Подготовка к ОРТ онлайн — бесплатный тренажёр | Bilimjol",
    description: ky
      ? "Жалпы республикалык тестирлөөгө (ЖРТ) даярдан: математика, аналогиялар жана сабаттуулук боюнча онлайн тренажёр. Кыргызча жана орусча, катталуусуз."
      : "Готовьтесь к Общереспубликанскому тестированию (ОРТ): онлайн-тренажёр по математике, аналогиям и грамотности. На русском и кыргызском, без регистрации.",
    alternates: localizedAlternates(lang, "/podgotovka-k-ort"),
  };
}

export default async function OrtLandingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);
  const exam = t("ОРТ", "ЖРТ");

  const sections = [
    {
      icon: "🔢",
      title: t("Математика", "Математика"),
      note: t(
        "Проценты, уравнения, числовые ряды, геометрия и текстовые задачи — на скорость и точность.",
        "Пайыздар, теңдемелер, сан катарлары, геометрия жана текст маселелери — ылдамдык жана тактык менен.",
      ),
    },
    {
      icon: "🔗",
      title: t("Аналогии и дополнения", "Аналогиялар жана толуктоолор"),
      note: t(
        "Логические связи между словами, продолжение мысли, лишнее слово — проверка словесного мышления.",
        "Сөздөрдүн ортосундагы логикалык байланыш, ойду улоо, ашыкча сөз — сөздүк ой жүгүртүүнү текшерүү.",
      ),
    },
    {
      icon: "📖",
      title: t("Чтение и понимание", "Окуу жана түшүнүү"),
      note: t(
        "Умение быстро находить в тексте главное и отвечать на вопросы по прочитанному.",
        "Тексттен негизгини тез табуу жана окугандын суроолоруна жооп берүү билгичтиги.",
      ),
    },
    {
      icon: "✍️",
      title: t("Практическая грамматика", "Практикалык грамматика"),
      note: t(
        "Нормы языка: верные формы слов, пунктуация, точный выбор значения.",
        "Тил нормалары: сөздөрдүн туура формалары, тыныш белгилер, маанини так тандоо.",
      ),
    },
  ];

  const tips = [
    {
      icon: "🗓️",
      title: t("Готовьтесь заранее и регулярно", "Алдын ала жана үзгүлтүксүз даярданыңыз"),
      note: t(
        "Короткие ежедневные подходы по 20–30 минут дают больше, чем марафоны перед экзаменом. Навык решать на время нарабатывается повторением.",
        "Экзамендин алдындагы марафондон көрө, күнүнө 20–30 мүнөттүк кыска машыгуулар көп пайда берет. Убакытка чыгаруу көндүмү кайталоо менен иштелет.",
      ),
    },
    {
      icon: "🎯",
      title: t("Находите слабые места", "Алсыз жерлерди табыңыз"),
      note: t(
        "Прорешайте пробник, посмотрите, где больше ошибок, и подтягивайте именно эти темы, а не всё подряд.",
        "Сыноону чыгарып, кайда ката көп экенин карап, баарын катары менен эмес, так ошол темаларды чыңдаңыз.",
      ),
    },
    {
      icon: "⏱️",
      title: t("Привыкайте к формату", "Форматка көнүңүз"),
      note: t(
        "Тревога часто идёт от непривычной обстановки «на время». Чем чаще решаете в формате теста, тем спокойнее на реальном экзамене.",
        "Тынчсыздануу көбүнчө «убакытка» деген адаттан тыш абалдан келет. Тест форматында канча көп чыгарсаңыз, чыныгы экзаменде ошончо тынч болосуз.",
      ),
    },
  ];

  const faq = [
    {
      q: t("Что такое ОРТ?", "ЖРТ деген эмне?"),
      a: t(
        "ОРТ (Общереспубликанское тестирование) — единый экзамен в Кыргызстане для поступления в вузы на бюджет и грант. Состоит из основного теста (математика, аналогии, чтение и грамматика) и предметных тестов. Сдаётся на русском, кыргызском или узбекском языке.",
        "ЖРТ (Жалпы республикалык тестирлөө) — Кыргызстанда вузга бюджетке жана грантка тапшыруу үчүн бирдиктүү экзамен. Негизги тесттен (математика, аналогиялар, окуу жана грамматика) жана предметтик тесттерден турат. Орусча, кыргызча же өзбекче тапшырылат.",
      ),
    },
    {
      q: t("Этот тренажёр бесплатный?", "Бул тренажёр акысызбы?"),
      a: t(
        "Да. Пробный ОРТ и тренажёр по математике доступны бесплатно и без регистрации — можно начать прямо сейчас.",
        "Ооба. ЖРТ сыноосу жана математика тренажёру акысыз жана катталуусуз жеткиликтүү — азыр эле баштаса болот.",
      ),
    },
    {
      q: t("Сколько заданий в пробнике?", "Сыноодо канча тапшырма бар?"),
      a: t(
        "В пробном ОРТ 15 заданий: математика, аналогии и грамотность вперемешку, как на реальном тесте. Вопросы каждый раз новые, а после ответа сразу виден разбор.",
        "ЖРТ сыноосунда 15 тапшырма: чыныгы тесттегидей математика, аналогиялар жана сабаттуулук аралаш. Суроолор ар жолу жаңы, жооптон кийин талдоо дароо көрүнөт.",
      ),
    },
    {
      q: t("На каком языке можно заниматься?", "Кайсы тилде машыгууга болот?"),
      a: t(
        "На русском и кыргызском — язык переключается одной кнопкой. Это удобно, чтобы готовиться на том языке, на котором будете сдавать.",
        "Орусча жана кыргызча — тил бир баскыч менен которулат. Бул кайсы тилде тапшырсаңыз, ошол тилде даярданууга ыңгайлуу.",
      ),
    },
  ];

  const ctaCard =
    "flex items-center gap-4 rounded-[26px] bg-white p-5 shadow-[0_8px_24px_rgba(25,21,57,.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(25,21,57,.1)]";

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <JsonLd
        data={breadcrumbJsonLd(lang, [
          [t("Подготовка к ОРТ", "ЖРТга даярдык"), "/podgotovka-k-ort"],
        ])}
      />
      <JsonLd data={faqJsonLd(faq)} />
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8 font-sans text-[#191539]">
        <div className="mb-8 text-center">
          <div className="text-6xl">🎓</div>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight">
            {t("Подготовка к ОРТ онлайн", "ЖРТга онлайн даярдык")}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-[#5c5880]">
            {t(
              "Бесплатный тренажёр в формате Общереспубликанского тестирования: математика, аналогии и грамотность — на русском и кыргызском, без регистрации.",
              "Жалпы республикалык тестирлөө форматындагы акысыз тренажёр: математика, аналогиялар жана сабаттуулук — орусча жана кыргызча, катталуусуз.",
            )}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link href={`/${lang}/tests/ort`} className={ctaCard}>
            <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[20px] bg-[#efecff] text-3xl">
              🎓
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold">
                {t("Пробный ОРТ", "ЖРТ сыноосу")}
              </h2>
              <p className="mt-1 text-sm text-[#5c5880]">
                {t("15 заданий вразброс", "15 тапшырма аралаш")}
              </p>
            </div>
          </Link>
          <Link href={`/${lang}/tests/ort-math`} className={ctaCard}>
            <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[20px] bg-[#efecff] text-3xl">
              🧮
            </span>
            <div className="min-w-0">
              <h2 className="font-display text-xl font-bold">
                {t("Математика ОРТ", "ЖРТ математика")}
              </h2>
              <p className="mt-1 text-sm text-[#5c5880]">
                {t("Проценты, уравнения, ряды", "Пайыздар, теңдемелер, катарлар")}
              </p>
            </div>
          </Link>
        </div>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">
            {t(`Из чего состоит основной тест ${exam}`, `Негизги ${exam} тести эмнеден турат`)}
          </h2>
          <p className="mt-3 text-[#5c5880]">
            {t(
              "Основной тест проверяет не зубрёжку, а общие учебные навыки. Вот его четыре части — тренажёр пока покрывает первые две (пилот, будем расширять).",
              "Негизги тест жаттоону эмес, жалпы окуу көндүмдөрүн текшерет. Анын төрт бөлүгү — тренажёр азырынча биринчи экөөнү камтыйт (пилот, кеңейтебиз).",
            )}
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {sections.map((s) => (
              <div
                key={s.title}
                className="rounded-[26px] bg-white p-5 shadow-[0_8px_24px_rgba(25,21,57,.06)]"
              >
                <div className="text-3xl">{s.icon}</div>
                <h3 className="mt-2 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-1 text-sm leading-6 text-[#5c5880]">{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold">
            {t("Как готовиться к экзамену", "Экзаменге кантип даярдануу керек")}
          </h2>
          <div className="mt-5 space-y-4">
            {tips.map((tip) => (
              <div
                key={tip.title}
                className="flex gap-4 rounded-[26px] bg-white p-5 shadow-[0_8px_24px_rgba(25,21,57,.06)]"
              >
                <div className="flex-none text-3xl">{tip.icon}</div>
                <div>
                  <h3 className="font-display text-lg font-bold">{tip.title}</h3>
                  <p className="mt-1 leading-7 text-[#5c5880]">{tip.note}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-12 rounded-[28px] bg-[#6d5cf7] p-7 text-center text-white">
          <h2 className="font-display text-2xl font-extrabold">
            {t("Начните с пробного теста", "Сыноо тесттен баштаңыз")}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-white/85">
            {t(
              "15 заданий, две минуты, без регистрации — и сразу видно, над чем поработать.",
              "15 тапшырма, эки мүнөт, катталуусуз — эмне үстүндө иштөө керегин дароо көрөсүз.",
            )}
          </p>
          <Link
            href={`/${lang}/tests/ort`}
            className="mt-5 inline-flex rounded-full bg-white px-7 py-3 font-display font-bold text-[#6d5cf7] transition hover:scale-105"
          >
            {t("Пройти пробный ОРТ →", "ЖРТ сыноосун өтүү →")}
          </Link>
        </div>

        <Link
          href={`/${lang}/test-na-proforientaciyu`}
          className="mt-6 flex items-center gap-4 rounded-[26px] bg-white p-5 shadow-[0_8px_24px_rgba(25,21,57,.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(25,21,57,.1)]"
        >
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[18px] bg-[#efecff] text-3xl">
            🧭
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-xl font-bold">
              {t("Ещё не выбрали направление?", "Багытты тандай элексизби?")}
            </h2>
            <p className="mt-1 text-sm text-[#5c5880]">
              {t(
                "Пройдите тест на профориентацию — он подскажет профессии и предметы →",
                "Профориентация тестин өтүңүз — ал кесиптерди жана предметтерди сунуштайт →",
              )}
            </p>
          </div>
        </Link>

        <Faq title={t("Частые вопросы", "Көп берилүүчү суроолор")} items={faq} />
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
