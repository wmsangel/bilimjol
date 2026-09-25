import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { JsonLd } from "@/components/JsonLd";
import { LandingHeaderCta } from "./LandingHeaderCta";
import { faqJsonLd } from "@/lib/seo";
import { buildCharacter } from "@/lib/characterArt";

// SVG-персонаж в круглом «пузыре» (кадрируется головой/торсом). Server-safe.
function Mascot({ id, size }: { id: string; size: number }) {
  return (
    <span
      className="izn-char block"
      style={{ width: size, height: Math.round(size * 1.08), marginTop: size * 0.12 }}
      dangerouslySetInnerHTML={{ __html: buildCharacter(id) }}
    />
  );
}

// Продающий лендинг Bilimjol. Порт дизайн-хендоффа (Claude Design) в React/Tailwind.
// Фиксированная бренд-палитра (маркетинговая страница), не реагирует на тему.

const LOGO = (
  <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
    <path d="M3 7c4-2 8-2 11 1c3-3 7-3 11-1v14c-4-2-8-2-11 1c-3-3-7-3-11-1z" fill="#fff" />
    <path d="M14 8v14" stroke="#6d5cf7" strokeWidth="2" />
    <path d="M9 26c2-4 8-4 10 0" stroke="#e6c079" strokeWidth="2.5" fill="none" strokeLinecap="round" />
  </svg>
);

// [charId, x, y, animationDelay]
const MASCOTS: [string, number, number, number][] = [
  ["fox", 40, 20, 0],
  ["cat", 300, 20, 0.6],
  ["snowleopard", 330, 190, 1.2],
  ["panda", 0, 190, 0.3],
  ["bear", 40, 340, 0.9],
  ["frog", 300, 340, 1.5],
];
const STEP_MASCOTS = ["fox", "cat", "snowleopard", "panda", "bear", "frog"];

export function Landing({ lang }: { lang: Locale }) {
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);
  const playHref = `/${lang}/play`;
  const readyHref = `/${lang}/gotovnost-k-shkole`;
  const priceHref = `/${lang}/subscribe`;

  const faq = [
    {
      q: t("С какого возраста можно заниматься?", "Кайсы жаштан баштап машыгууга болот?"),
      a: t(
        "С 5–6 лет — в разделе подготовки к школе. Благодаря озвучке заниматься можно ещё до того, как ребёнок научился читать.",
        "5–6 жаштан — мектепке даярдык бөлүмүндө. Үн коштоо менен бала окуй элегинде да машыгууга болот.",
      ),
    },
    {
      q: t("Это бесплатно?", "Бул акысызбы?"),
      a: t(
        "Первые задания в каждой теме — бесплатно и без регистрации. Полный доступ открывается по недорогой подписке Premium.",
        "Ар бир темадагы биринчи тапшырмалар — акысыз жана катталуусуз. Толук доступ арзан Premium жазылуу менен ачылат.",
      ),
    },
    {
      q: t("Нужно ли скачивать приложение?", "Тиркемени жүктөө керекпи?"),
      a: t(
        "Нет. Bilimjol работает в браузере на компьютере, планшете и телефоне. При желании его можно установить на главный экран как приложение.",
        "Жок. Bilimjol компьютерде, планшетте жана телефондо браузерде иштейт. Кааласаңыз, аны негизги экранга тиркеме катары орнотсоңуз болот.",
      ),
    },
    {
      q: t("На каком языке задания?", "Тапшырмалар кайсы тилде?"),
      a: t(
        "На русском и кыргызском — язык можно переключить в любой момент, озвучка есть на обоих.",
        "Орусча жана кыргызча — тилди каалаган убакта которсоңуз болот, экөөндө тең үн коштоо бар.",
      ),
    },
    {
      q: t("Это безопасно для ребёнка?", "Бул бала үчүн коопсузбу?"),
      a: t(
        "Да. Никакой сторонней рекламы, чатов с незнакомцами и отвлекающих баннеров. Данные ребёнка не передаются третьим лицам.",
        "Ооба. Эч кандай бөтөн жарнак, бейтааныштар менен чат жана алаксыткан баннерлер жок. Баланын маалыматы үчүнчү жактарга берилбейт.",
      ),
    },
  ];

  const navLink = "text-[15px] font-bold text-[#d9d5f5] hover:text-[#e6c079] transition";
  const card = "rounded-3xl bg-white p-9 shadow-[0_8px_24px_rgba(25,21,57,.06)]";
  const h2 = "font-display text-3xl font-bold sm:text-5xl";

  return (
    <div className="w-full overflow-hidden bg-[#f7f5ff] font-sans text-[#191539]">
      <JsonLd data={faqJsonLd(faq)} />

      {/* HEADER */}
      <header className="flex items-center justify-between gap-4 bg-[#191539] px-5 py-4 sm:px-16 sm:py-[22px]">
        <Link href={`/${lang}`} className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#6d5cf7]">
            {LOGO}
          </span>
          <span className="font-display text-2xl font-bold text-white">
            Bilim<span className="text-[#e6c079]">jol</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          <a href="#inside" className={navLink}>{t("Что внутри", "Ичинде эмне")}</a>
          <a href="#how" className={navLink}>{t("Как работает", "Кантип иштейт")}</a>
          <a href="#parents" className={navLink}>{t("Родителям", "Ата-энелерге")}</a>
          <a href="#price" className={navLink}>{t("Подписка", "Жазылуу")}</a>
          <a href="#faq" className={navLink}>{t("Вопросы", "Суроолор")}</a>
        </nav>
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex rounded-full bg-white/10 p-1 text-[13px] font-extrabold">
            <Link href="/ru" className={"rounded-full px-3 py-1.5 " + (lang !== "ky" ? "bg-white text-[#191539]" : "text-[#d9d5f5]")}>RU</Link>
            <Link href="/ky" className={"rounded-full px-3 py-1.5 " + (lang === "ky" ? "bg-white text-[#191539]" : "text-[#d9d5f5]")}>KY</Link>
          </div>
          <LandingHeaderCta
            lang={lang}
            startLabel={t("Начать бесплатно", "Акысыз баштоо")}
            cabinetLabel={t("Кабинет", "Кабинет")}
          />
        </div>
      </header>

      {/* HERO */}
      <section className="relative grid items-center gap-10 bg-[#191539] px-5 py-16 text-white sm:px-16 sm:pb-[120px] lg:grid-cols-[1.05fr_1fr]">
        <div className="pointer-events-none absolute right-10 top-0 h-[520px] w-[520px] rounded-full bg-[#6d5cf7] opacity-35 blur-[90px]" />
        <div className="pointer-events-none absolute -left-20 bottom-[-40px] h-[300px] w-[300px] rounded-full bg-[#e6c079] opacity-20 blur-[90px]" />
        <div className="relative">
          <div className="mb-6 inline-flex items-center gap-2.5 rounded-full bg-[#e6c079]/15 px-4 py-2 text-sm font-extrabold text-[#e6c079]">
            ★ {t("Для детей от 0 до 11 класса", "0дөн 11-класска чейинки балдарга")}
          </div>
          <h1 className="mb-6 font-display text-5xl font-bold leading-[1.05] tracking-[-1px] sm:text-[72px]">
            {t("Учиться — ", "Окуу — ")}<span className="text-[#e6c079]">{t("интересно", "кызыктуу")}</span>
          </h1>
          <p className="mb-9 max-w-[540px] text-lg leading-[1.55] text-[#d9d5f5] sm:text-xl">
            {t(
              "Развивающие задания для детей от подготовки к школе до 11 класса. Логика, счёт, чтение и окружающий мир — коротко, в игре, на русском и кыргызском.",
              "Мектепке даярдыктан 11-класска чейинки балдар үчүн өнүктүрүүчү тапшырмалар. Логика, эсеп, окуу жана айлана-чөйрө — кыска, оюн менен, орусча жана кыргызча.",
            )}
          </p>
          <div className="mb-8 flex flex-wrap gap-3.5">
            <Link href={playHref} className="rounded-full bg-[#6d5cf7] px-8 py-4 text-lg font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.45)] transition hover:-translate-y-0.5 hover:shadow-[0_0_0_4px_#e6c079,0_12px_30px_rgba(109,92,247,.45)]">
              {t("Начать бесплатно", "Акысыз баштоо")}
            </Link>
            <Link href={readyHref} className="rounded-full border-2 border-white/35 px-7 py-3.5 text-lg font-extrabold text-white transition hover:border-[#e6c079] hover:text-[#e6c079]">
              🎒 {t("Пройти тест готовности", "Даярдык тестин өтүү")}
            </Link>
          </div>
          <div className="inline-flex items-center gap-3.5 rounded-2xl bg-white/[.07] px-5 py-3 text-[15px] font-bold">
            <span>{t("1200+ заданий", "1200+ тапшырма")}</span><span className="text-[#e6c079]">·</span>
            <span>{t("без рекламы", "жарнаксыз")}</span><span className="text-[#e6c079]">·</span>
            <span>RU / KY</span>
          </div>
        </div>
        <div className="relative mx-auto hidden h-[480px] w-[440px] lg:block">
          <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_30px_80px_rgba(0,0,0,.35)]" style={{ background: "radial-gradient(circle at 40% 35%,#8577ff,#4a3dc4)" }} />
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[55%] text-[150px] leading-none">📖</div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#e6c079] px-[18px] py-2 text-sm font-extrabold text-[#191539]">
            {t("книга-дорога к знаниям", "билимге китеп-жол")}
          </div>
          {MASCOTS.map(([id, x, y, d], i) => (
            <div key={i} className="animate-bjfloat absolute flex h-[84px] w-[84px] items-end justify-center overflow-hidden rounded-full bg-white shadow-[0_14px_30px_rgba(0,0,0,.25)]" style={{ left: x, top: y, animationDelay: `${d}s` }}>
              <Mascot id={id} size={78} />
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="relative mx-5 -mt-16 grid grid-cols-2 gap-4 sm:mx-16 sm:grid-cols-4 sm:gap-5">
        {[
          ["📚", "#efecff", "1200+", t("заданий", "тапшырма")],
          ["🎓", "#fbf3e3", "12", t("классов (0–11)", "класс (0–11)")],
          ["🧩", "#efecff", "5", t("предметов", "предмет")],
          ["🔊", "#fbf3e3", "2", t("языка с озвучкой", "тил, үн менен")],
        ].map(([icon, bg, num, label], i) => (
          <div key={i} className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-[0_16px_40px_rgba(25,21,57,.1)] sm:gap-4 sm:p-7">
            <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl text-2xl sm:h-14 sm:w-14 sm:rounded-[18px] sm:text-3xl" style={{ background: bg as string }}>{icon}</div>
            <div className="min-w-0">
              <div className="font-display text-2xl font-bold sm:text-[32px]">{num}</div>
              <div className="text-[13px] font-bold leading-tight text-[#5c5880] sm:text-sm">{label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* PROBLEM */}
      <section className="px-5 pb-10 pt-24 sm:px-16">
        <h2 className={h2 + " text-center"}>{t("Знакомо?", "Тааныш?")}</h2>
        <p className="mb-12 mt-3 text-center text-lg text-[#5c5880]">{t("С этим сталкивается почти каждый родитель", "Муну менен дээрлик ар бир ата-эне бетме-бет келет")}</p>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["😩", t("Ребёнок не хочет заниматься", "Бала машыккысы келбейт"), t("Уговоры, слёзы и «ещё пять минут» — домашние занятия превращаются в борьбу.", "Көндүрүү, көз жаш жана «дагы беш мүнөт» — үй сабактары күрөшкө айланат.")],
            ["📱", t("Учебники скучные, а телефон затягивает", "Окуу китептери кызыксыз, телефон тартып алат"), t("Мультики и игры выигрывают у прописей — внимание уходит в экран без пользы.", "Мультфильм менен оюн жазуудан утат — көңүл экранга пайдасыз кетет.")],
            ["🤔", t("Непонятно, готов ли к школе", "Мектепке даярбы — түшүнүксүз"), t("Что ребёнок уже умеет, а над чем стоит поработать до первого сентября?", "Бала эмнени билет, биринчи сентябрга чейин эмнени иштеп чыгуу керек?")],
          ].map(([icon, title, body], i) => (
            <div key={i} className={card}>
              <div className="mb-5 text-[52px]">{icon}</div>
              <h3 className="mb-2.5 font-display text-[22px] leading-tight">{title}</h3>
              <p className="text-[17px] leading-[1.55] text-[#5c5880]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOLUTION */}
      <section className="px-5 py-20 sm:px-16">
        <div className="rounded-[32px] bg-white p-8 shadow-[0_8px_24px_rgba(25,21,57,.06)] sm:p-16">
          <div className="mb-11 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <h2 className="font-display text-3xl font-bold leading-tight sm:text-5xl">
              {t("Как Bilim", "Bilim")}<span className="text-[#c9a04f]">jol</span><br />{t("это меняет", "муну өзгөртөт")}
            </h2>
            <p className="max-w-[420px] text-lg leading-[1.55] text-[#5c5880]">
              {t("Короткие занятия, которые ребёнок сам просит открыть — а родитель видит результат.", "Бала өзү ачууну сураган кыска сабактар — ата-эне натыйжаны көрөт.")}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["⏱️", "#e6e1ff", t("10–15 минут в день", "Күнүнө 10–15 мүнөт"), t("В игровой форме — без перегруза и усталости.", "Оюн түрүндө — артык жүксүз жана чарчоосуз.")],
              ["🔊", "#f7ebd2", t("Озвучка вопросов", "Суроолордун үнү"), t("Для тех, кто ещё не умеет читать — на RU и KY.", "Окуй электер үчүн — RU жана KY.")],
              ["🦊", "#e6e1ff", t("Герои и награды", "Каармандар жана сыйлыктар"), t("Звёзды за задания и гардероб для героя-помощника.", "Тапшырма үчүн жылдыздар жана каарманга гардероб.")],
              ["🎓", "#f7ebd2", t("По классам 0–11", "0–11 класс боюнча"), t("Программа растёт вместе с ребёнком.", "Программа бала менен чогуу өсөт.")],
            ].map(([icon, bg, title, body], i) => (
              <div key={i} className="rounded-3xl bg-[#f7f5ff] p-7">
                <div className="mb-5 flex h-[120px] items-center justify-center rounded-[18px] text-[56px]" style={{ background: bg as string }}>{icon}</div>
                <h3 className="mb-2 font-display text-xl">{title}</h3>
                <p className="leading-[1.5] text-[#5c5880]">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSIDE */}
      <section id="inside" className="px-5 pb-20 pt-10 sm:px-16">
        <h2 className={h2 + " mb-12 text-center"}>{t("Что внутри", "Ичинде эмне")}</h2>
        <div className="mb-4 text-sm font-extrabold uppercase tracking-[1.5px] text-[#6d5cf7]">{t("Предметы", "Предметтер")}</div>
        <div className="mb-9 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[
            ["🧩", t("Логика", "Логика")], ["🔢", t("Математика", "Математика")], ["📖", t("Чтение", "Окуу")],
            ["🌍", t("Окружающий мир", "Айлана-чөйрө")], ["🏆", t("Олимпиада", "Олимпиада")],
          ].map(([icon, label], i) => (
            <div key={i} className="rounded-3xl bg-white px-5 py-7 text-center shadow-[0_6px_18px_rgba(25,21,57,.06)] transition hover:-translate-y-1">
              <div className="mb-3 text-[44px]">{icon}</div>
              <div className="font-display text-lg font-bold">{label}</div>
            </div>
          ))}
        </div>
        <div className="mb-4 text-sm font-extrabold uppercase tracking-[1.5px] text-[#c9a04f]">{t("Игры", "Оюндар")}</div>
        <div className="mb-9 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            ["🧠", t("Мемори", "Мемори"), "/games/memory"], ["⚡", t("Быстрый счёт", "Ылдам эсеп"), "/games/sprint"],
            ["🎈", t("Лови правильные", "Туурасын кар"), "/games/bubbles"], ["✏️", t("Обводилки", "Сызуучулар"), "/games/trace"],
          ].map(([icon, label, href], i) => (
            <Link key={i} href={`/${lang}${href}`} className="flex items-center gap-3 rounded-3xl bg-[#191539] p-5 text-white transition hover:brightness-125 sm:gap-4 sm:p-6">
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-white/10 text-2xl sm:h-14 sm:w-14 sm:text-3xl">{icon}</div>
              <div className="min-w-0 font-display text-base font-bold leading-tight sm:text-lg">{label}</div>
            </Link>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Link href={`/${lang}/tests`} className="flex items-center gap-5 rounded-3xl bg-white p-8 shadow-[0_6px_18px_rgba(25,21,57,.06)] transition hover:-translate-y-1">
            <div className="flex-none text-5xl">📝</div>
            <div className="min-w-0">
              <div className="mb-1.5 font-display text-xl font-bold">{t("Тесты-тренажёры", "Тест-тренажёрлор")}</div>
              <div className="text-[#5c5880]">{t("Закрепляют пройденное и показывают прогресс по теме.", "Өтүлгөндү бекемдеп, тема боюнча прогрессти көрсөтөт.")}</div>
            </div>
          </Link>
          <div className="flex items-center gap-5 rounded-3xl bg-[#e6c079] p-8">
            <div className="flex-none text-5xl">🎒</div>
            <div className="min-w-0 flex-1">
              <div className="mb-1.5 font-display text-xl font-bold">{t("Тест готовности к школе", "Мектепке даярдык тести")}</div>
              <div className="text-[#3d3420]">{t("Узнайте за 15 минут, что ребёнок уже умеет.", "15 мүнөттө бала эмнени билерин билиңиз.")}</div>
            </div>
            <Link href={readyHref} className="whitespace-nowrap rounded-full bg-[#191539] px-5 py-3 font-extrabold text-white transition hover:text-[#e6c079]">{t("Пройти →", "Өтүү →")}</Link>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="bg-[#efecff] px-5 py-20 sm:px-16">
        <h2 className={h2 + " mb-14 text-center"}>{t("Как это работает", "Кантип иштейт")}</h2>
        <div className="grid gap-7 md:grid-cols-3">
          {[
            ["1", "#6d5cf7", "#fff", "🦊🐱🐆🐼🐻🐸", t("Выбери героя-помощника", "Жардамчы каарман танда"), t("Лисёнок, котик, ирбис, панда, мишка или лягушонок — друг на весь путь.", "Түлкү, мышык, илбирс, панда, аюу же бака — бүт жолго дос.")],
            ["2", "#6d5cf7", "#fff", "📚✏️", t("Занимайся по программе класса", "Класс программасы боюнча машык"), t("Задания подобраны под возраст — от подготовки до 11 класса.", "Тапшырмалар жашка ылайыкталган — даярдыктан 11-класска чейин.")],
            ["3", "#e6c079", "#191539", "⭐👕🎩", t("Получай звёзды и открывай награды", "Жылдыз чогултуп, сыйлык ач"), t("Собирай гардероб для героя и следи за своими успехами.", "Каарманга гардероб чогултуп, ийгиликтериңди көзөмөлдө.")],
          ].map(([num, bg, fg, emo, title, body], i) => (
            <div key={i} className="relative rounded-3xl bg-white p-9">
              <div className="absolute -top-[22px] left-9 flex h-12 w-12 items-center justify-center rounded-full font-display text-[22px] font-bold shadow-[0_0_0_6px_#efecff]" style={{ background: bg as string, color: fg as string }}>{num}</div>
              {i === 0 ? (
                <div className="mb-5 mt-4 flex flex-wrap gap-1.5">
                  {STEP_MASCOTS.map((m) => (
                    <span key={m} className="flex h-9 w-9 items-end justify-center overflow-hidden rounded-full bg-[#f7f5ff]">
                      <Mascot id={m} size={34} />
                    </span>
                  ))}
                </div>
              ) : (
                <div className="mb-5 mt-4 text-[40px]">{emo}</div>
              )}
              <h3 className="mb-2 font-display text-[22px]">{title}</h3>
              <p className="text-[17px] leading-[1.5] text-[#5c5880]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PARENTS */}
      <section id="parents" className="px-5 py-24 sm:px-16">
        <div className="grid items-start gap-14 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <div className="mb-4 text-[56px]">🛡️</div>
            <h2 className={h2 + " mb-4 leading-tight"}>{t("Спокойно за ребёнка", "Бала үчүн тынч")}</h2>
            <p className="text-lg leading-[1.6] text-[#5c5880]">{t("Мы создавали Bilimjol как родители — для места, где ребёнку безопасно, а взрослым понятно.", "Bilimjolду ата-эне катары жараттык — балага коопсуз, чоңдорго түшүнүктүү жер үчүн.")}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["🚫", "#efecff", t("Без сторонней рекламы", "Бөтөн жарнаксыз"), t("И без отвлекающих баннеров.", "Жана алаксыткан баннерлерсиз.")],
              ["🔒", "#efecff", t("Приватность данных", "Маалыматтын купуялыгы"), t("Данные ребёнка не передаются третьим лицам.", "Баланын маалыматы үчүнчү жактарга берилбейт.")],
              ["🗣️", "#fbf3e3", t("На двух языках", "Эки тилде"), t("Русский и кыргызский, с озвучкой.", "Орусча жана кыргызча, үн менен.")],
              ["📊", "#fbf3e3", t("Отчёт для родителей", "Ата-энелерге отчёт"), t("Что пройдено и где нужна помощь.", "Эмне өтүлдү жана кайда жардам керек.")],
            ].map(([icon, bg, title, body], i) => (
              <div key={i} className="flex gap-4 rounded-3xl bg-white p-6">
                <div className="flex h-12 w-12 flex-none items-center justify-center rounded-[14px] text-2xl" style={{ background: bg as string }}>{icon}</div>
                <div>
                  <div className="mb-1 text-[17px] font-extrabold">{title}</div>
                  <div className="text-[15px] leading-[1.5] text-[#5c5880]">{body}</div>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-4 rounded-3xl bg-[#191539] p-6 text-white sm:col-span-2">
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-[14px] bg-white/10 text-2xl">📲</div>
              <div className="min-w-0">
                <div className="mb-1 text-[17px] font-extrabold">{t("Работает в браузере и ставится на телефон", "Браузерде иштейт жана телефонго орнотулат")}</div>
                <div className="text-[15px] leading-[1.5] text-[#d9d5f5]">{t("Как приложение (PWA) — без магазинов и лишних загрузок.", "Тиркеме катары (PWA) — дүкөнсүз жана ашыкча жүктөөсүз.")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHO */}
      <section className="px-5 pb-24 sm:px-16">
        <h2 className={h2 + " mb-12 text-center"}>{t("Кому подходит", "Кимге ылайык")}</h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["🧸", t("Дошкольникам", "Мектепке чейинкилерге"), t("Мягкая подготовка к школе: буквы, цифры, логика.", "Мектепке жумшак даярдык: тамга, сан, логика.")],
            ["🎒", t("Школьникам 1–11", "1–11 окуучуларга"), t("Закрепление программы и подготовка к олимпиадам.", "Программаны бекемдөө жана олимпиадага даярдык.")],
            ["👨‍👩‍👧", t("Родителям", "Ата-энелерге"), t("Заниматься вместе и видеть прогресс.", "Чогуу машыгып, прогрессти көрүү.")],
            ["👩‍🏫", t("Учителям", "Мугалимдерге"), t("Как дополнение к урокам и домашним заданиям.", "Сабактарга жана үй тапшырмаларына кошумча.")],
          ].map(([icon, title, body], i) => (
            <div key={i} className="rounded-3xl bg-white p-8 shadow-[0_6px_18px_rgba(25,21,57,.06)]">
              <div className="mb-4 text-[44px]">{icon}</div>
              <h3 className="mb-2 font-display text-xl">{title}</h3>
              <p className="leading-[1.5] text-[#5c5880]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WHY (честная замена секции отзывов — без выдуманных отзывов) */}
      <section className="bg-[#191539] px-5 py-24 text-white sm:px-16">
        <h2 className={h2 + " mb-12 text-center"}>{t("Почему выбирают Bilimjol", "Эмне үчүн Bilimjolду тандашат")}</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ["🧒", t("Дети занимаются сами", "Балдар өздөрү машыгат"), t("Короткие задания в игре, герои-помощники и награды — ребёнок открывает Bilimjol без уговоров.", "Оюн түрүндөгү кыска тапшырмалар, жардамчы каармандар жана сыйлыктар — бала Bilimjolду көндүрүүсүз ачат.")],
            ["👀", t("Родителям всё видно", "Ата-энеге баары көрүнөт"), t("Отчёт показывает, что пройдено и где нужна помощь — по каждому предмету и ребёнку.", "Отчёт эмне өтүлгөнүн жана кайда жардам керегин ар бир предмет жана бала боюнча көрсөтөт.")],
            ["🛡️", t("Спокойно и безопасно", "Тынч жана коопсуз"), t("Без сторонней рекламы и чужих ссылок, данные ребёнка не передаются третьим лицам.", "Бөтөн жарнаксыз жана бөтөн шилтемесиз, баланын маалыматы үчүнчү жактарга берилбейт.")],
          ].map(([icon, title, body], i) => (
            <div key={i} className="rounded-3xl bg-white/[.06] p-8">
              <div className="mb-4 text-[44px]">{icon}</div>
              <h3 className="mb-2 font-display text-xl font-bold">{title}</h3>
              <p className="leading-[1.55] text-[#d9d5f5]">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="price" className="px-5 py-24 sm:px-16">
        <h2 className={h2 + " text-center"}>{t("Начните бесплатно", "Акысыз баштаңыз")}</h2>
        <p className="mb-12 mt-3 text-center text-lg text-[#5c5880]">{t("Попробуйте без регистрации — решите потом", "Катталуусуз сынап көрүңүз — кийин чечесиз")}</p>
        <div className="mx-auto grid max-w-[960px] gap-6 md:grid-cols-2">
          <div className="flex flex-col rounded-3xl bg-white p-10 shadow-[0_8px_24px_rgba(25,21,57,.06)]">
            <div className="mb-1.5 font-display text-[28px] font-bold">Free</div>
            <div className="mb-6 font-display text-[40px] font-bold">0 <span className="text-lg text-[#5c5880]">{t("сом", "сом")}</span></div>
            <div className="mb-8 flex flex-1 flex-col gap-3 text-[17px]">
              {[t("Первые задания в каждой теме", "Ар бир темада биринчи тапшырмалар"), t("Без регистрации", "Катталуусуз"), t("RU и KY с озвучкой", "RU жана KY, үн менен")].map((f, i) => (
                <div key={i} className="flex gap-2.5"><span className="font-extrabold text-[#6d5cf7]">✓</span>{f}</div>
              ))}
            </div>
            <Link href={playHref} className="rounded-full border-2 border-[#6d5cf7] py-4 text-center text-[17px] font-extrabold text-[#6d5cf7] transition hover:border-[#e6c079] hover:bg-[#fbf3e3] hover:text-[#191539]">{t("Начать бесплатно", "Акысыз баштоо")}</Link>
          </div>
          <div className="flex flex-col rounded-3xl bg-[#6d5cf7] p-10 text-white shadow-[0_20px_50px_rgba(109,92,247,.35)]">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <div className="font-display text-[28px] font-bold">Premium</div>
              <div className="rounded-full bg-[#e6c079] px-3.5 py-1.5 text-[13px] font-extrabold text-[#191539]">{t("Полный доступ", "Толук доступ")}</div>
            </div>
            <div className="mb-6 font-display text-[40px] font-bold">199 <span className="text-lg text-[#e6e1ff]">{t("сом / мес", "сом / ай")}</span></div>
            <div className="mb-8 flex flex-1 flex-col gap-3 text-[17px]">
              {[t("Все 1200+ заданий и игры", "Бардык 1200+ тапшырма жана оюндар"), t("Все классы 0–11 и олимпиада", "Бардык класстар 0–11 жана олимпиада"), t("Отчёт для родителей", "Ата-энелерге отчёт"), t("Гардероб и награды героя", "Каармандын гардероб жана сыйлыктары")].map((f, i) => (
                <div key={i} className="flex gap-2.5"><span className="font-extrabold text-[#e6c079]">✓</span>{f}</div>
              ))}
            </div>
            <Link href={priceHref} className="rounded-full bg-white py-4 text-center text-[17px] font-extrabold text-[#6d5cf7] transition hover:bg-[#e6c079] hover:text-[#191539]">{t("Оформить подписку", "Жазылууну таризде")}</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 pb-24 sm:px-16">
        <h2 className={h2 + " mb-10 text-center"}>{t("Частые вопросы", "Көп берилүүчү суроолор")}</h2>
        <div className="mx-auto flex max-w-[860px] flex-col gap-3">
          {faq.map((item, i) => (
            <details key={i} className="group overflow-hidden rounded-[20px] bg-white" open={i === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-7 py-[22px] text-lg font-extrabold">
                <span>{item.q}</span>
                <span className="flex-none text-2xl text-[#6d5cf7] group-open:hidden">+</span>
                <span className="hidden flex-none text-2xl text-[#6d5cf7] group-open:inline">−</span>
              </summary>
              <div className="px-7 pb-6 text-[17px] leading-[1.6] text-[#5c5880]">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="px-5 pb-24 sm:px-16">
        <div className="relative overflow-hidden rounded-[32px] px-6 py-20 text-center text-white sm:px-16" style={{ background: "linear-gradient(135deg,#6d5cf7 0%,#4b3cc9 100%)" }}>
          <div className="pointer-events-none absolute -left-16 -top-20 h-[280px] w-[280px] rounded-full bg-[#e6c079] opacity-25 blur-[60px]" />
          <div className="pointer-events-none absolute -bottom-[120px] -right-20 h-[320px] w-[320px] rounded-full bg-[#191539] opacity-35 blur-[70px]" />
          <div className="relative mb-5 flex items-center justify-center gap-3">
            <span className="flex h-16 w-16 items-end justify-center overflow-hidden rounded-full bg-white/95"><Mascot id="fox" size={60} /></span>
            <span className="text-[52px]">⭐</span>
            <span className="flex h-16 w-16 items-end justify-center overflow-hidden rounded-full bg-white/95"><Mascot id="panda" size={60} /></span>
          </div>
          <h2 className="relative font-display text-4xl font-bold sm:text-[56px]">{t("Попробуйте вместе с ребёнком", "Бала менен бирге сынап көрүңүз")}</h2>
          <p className="relative mb-9 mt-4 text-xl text-[#e6e1ff]">{t("Первые задания — бесплатно, без регистрации", "Биринчи тапшырмалар — акысыз, катталуусуз")}</p>
          <Link href={playHref} className="relative inline-block rounded-full bg-white px-10 py-5 text-lg font-extrabold text-[#6d5cf7] transition hover:-translate-y-0.5 hover:bg-[#e6c079] hover:text-[#191539]">{t("Начать бесплатно", "Акысыз баштоо")}</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#191539] px-5 py-12 text-[#d9d5f5] sm:px-16 sm:pt-14">
        <div className="grid gap-10 border-b border-white/10 pb-10 sm:grid-cols-2 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="mb-3 font-display text-[26px] font-bold text-white">Bilim<span className="text-[#e6c079]">jol</span></div>
            <div className="max-w-[260px] text-[15px] leading-[1.6]">{t("Обучающая платформа для детей 0–11 классов на русском и кыргызском.", "0–11 класстагы балдар үчүн орусча жана кыргызча окуу платформасы.")}</div>
          </div>
          <div className="flex flex-col gap-2.5 text-[15px]">
            <div className="mb-1 font-extrabold text-white">{t("Платформа", "Платформа")}</div>
            <a href="#inside" className="hover:text-[#e6c079]">{t("Что внутри", "Ичинде эмне")}</a>
            <a href="#how" className="hover:text-[#e6c079]">{t("Как работает", "Кантип иштейт")}</a>
            <Link href={readyHref} className="hover:text-[#e6c079]">{t("Тест готовности", "Даярдык тести")}</Link>
          </div>
          <div className="flex flex-col gap-2.5 text-[15px]">
            <div className="mb-1 font-extrabold text-white">{t("Родителям", "Ата-энелерге")}</div>
            <a href="#parents" className="hover:text-[#e6c079]">{t("Безопасность", "Коопсуздук")}</a>
            <a href="#price" className="hover:text-[#e6c079]">{t("Подписка", "Жазылуу")}</a>
            <a href="#faq" className="hover:text-[#e6c079]">{t("Вопросы", "Суроолор")}</a>
          </div>
          <div className="flex flex-col gap-2.5 text-[15px]">
            <div className="mb-1 font-extrabold text-white">{t("Контакты", "Байланыш")}</div>
            <a href="mailto:wmsangel@gmail.com" className="text-[#e6c079] hover:underline">wmsangel@gmail.com</a>
            <div className="mt-1.5 flex gap-2">
              <Link href="/ru" className="rounded-lg bg-white px-2.5 py-1 text-[13px] font-extrabold text-[#191539]">RU</Link>
              <Link href="/ky" className="rounded-lg border border-white/25 px-2.5 py-1 text-[13px] font-extrabold">KY</Link>
            </div>
          </div>
        </div>
        <div className="flex justify-between pt-6 text-sm text-[#8f89c0]">
          <span>© {new Date().getFullYear()} Bilimjol</span><span>bilimjol.com</span>
        </div>
      </footer>
    </div>
  );
}
