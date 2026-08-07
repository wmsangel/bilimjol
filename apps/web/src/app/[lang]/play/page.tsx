import { notFound } from "next/navigation";
import Link from "next/link";
import { tasks } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "../dictionaries";
import { TaskPlayer } from "@/components/TaskPlayer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default async function PlayPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="relative flex min-h-[100dvh] flex-1 flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      {/* Плавающая панель навигации — вместо шапки */}
      <div className="fixed left-3 top-3 z-30 flex items-center gap-1 rounded-full border border-black/[.06] bg-white/80 p-1.5 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/80">
        <Link
          href={`/${lang}`}
          aria-label={dict.play.backHome}
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-black/[.06] active:scale-95 dark:hover:bg-white/10"
        >
          🏠
        </Link>
        <span className="mx-0.5 h-5 w-px bg-black/10 dark:bg-white/15" />
        <ThemeToggle />
        <LanguageSwitcher current={lang} />
      </div>

      <main className="mx-auto flex w-full max-w-[1480px] flex-1 items-start justify-center px-4 pb-12 pt-16 sm:pt-6">
        <TaskPlayer
          locale={lang}
          allTasks={tasks}
          labels={dict.play}
          gameLabels={dict.game}
          gradeLabels={dict.grades}
          homeHref={`/${lang}`}
          loginHref={`/${lang}/login`}
        />
      </main>
    </div>
  );
}
