import { notFound } from "next/navigation";
import Link from "next/link";
import { tasks } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "../dictionaries";
import { TaskPlayer } from "@/components/TaskPlayer";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href={`/${lang}`} className="text-lg font-bold tracking-tight">
          izn<span className="text-indigo-600 dark:text-indigo-400">.study</span>
        </Link>
        <Link
          href={`/${lang}`}
          className="text-sm font-medium text-zinc-500 hover:text-foreground dark:text-zinc-400"
        >
          {dict.play.backHome}
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 items-start justify-center px-6 py-10">
        <TaskPlayer
          locale={lang}
          allTasks={tasks}
          labels={dict.play}
          gameLabels={dict.game}
          homeHref={`/${lang}`}
          loginHref={`/${lang}/login`}
        />
      </main>
    </div>
  );
}
