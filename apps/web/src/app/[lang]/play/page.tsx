import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { tasks } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/seo";
import { getDictionary } from "../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return { alternates: localizedAlternates(lang, "/play") };
}
import { TaskPlayer } from "@/components/TaskPlayer";
import { SiteHeader } from "@/components/SiteHeader";
import { SoundToggle } from "@/components/SoundToggle";

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
      <SiteHeader lang={lang} dict={dict} />

      {/* Игровые кнопки: звук и быстрый доступ к гардеробу */}
      <div className="fixed bottom-4 right-4 z-30 flex items-center gap-1 rounded-full border border-black/[.06] bg-white/80 p-1.5 shadow-lg backdrop-blur-md dark:border-white/10 dark:bg-zinc-900/80">
        <SoundToggle />
        <Link
          href={`/${lang}/wardrobe`}
          aria-label="Гардероб"
          className="flex h-9 w-9 items-center justify-center rounded-full text-lg transition hover:bg-black/[.06] active:scale-95 dark:hover:bg-white/10"
        >
          👕
        </Link>
      </div>

      <main className="mx-auto flex w-full max-w-[1480px] flex-1 items-start justify-center px-4 pb-12 pt-6">
        <TaskPlayer
          locale={lang}
          allTasks={tasks}
          labels={dict.play}
          gameLabels={dict.game}
          gradeLabels={dict.grades}
          homeHref={`/${lang}`}
        />
      </main>
    </div>
  );
}
