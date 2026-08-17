import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SubscribePlans } from "@/components/SubscribePlans";
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
    title: `${dict.subscribe.title} — Bilimjol`,
    description: dict.subscribe.subtitle,
  };
}

export default async function SubscribePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const s = dict.subscribe;

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
        <div className="text-center">
          <span className="text-5xl">⭐</span>
          <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
            {s.title}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
            {s.subtitle}
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-md">
          <SubscribePlans
            labels={s}
            locale={lang}
            loginHref={`/${lang}/login`}
            playHref={`/${lang}/play`}
          />
        </div>

        <div className="mt-8 text-center">
          <Link
            href={`/${lang}`}
            className="text-sm font-semibold text-zinc-500 transition hover:text-foreground dark:text-zinc-400"
          >
            {s.back}
          </Link>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-3xl px-6 py-10 text-sm text-zinc-500">
        © {new Date().getFullYear()} Bilimjol
      </footer>
    </div>
  );
}
