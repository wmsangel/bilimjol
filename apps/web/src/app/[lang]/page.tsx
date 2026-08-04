import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getDictionary } from "./dictionaries";

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Шапка */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <span className="text-lg font-bold tracking-tight">
          izn<span className="text-indigo-600 dark:text-indigo-400">.study</span>
        </span>
        <div className="flex items-center gap-3">
          <LanguageSwitcher current={lang} />
          <a
            href="#"
            className="hidden text-sm font-medium text-zinc-600 hover:text-foreground sm:inline dark:text-zinc-300"
          >
            {dict.nav.signIn}
          </a>
          <a
            href="#"
            className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            {dict.nav.start}
          </a>
        </div>
      </header>

      {/* Герой */}
      <main className="mx-auto w-full max-w-5xl flex-1 px-6">
        <section className="flex flex-col items-center py-16 text-center sm:py-24">
          <span className="mb-5 inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1.5 text-sm font-medium text-indigo-700 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-300">
            {dict.hero.badge}
          </span>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            {dict.hero.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            {dict.hero.subtitle}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href="#"
              className="rounded-full bg-indigo-600 px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              {dict.hero.ctaPrimary}
            </a>
            <a
              href="#features"
              className="rounded-full border border-black/10 px-6 py-3 text-base font-semibold transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/5"
            >
              {dict.hero.ctaSecondary}
            </a>
          </div>
          <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-500">
            {dict.hero.ages}
          </p>
        </section>

        {/* Возможности */}
        <section id="features" className="py-12 sm:py-16">
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            {dict.features.title}
          </h2>
          <div className="grid gap-5 sm:grid-cols-2">
            {dict.features.items.map((item, i) => (
              <div
                key={i}
                className="rounded-2xl border border-black/[.06] bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900"
              >
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 leading-7 text-zinc-600 dark:text-zinc-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Цена */}
        <section className="py-12 sm:py-16">
          <h2 className="mb-10 text-center text-2xl font-bold tracking-tight sm:text-3xl">
            {dict.pricing.title}
          </h2>
          <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-black/[.06] bg-white p-8 dark:border-white/10 dark:bg-zinc-900">
              <h3 className="text-xl font-semibold">{dict.pricing.free.name}</h3>
              <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
                {dict.pricing.free.desc}
              </p>
            </div>
            <div className="rounded-2xl border-2 border-indigo-500 bg-white p-8 dark:bg-zinc-900">
              <h3 className="text-xl font-semibold">{dict.pricing.pro.name}</h3>
              <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                {dict.pricing.pro.price}
              </p>
              <p className="mt-3 leading-7 text-zinc-600 dark:text-zinc-400">
                {dict.pricing.pro.desc}
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Подвал */}
      <footer className="mx-auto w-full max-w-5xl px-6 py-10 text-sm text-zinc-500 dark:text-zinc-500">
        <p>{dict.footer.tagline}</p>
        <p className="mt-1">
          © {new Date().getFullYear()} izn.study — {dict.footer.rights}
        </p>
      </footer>
    </div>
  );
}
