import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  tasks,
  GRADES,
  subjectsForGrade,
  getTopics,
  subjectLabels,
  type Grade,
  type Subject,
} from "@izn-study/shared";
import { isLocale, type Locale } from "@/i18n/config";
import { SiteFooter } from "@/components/SiteFooter";
import { JsonLd } from "@/components/JsonLd";
import { localizedAlternates, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { pluralRu } from "@/lib/plural";
import { buildCharacter } from "@/lib/characterArt";
import { groupForGrade, GRADE_ACCENT, GRADE_MASCOT } from "@/lib/classContent";
import { getDictionary } from "../../dictionaries";

const SUBJECT_ICON: Record<Subject, string> = { logic: "🧩", math: "🔢", reading: "📖", world: "🌍", olympiad: "🏆" };
const SUBJECT_BG: Record<Subject, string> = { logic: "#efecff", math: "#fbf3e3", reading: "#efecff", world: "#fbf3e3", olympiad: "#efecff" };

const parseGrade = (raw: string): Grade | null => {
  const n = Number(raw);
  return Number.isInteger(n) && (GRADES as number[]).includes(n) ? (n as Grade) : null;
};

export function generateStaticParams() {
  return GRADES.map((g) => ({ grade: String(g) }));
}

function heroH1(g: number, ru: boolean): string {
  if (g === 0) return ru ? "Подготовка к школе онлайн: занятия для детей 5–6 лет" : "Мектепке онлайн даярдык: 5–6 жаштагы балдар үчүн";
  if (g === 1) return ru ? "Занятия для 1 класса онлайн — счёт, чтение и логика в игре" : "1-класс үчүн онлайн сабактар — эсеп, окуу жана логика оюн менен";
  if (g <= 4) return ru ? `Задания для ${g} класса онлайн — математика, чтение и логика` : `${g}-класс үчүн онлайн тапшырмалар — математика, окуу жана логика`;
  if (g <= 9) return ru ? `Задания для ${g} класса онлайн — тренажёр по математике и русскому` : `${g}-класс үчүн онлайн тапшырмалар — математика жана орус тили тренажёру`;
  return ru ? `Онлайн-тренажёр для ${g} класса — повторение и подготовка к экзаменам` : `${g}-класс үчүн онлайн тренажёр — кайталоо жана экзаменге даярдык`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; grade: string }>;
}): Promise<Metadata> {
  const { lang, grade } = await params;
  const g = parseGrade(grade);
  if (!isLocale(lang) || g === null) return {};
  const dict = await getDictionary(lang);
  const name = dict.grades[String(g) as keyof typeof dict.grades];
  return {
    title: `${heroH1(g, lang !== "ky")} | Bilimjol`,
    description:
      lang === "ky"
        ? `${name}: логика, эсеп, окуу жана айлана-чөйрө боюнча акысыз тапшырмалар — сүрөт жана үн менен, кыргызча жана орусча.`
        : `${name}: бесплатные задания по логике, счёту, чтению и окружающему миру — с картинками и озвучкой, на русском и кыргызском.`,
    alternates: localizedAlternates(lang, `/class/${g}`),
  };
}

export default async function ClassPage({
  params,
}: {
  params: Promise<{ lang: string; grade: string }>;
}) {
  const { lang, grade } = await params;
  if (!isLocale(lang)) notFound();
  const g = parseGrade(grade);
  if (g === null) notFound();
  const dict = await getDictionary(lang);
  const ru = lang !== "ky";
  const t = (r: string, k: string) => (ru ? r : k);

  const name = dict.grades[String(g) as keyof typeof dict.grades];
  const nameIn = t(g === 0 ? "подготовки к школе" : `${g} класса`, g === 0 ? "мектепке даярдык" : `${g}-класс`);
  const group = groupForGrade(g);
  const subjects = subjectsForGrade(g);
  const totalTasks = tasks.filter((x) => x.grade === g).length;
  const age = t(g === 0 ? "5–6 лет" : `${g + 5}–${g + 6} лет`, g === 0 ? "5–6 жаш" : `${g + 5}–${g + 6} жаш`);
  const accent = GRADE_ACCENT[g];
  const mascotSvg = buildCharacter(GRADE_MASCOT[g]);
  const playHref = `/${lang}/play`;
  const priceHref = `/${lang}/subscribe`;

  const lead = t(
    g === 0
      ? "Мягкая подготовка к первому классу: буквы, цифры, логика и внимание. Короткие задания с озвучкой — можно заниматься, ещё не умея читать."
      : g <= 4
        ? `Короткие задания по программе ${nameIn}: 10–15 минут в день, с героем-помощником, картинками и объяснением каждого ответа.`
        : g <= 9
          ? `Тренировки по программе ${nameIn}: задания, тесты и олимпиадные задачи. Помогаем закрывать пробелы и не отставать.`
          : `Задания и тесты по программе ${nameIn}. Повторите базу и потренируйтесь перед выпускными экзаменами.`,
    g === 0
      ? "Биринчи класска жумшак даярдык: тамга, сан, логика жана көңүл буруу. Үн менен кыска тапшырмалар — окуй элегиңизде да машыгууга болот."
      : `${nameIn} программасы боюнча тапшырмалар: күнүнө 10–15 мүнөт, жардамчы каарман, сүрөт жана ар бир жоопко түшүндүрмө менен.`,
  );

  const extra = g === 0
    ? { icon: "🎒", title: t("Тест готовности к школе", "Мектепке даярдык тести"), text: t("12 вопросов о ребёнке — за пару минут покажем, что стоит подтянуть.", "Бала жөнүндө 12 суроо — бир нече мүнөттө эмнени чыңдоо керегин көрсөтөбүз."), cta: t("Пройти тест", "Тестти өтүү"), href: `/${lang}/gotovnost-k-shkole` }
    : g <= 4
      ? { icon: "🎮", title: t("Игры для тренировки", "Машыгуу үчүн оюндар"), text: t("Мемори, Быстрый счёт, Лови правильные — для перемены между заданиями.", "Мемори, Ылдам эсеп, Туурасын кар — тапшырмалардын ортосундагы танапис үчүн."), cta: t("Играть", "Ойноо"), href: `/${lang}/games` }
      : { icon: "📝", title: t("Тесты-тренажёры", "Тест-тренажёрлор"), text: t(`Проверьте знания по темам ${nameIn} перед контрольной.`, `Текшерүү алдында ${nameIn} темалары боюнча билимди сынаңыз.`), cta: t("Пройти тест", "Тестти өтүү"), href: `/${lang}/tests` };

  const skillsTitle = t(
    g === 0 ? "Что ребёнок будет уметь к первому классу" : `Что ребёнок освоит в ${g} классе`,
    g === 0 ? "Бала биринчи класска эмнени билет" : `Бала ${g}-класста эмнени өздөштүрөт`,
  );
  const finalTitle = t(
    g === 0 ? "Подготовьтесь к школе вместе" : `Занимайтесь по программе ${nameIn}`,
    g === 0 ? "Мектепке бирге даярданыңыз" : `${nameIn} программасы боюнча машыгыңыз`,
  );

  const seoTitle = group.seoTitle[lang].replace(/\{name\}/g, nameIn);
  const seoParas = group.seoParas.map((p) => p[lang].replace(/\{name\}/g, nameIn));

  const faqItems = group.faq.map((f) => ({ q: f.q[lang], a: f.a[lang] }));
  const classesLabel = t("Классы", "Класстар");
  const h2 = "font-display text-3xl font-bold sm:text-[44px]";

  return (
    <div className="w-full overflow-hidden bg-[#f7f5ff] font-sans text-[#191539]">
      <JsonLd data={breadcrumbJsonLd(lang as Locale, [[classesLabel, "/class"], [name, `/class/${g}`]])} />
      <JsonLd data={faqJsonLd(faqItems)} />

      {/* HEADER */}
      <header className="flex items-center justify-between bg-[#191539] px-5 py-4 sm:px-16 sm:py-[22px]">
        <Link href={`/${lang}`} className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#6d5cf7]">
            <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true"><path d="M3 7c4-2 8-2 11 1c3-3 7-3 11-1v14c-4-2-8-2-11 1c-3-3-7-3-11-1z" fill="#fff" /><path d="M14 8v14" stroke="#6d5cf7" strokeWidth="2" /><path d="M9 26c2-4 8-4 10 0" stroke="#e6c079" strokeWidth="2.5" fill="none" strokeLinecap="round" /></svg>
          </span>
          <span className="font-display text-2xl font-bold text-white">Bilim<span className="text-[#e6c079]">jol</span></span>
        </Link>
        <Link href={playHref} className="rounded-full bg-[#6d5cf7] px-5 py-3 text-[15px] font-extrabold text-white transition hover:shadow-[0_0_0_3px_#e6c079]">
          {t("Начать бесплатно", "Акысыз баштоо")}
        </Link>
      </header>

      {/* HERO */}
      <section className="relative bg-[#191539] px-5 pb-24 pt-7 text-white sm:px-16">
        <div className="pointer-events-none absolute right-5 top-10 h-[520px] w-[520px] rounded-full opacity-35 blur-[90px]" style={{ background: accent }} />
        <div className="pointer-events-none absolute -left-20 bottom-[-40px] h-[300px] w-[300px] rounded-full bg-[#e6c079] opacity-[.18] blur-[90px]" />
        <div className="relative mb-9 flex flex-wrap gap-2 text-sm font-bold text-[#b9b3e6]">
          <Link href={`/${lang}`} className="hover:text-white">{t("Главная", "Башкы")}</Link><span>›</span>
          <Link href={`/${lang}/class`} className="hover:text-white">{classesLabel}</Link><span>›</span>
          <span className="text-white">{name}</span>
        </div>
        <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full bg-[#e6c079]/15 px-4 py-2 text-sm font-extrabold text-[#e6c079]">
              {g === 0 ? "🎒" : "🏫"} {name} · {age}
            </div>
            <h1 className="mb-5 font-display text-4xl font-bold leading-[1.12] sm:text-[52px]">{heroH1(g, ru)}</h1>
            <p className="mb-8 max-w-[560px] text-lg leading-[1.6] text-[#d9d5f5] sm:text-[19px]">{lead}</p>
            <div className="mb-7 flex flex-wrap gap-3.5">
              <Link href={playHref} className="rounded-full bg-[#6d5cf7] px-8 py-4 text-lg font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.45)] transition hover:-translate-y-0.5 hover:shadow-[0_0_0_4px_#e6c079,0_12px_30px_rgba(109,92,247,.45)]">
                {t("Начать бесплатно", "Акысыз баштоо")}
              </Link>
              <a href="#subjects" className="rounded-full border-2 border-white/35 px-7 py-3.5 text-lg font-extrabold text-white transition hover:border-[#e6c079] hover:text-[#e6c079]">
                {t("Смотреть предметы", "Предметтерди көрүү")}
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-3.5 text-[15px] font-bold">
              <span>{totalTasks} {t(pluralRu(totalTasks, "задание", "задания", "заданий"), "тапшырма")}</span><span className="text-[#e6c079]">·</span>
              <span>{subjects.length} {t(pluralRu(subjects.length, "предмет", "предмета", "предметов"), "предмет")}</span><span className="text-[#e6c079]">·</span>
              <span>{t("без рекламы", "жарнаксыз")}</span><span className="text-[#e6c079]">·</span><span>RU / KY</span>
            </div>
          </div>
          <div className="relative hidden h-[380px] lg:block">
            <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: "radial-gradient(circle at 40% 35%,#8577ff,#4a3dc4)" }} />
            <div className="izn-char absolute bottom-4 left-1/2 h-[300px] w-[280px] -translate-x-1/2" dangerouslySetInnerHTML={{ __html: mascotSvg }} />
            <div className="absolute right-2 top-2 rounded-[18px] bg-[#e6c079] px-4 py-3 text-[15px] font-extrabold text-[#191539] shadow-[0_12px_30px_rgba(0,0,0,.25)]">⭐ {t("+3 звезды за тему", "тема үчүн +3 жылдыз")}</div>
          </div>
        </div>
      </section>

      {/* GRADE STRIP */}
      <section id="grades" className="relative mx-5 -mt-14 flex flex-col gap-3 rounded-3xl bg-white p-5 shadow-[0_16px_40px_rgba(25,21,57,.1)] sm:mx-16 sm:flex-row sm:items-center sm:gap-4">
        <div className="whitespace-nowrap text-sm font-extrabold text-[#5c5880]">{t("Выберите класс:", "Классты тандаңыз:")}</div>
        <div className="grid flex-1 grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-12">
          {GRADES.map((x) => (
            <Link key={x} href={`/${lang}/class/${x}`} className={"whitespace-nowrap rounded-full px-2.5 py-2 text-center text-[13px] font-extrabold transition hover:shadow-[0_0_0_2px_#e6c079] " + (x === g ? "bg-[#6d5cf7] text-white" : "bg-[#f7f5ff] text-[#191539]")}>
              {x === 0 ? t("Подгот.", "Даярдык") : x}
            </Link>
          ))}
        </div>
      </section>

      {/* WHY */}
      <section className="px-5 pb-10 pt-24 sm:px-16">
        <h2 className={h2 + " text-center"}>{group.why.title[lang]}</h2>
        <p className="mx-auto mb-12 mt-3 max-w-[720px] text-center text-lg text-[#5c5880]">{group.why.sub[lang]}</p>
        <div className="grid gap-6 md:grid-cols-3">
          {group.why.items.map((w, i) => (
            <div key={i} className="rounded-3xl bg-white p-8 shadow-[0_8px_24px_rgba(25,21,57,.06)]">
              <div className="mb-4 text-[48px]">{w.icon}</div>
              <h3 className="mb-2.5 font-display text-[21px] leading-tight">{w.t[lang]}</h3>
              <p className="text-[17px] leading-[1.55] text-[#5c5880]">{w.d[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SUBJECTS */}
      <section id="subjects" className="px-5 py-20 sm:px-16">
        <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <h2 className={h2 + " leading-tight"}>{t("Предметы", "Предметтер")}<br />{t(`для «${name}»`, `«${name}» үчүн`)}</h2>
          <p className="max-w-[440px] text-lg leading-[1.55] text-[#5c5880]">{t("Задания по программе класса — с картинками, озвучкой и объяснением к каждому ответу.", "Класс программасы боюнча тапшырмалар — сүрөт, үн жана ар бир жоопко түшүндүрмө менен.")}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {subjects.map((s) => {
            const copy = group.subjects[s];
            const topicCount = getTopics({ grade: g, subject: s }).length;
            const chips = copy ? copy.topics.map((c) => c[lang]) : getTopics({ grade: g, subject: s }).slice(0, 3).map((tp) => tp.title[lang]);
            return (
              <div key={s} className="flex gap-5 rounded-3xl bg-white p-7 shadow-[0_8px_24px_rgba(25,21,57,.06)]">
                <div className="flex h-[72px] w-[72px] flex-none items-center justify-center rounded-[22px] text-[38px]" style={{ background: SUBJECT_BG[s] }}>{SUBJECT_ICON[s]}</div>
                <div className="flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-[22px]">{copy ? copy.name[lang] : subjectLabels[s][lang]}</h3>
                    <span className="whitespace-nowrap text-sm font-extrabold text-[#5c5880]">{topicCount} {t(pluralRu(topicCount, "тема", "темы", "тем"), "тема")}</span>
                  </div>
                  <p className="mb-3.5 mt-1.5 text-base leading-[1.5] text-[#5c5880]">{copy ? copy.blurb[lang] : subjectLabels[s][lang]}</p>
                  <div className="flex flex-wrap gap-2">
                    {chips.map((c, i) => (
                      <span key={i} className="rounded-full bg-[#f7f5ff] px-3 py-1.5 text-sm font-bold">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <Link href={extra.href} className="mt-5 flex items-center gap-5 rounded-3xl bg-[#e6c079] p-7 transition hover:brightness-[1.03]">
          <div className="text-[40px]">{extra.icon}</div>
          <div className="flex-1">
            <div className="mb-1 font-display text-xl font-bold">{extra.title}</div>
            <div className="text-base text-[#3d3420]">{extra.text}</div>
          </div>
          <span className="hidden whitespace-nowrap rounded-full bg-[#191539] px-6 py-3.5 font-extrabold text-white sm:inline">{extra.cta} →</span>
        </Link>
      </section>

      {/* SKILLS */}
      <section className="px-5 py-24 sm:px-16">
        <div className="grid items-start gap-14 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <div className="izn-char mb-6 h-[120px] w-[120px] overflow-hidden rounded-full bg-white shadow-[0_12px_30px_rgba(25,21,57,.1)]">
              <div className="izn-char h-[136px] w-[124px]" style={{ marginTop: 14, marginLeft: 0 }} dangerouslySetInnerHTML={{ __html: mascotSvg }} />
            </div>
            <h2 className="mb-4 font-display text-3xl font-bold leading-tight sm:text-[40px]">{skillsTitle}</h2>
            <p className="mb-7 text-lg leading-[1.6] text-[#5c5880]">{t("По 10–15 минут в день — без репетиторов и уговоров.", "Күнүнө 10–15 мүнөт — репетиторсуз жана көндүрүүсүз.")}</p>
            <Link href={playHref} className="inline-block rounded-full bg-[#6d5cf7] px-7 py-4 text-[17px] font-extrabold text-white transition hover:shadow-[0_0_0_3px_#e6c079]">{t("Начать бесплатно", "Акысыз баштоо")}</Link>
          </div>
          <div className="flex flex-col gap-3">
            {group.skills.map((k, i) => (
              <div key={i} className="flex items-center gap-4 rounded-[20px] bg-white p-5">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#efecff] font-extrabold text-[#6d5cf7]">✓</span>
                <span className="text-[17px] font-bold leading-snug">{k[lang]}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW (dark) */}
      <section className="px-5 pb-24 sm:px-16">
        <div className="relative grid gap-7 overflow-hidden rounded-[32px] bg-[#191539] p-8 text-white sm:p-14 md:grid-cols-3">
          <div className="pointer-events-none absolute -top-[120px] right-[-60px] h-[360px] w-[360px] rounded-full bg-[#6d5cf7] opacity-35 blur-[80px]" />
          {[
            ["1", "#6d5cf7", "#fff", t(`Выберите «${name}»`, `«${name}» тандаңыз`), t("Задания уже подобраны по программе — ничего настраивать не нужно.", "Тапшырмалар программа боюнча даяр — эч нерсе ырастоонун кереги жок.")],
            ["2", "#6d5cf7", "#fff", t("Занимайтесь 10–15 минут", "10–15 мүнөт машыгыңыз"), t("Короткие темы в игровой форме, с героем-помощником и подсказками.", "Оюн түрүндөгү кыска темалар, жардамчы каарман жана кеңештер менен.")],
            ["3", "#e6c079", "#191539", t("Следите за прогрессом", "Прогрессти көзөмөлдөңүз"), t("Звёзды для ребёнка, отчёт для родителя. Без рекламы, на RU и KY.", "Балага жылдыздар, ата-энеге отчёт. Жарнаксыз, RU жана KY.")],
          ].map(([num, bg, fg, title, body], i) => (
            <div key={i} className="relative">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full font-display text-[22px] font-bold" style={{ background: bg as string, color: fg as string }}>{num}</div>
              <div className="mb-2 font-display text-xl font-bold">{title}</div>
              <div className="leading-[1.55] text-[#d9d5f5]">{body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRICE */}
      <section className="px-5 pb-24 sm:px-16">
        <div className="mx-auto grid max-w-[960px] gap-6 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-9 shadow-[0_8px_24px_rgba(25,21,57,.06)]">
            <div className="mb-2.5 font-display text-[26px] font-bold">{t("Бесплатно", "Акысыз")}</div>
            <div className="mb-6 text-[17px] leading-[1.55] text-[#5c5880]">{t(`Первые задания в каждой теме «${name}» — без регистрации.`, `«${name}» ар бир темасында биринчи тапшырмалар — катталуусуз.`)}</div>
            <Link href={playHref} className="block rounded-full border-2 border-[#6d5cf7] py-3.5 text-center font-extrabold text-[#6d5cf7] transition hover:border-[#e6c079] hover:bg-[#fbf3e3] hover:text-[#191539]">{t("Попробовать", "Сынап көрүү")}</Link>
          </div>
          <div className="rounded-3xl bg-[#6d5cf7] p-9 text-white shadow-[0_20px_50px_rgba(109,92,247,.35)]">
            <div className="mb-2.5 flex items-center justify-between"><div className="font-display text-[26px] font-bold">Premium</div><span className="rounded-full bg-[#e6c079] px-3 py-1.5 text-[13px] font-extrabold text-[#191539]">{t("все классы 0–11", "бардык класс 0–11")}</span></div>
            <div className="mb-6 text-[17px] leading-[1.55] text-[#e6e1ff]">{t(`Все ${totalTasks} заданий класса, тесты, олимпиада и отчёт — по недорогой подписке ($1.99/мес, ≈175 сом).`, `Класстын бардык ${totalTasks} тапшырмасы, тесттер, олимпиада жана отчёт — арзан жазылуу менен ($1.99/ай, ≈175 сом).`)}</div>
            <Link href={priceHref} className="block rounded-full bg-white py-3.5 text-center font-extrabold text-[#6d5cf7] transition hover:bg-[#e6c079] hover:text-[#191539]">{t("Открыть полный доступ", "Толук доступту ачуу")}</Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 pb-20 sm:px-16">
        <h2 className={h2 + " mb-9 text-center"}>{t("Вопросы родителей", "Ата-энелердин суроолору")}</h2>
        <div className="mx-auto flex max-w-[860px] flex-col gap-3">
          {faqItems.map((item, i) => (
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

      {/* SEO TEXT */}
      <section className="px-5 pb-24 sm:px-16">
        <div className="mx-auto max-w-[860px] rounded-3xl bg-white p-8 sm:p-11">
          <h2 className="mb-4 font-display text-[26px] font-bold">{seoTitle}</h2>
          {seoParas.map((p, i) => (
            <p key={i} className="mb-3.5 text-base leading-[1.7] text-[#2d2950]">{p}</p>
          ))}
        </div>
      </section>

      {/* FINAL CTA + other grades */}
      <section className="px-5 pb-16 sm:px-16">
        <div className="relative overflow-hidden rounded-[32px] px-6 py-[72px] text-center text-white sm:px-16" style={{ background: "linear-gradient(135deg,#6d5cf7 0%,#4b3cc9 100%)" }}>
          <div className="pointer-events-none absolute -left-16 -top-20 h-[280px] w-[280px] rounded-full bg-[#e6c079] opacity-25 blur-[60px]" />
          <div className="izn-char relative mx-auto mb-4 h-[92px] w-[84px] overflow-hidden" dangerouslySetInnerHTML={{ __html: mascotSvg }} />
          <h2 className="relative font-display text-3xl font-bold sm:text-5xl">{finalTitle}</h2>
          <p className="relative mb-8 mt-3.5 text-lg text-[#e6e1ff]">{t("Первые задания — бесплатно, без регистрации", "Биринчи тапшырмалар — акысыз, катталуусуз")}</p>
          <Link href={playHref} className="relative inline-block rounded-full bg-white px-10 py-5 text-lg font-extrabold text-[#6d5cf7] transition hover:-translate-y-0.5 hover:bg-[#e6c079] hover:text-[#191539]">{t("Начать бесплатно", "Акысыз баштоо")}</Link>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
          <span className="font-extrabold text-[#5c5880]">{t("Другие классы:", "Башка класстар:")}</span>
          {GRADES.filter((x) => x !== g).map((x) => (
            <Link key={x} href={`/${lang}/class/${x}`} className="rounded-full bg-white px-3 py-2 text-sm font-bold text-[#191539] shadow-[0_2px_8px_rgba(25,21,57,.06)] transition hover:text-[#6d5cf7] hover:shadow-[0_0_0_2px_#e6c079]">
              {x === 0 ? t("Подгот.", "Даярдык") : t(`${x} класс`, `${x}-класс`)}
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter lang={lang} />
    </div>
  );
}
