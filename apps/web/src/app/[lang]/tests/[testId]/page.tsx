import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTest, tests } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TestPlayer } from "@/components/TestPlayer";
import { getDictionary } from "../../dictionaries";

export function generateStaticParams() {
  return tests.map((t) => ({ testId: t.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; testId: string }>;
}): Promise<Metadata> {
  const { lang, testId } = await params;
  const test = getTest(testId);
  if (!isLocale(lang) || !test) return {};
  return { title: `${test.title[lang]} — izn.study` };
}

export default async function TestPage({
  params,
}: {
  params: Promise<{ lang: string; testId: string }>;
}) {
  const { lang, testId } = await params;
  if (!isLocale(lang)) notFound();
  const test = getTest(testId);
  if (!test) notFound();
  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-5">
        <Link href={`/${lang}`} className="font-display text-xl font-extrabold">
          izn<span className="text-indigo-600 dark:text-indigo-400">.study</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href={`/${lang}/tests`}
            className="text-sm font-semibold text-zinc-500 hover:text-foreground dark:text-zinc-400"
          >
            {dict.tests.back}
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col items-center px-6 py-8">
        <h1 className="mb-6 font-display text-2xl font-extrabold tracking-tight">
          {test.title[lang]}
        </h1>
        <TestPlayer
          locale={lang}
          testId={test.id}
          backHref={`/${lang}/tests`}
          labels={{
            check: dict.play.check,
            next: dict.play.next,
            cheerCorrect: dict.play.cheerCorrect,
            cheerWrong: dict.play.cheerWrong,
            numberPlaceholder: dict.play.numberPlaceholder,
            progress: dict.play.progress,
            finishTitle: dict.play.finishTitle,
            finishScore: dict.play.finishScore,
            restart: dict.play.restart,
            back: dict.tests.back,
          }}
        />
      </main>
    </div>
  );
}
