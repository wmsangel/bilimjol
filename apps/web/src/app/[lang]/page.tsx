import Link from "next/link";
import { notFound } from "next/navigation";
import { helpers } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { helperGradient } from "@/lib/helperTheme";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  CharactersShowcase,
  DashboardPreview,
  TaskPreview,
} from "@/components/ProductPreviews";
import { getDictionary } from "./dictionaries";

const FEATURE_EMOJI = ["🌍", "🎯", "🦊", "💡"];
const STEP_EMOJI = ["🎨", "✏️", "🏆"];

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      {/* Шапка */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="font-display text-xl font-extrabold tracking-tight">
          izn<span className="text-indigo-600 dark:text-indigo-400">.study</span>
        </span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSwitcher current={lang} />
          <Link
            href={`/${lang}/me`}
            className="hidden text-sm font-semibold text-zinc-600 hover:text-foreground sm:inline dark:text-zinc-300"
          >
            {dict.nav.cabinet}
          </Link>
          <Link
            href={`/${lang}/login`}
            className="text-sm font-semibold text-zinc-600 hover:text-foreground dark:text-zinc-300"
          >
            {dict.auth.loginCta}
          </Link>
          <Link
            href={`/${lang}/play`}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-indigo-500/30 transition hover:brightness-110"
          >
            {dict.nav.start}
          </Link>
        </div>
      </header>

      <main className="w-full flex-1">
        {/* Герой с декоративными пятнами */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -left-16 top-10 h-56 w-56 rounded-full bg-indigo-300/30 blur-3xl dark:bg-indigo-500/20" />
          <div className="pointer-events-none absolute -right-16 top-24 h-56 w-56 rounded-full bg-amber-300/30 blur-3xl dark:bg-amber-500/20" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-48 w-48 rounded-full bg-pink-300/25 blur-3xl dark:bg-pink-500/15" />

          <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-14 text-center sm:py-20">
            {/* Парящие персонажи */}
            <div className="mb-8 flex max-w-2xl flex-wrap justify-center gap-3 sm:gap-4">
              {helpers.map((h, i) => (
                <span
                  key={h.id}
                  className={
                    "animate-float flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-2xl shadow-md sm:h-14 sm:w-14 sm:text-3xl " +
                    helperGradient[h.color]
                  }
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {h.emoji}
                </span>
              ))}
            </div>

            <span className="mb-5 inline-flex items-center rounded-full border border-indigo-200 bg-white/70 px-4 py-1.5 text-sm font-semibold text-indigo-700 shadow-sm dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
              {dict.hero.badge}
            </span>
            <h1 className="max-w-2xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl">
              {dict.hero.title}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              {dict.hero.subtitle}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${lang}/play`}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3.5 text-lg font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 active:scale-[.98]"
              >
                {dict.hero.ctaPrimary}
              </Link>
              <a
                href="#how"
                className="rounded-full border-2 border-black/10 px-8 py-3.5 text-lg font-bold transition hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/5"
              >
                {dict.hero.ctaSecondary}
              </a>
            </div>
            <p className="mt-6 text-sm font-semibold text-zinc-500 dark:text-zinc-500">
              {dict.hero.ages}
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6">
          {/* Как это работает */}
          <section id="how" className="py-12 sm:py-16">
            <h2 className="mb-10 text-center font-display text-3xl font-extrabold tracking-tight">
              {dict.steps.title}
            </h2>
            <div className="grid gap-5 sm:grid-cols-3">
              {dict.steps.items.map((step, i) => (
                <div
                  key={i}
                  className="relative rounded-3xl border border-black/[.06] bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900"
                >
                  <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-3xl dark:from-indigo-500/15 dark:to-violet-500/15">
                    {STEP_EMOJI[i]}
                  </div>
                  <div className="mb-1 font-display text-xs font-bold uppercase tracking-wide text-indigo-500">
                    {i + 1}
                  </div>
                  <h3 className="font-display text-lg font-bold">{step.title}</h3>
                  <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Витрина: занятия */}
          <section className="py-12 sm:py-16">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div>
                <h2 className="font-display text-3xl font-extrabold tracking-tight">
                  {dict.showcase.lessonsTitle}
                </h2>
                <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                  {dict.showcase.lessonsDesc}
                </p>
              </div>
              <TaskPreview locale={lang} nextLabel={dict.play.next} />
            </div>
          </section>

          {/* Витрина: прогресс */}
          <section className="py-12 sm:py-16">
            <div className="grid items-center gap-10 md:grid-cols-2">
              <div className="md:order-2">
                <h2 className="font-display text-3xl font-extrabold tracking-tight">
                  {dict.showcase.progressTitle}
                </h2>
                <p className="mt-4 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                  {dict.showcase.progressDesc}
                </p>
              </div>
              <div className="md:order-1">
                <DashboardPreview
                  locale={lang}
                  labels={{
                    level: dict.cabinet.level,
                    stars: dict.cabinet.stars,
                    streak: dict.cabinet.streak,
                    completed: dict.cabinet.completed,
                  }}
                />
              </div>
            </div>
          </section>

          {/* Возможности */}
          <section id="features" className="py-12 sm:py-16">
            <h2 className="mb-10 text-center font-display text-3xl font-extrabold tracking-tight">
              {dict.features.title}
            </h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {dict.features.items.map((item, i) => (
                <div
                  key={i}
                  className="rounded-3xl border border-black/[.06] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-white/10 dark:bg-zinc-900"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-2xl dark:from-indigo-500/15 dark:to-violet-500/15">
                    {FEATURE_EMOJI[i]}
                  </div>
                  <h3 className="font-display text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Персонажи */}
          <section className="py-12 text-center sm:py-16">
            <h2 className="font-display text-3xl font-extrabold tracking-tight">
              {dict.showcase.charactersTitle}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
              {dict.showcase.charactersDesc}
            </p>
            <div className="mt-8">
              <CharactersShowcase locale={lang} />
            </div>
          </section>

          {/* Цена */}
          <section className="py-12 sm:py-16">
            <h2 className="mb-10 text-center font-display text-3xl font-extrabold tracking-tight">
              {dict.pricing.title}
            </h2>
            <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
              <div className="rounded-3xl border border-black/[.06] bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-900">
                <h3 className="font-display text-xl font-bold">
                  {dict.pricing.free.name}
                </h3>
                <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
                  {dict.pricing.free.desc}
                </p>
              </div>
              <div className="relative overflow-hidden rounded-3xl border-2 border-indigo-500 bg-gradient-to-br from-indigo-500 to-violet-600 p-8 text-white shadow-xl">
                <h3 className="font-display text-xl font-extrabold">
                  {dict.pricing.pro.name}
                </h3>
                <p className="mt-1 text-sm font-bold text-indigo-100">
                  {dict.pricing.pro.price}
                </p>
                <p className="mt-3 leading-7 text-indigo-50/90">
                  {dict.pricing.pro.desc}
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="py-12 sm:py-16">
            <h2 className="mb-10 text-center font-display text-3xl font-extrabold tracking-tight">
              {dict.faq.title}
            </h2>
            <div className="mx-auto max-w-2xl space-y-3">
              {dict.faq.items.map((item, i) => (
                <details
                  key={i}
                  className="group rounded-2xl border border-black/[.06] bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900"
                >
                  <summary className="cursor-pointer list-none font-display font-bold marker:content-none">
                    <span className="text-indigo-500 group-open:hidden">＋ </span>
                    <span className="hidden text-indigo-500 group-open:inline">− </span>
                    {item.q}
                  </summary>
                  <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </section>

          {/* Финальный призыв */}
          <section className="py-12 sm:py-16">
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-600 px-6 py-12 text-center text-white shadow-xl">
              <div className="pointer-events-none absolute -right-8 -top-8 text-8xl opacity-20">
                🎈
              </div>
              <div className="pointer-events-none absolute -bottom-8 -left-8 text-8xl opacity-20">
                ⭐
              </div>
              <h2 className="font-display text-3xl font-extrabold">
                {dict.cta.title}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-indigo-50/90">
                {dict.cta.subtitle}
              </p>
              <Link
                href={`/${lang}/play`}
                className="mt-6 inline-block rounded-full bg-white px-8 py-3.5 text-lg font-bold text-indigo-600 shadow-lg transition hover:brightness-95 active:scale-[.98]"
              >
                {dict.cta.button}
              </Link>
            </div>
          </section>
        </div>
      </main>

      {/* Подвал */}
      <footer className="mx-auto w-full max-w-5xl px-6 py-10 text-sm text-zinc-500 dark:text-zinc-500">
        <Link
          href={`/${lang}/articles`}
          className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {dict.articles.nav}
        </Link>
        <p className="mt-3">{dict.footer.tagline}</p>
        <p className="mt-1">
          © {new Date().getFullYear()} izn.study — {dict.footer.rights}
        </p>
      </footer>
    </div>
  );
}
