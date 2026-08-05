import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { articles, getArticle } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getDictionary } from "../../dictionaries";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const article = getArticle(slug);
  if (!isLocale(lang) || !article) return {};
  return {
    title: `${article.title[lang]} — izn.study`,
    description: article.excerpt[lang],
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const article = getArticle(slug);
  if (!article) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-5">
        <Link href={`/${lang}`} className="font-display text-xl font-extrabold">
          izn<span className="text-indigo-600 dark:text-indigo-400">.study</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSwitcher current={lang} />
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <Link
          href={`/${lang}/articles`}
          className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {dict.articles.back}
        </Link>

        <article className="mt-6">
          <div className="text-6xl">{article.emoji}</div>
          <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight">
            {article.title[lang]}
          </h1>
          <time className="mt-2 block text-sm text-zinc-400">
            {new Date(article.date).toLocaleDateString(
              lang === "ky" ? "ky-KG" : "ru-RU",
            )}
          </time>

          {article.sections.map((s, i) => (
            <section key={i} className="mt-8">
              <h2 className="font-display text-2xl font-bold">
                {s.heading[lang]}
              </h2>
              {s.body.map((p, j) => (
                <p
                  key={j}
                  className="mt-3 text-lg leading-8 text-zinc-700 dark:text-zinc-300"
                >
                  {p[lang]}
                </p>
              ))}
            </section>
          ))}
        </article>

        <div className="mt-12 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-600 px-6 py-8 text-center text-white shadow-xl">
          <p className="font-display text-xl font-bold">{dict.cta.title}</p>
          <Link
            href={`/${lang}/play`}
            className="mt-4 inline-block rounded-full bg-white px-6 py-3 font-bold text-indigo-600 shadow-lg transition hover:brightness-95"
          >
            {dict.cta.button}
          </Link>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-2xl px-6 py-10 text-sm text-zinc-500">
        © {new Date().getFullYear()} izn.study
      </footer>
    </div>
  );
}
