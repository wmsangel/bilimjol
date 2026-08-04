"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getHelper, type Locale } from "@izn-study/shared";
import { loadProgress } from "@/lib/progress";
import { loadHelperId, removeHelperId } from "@/lib/prefs";
import { helperBg } from "@/lib/helperTheme";

export interface CabinetLabels {
  title: string;
  greeting: string;
  stars: string;
  completed: string;
  continue: string;
  changeHelper: string;
  noHelper: string;
  noHelperCta: string;
}

export function Cabinet({
  locale,
  labels,
  playHref,
}: {
  locale: Locale;
  labels: CabinetLabels;
  playHref: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [helperId, setHelperId] = useState<string | null>(null);
  const [stars, setStars] = useState(0);
  const [completed, setCompleted] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setHelperId(loadHelperId());
    const progress = loadProgress();
    const entries = Object.values(progress);
    setCompleted(entries.length);
    setStars(entries.filter((e) => e.correct).length);
    setLoaded(true);
  }, []);

  const helper = getHelper(helperId);

  function changeHelper() {
    removeHelperId();
    router.push(playHref);
  }

  if (!loaded) {
    return (
      <div className="mx-auto h-64 w-full max-w-md animate-pulse rounded-3xl border border-black/[.06] bg-white dark:border-white/10 dark:bg-zinc-900" />
    );
  }

  if (!helper) {
    return (
      <div className="mx-auto w-full max-w-md rounded-3xl border border-black/[.06] bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">{labels.noHelper}</p>
        <Link
          href={playHref}
          className="mt-5 inline-block rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          {labels.noHelperCta}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-black/[.06] bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <span
          className={
            "mx-auto flex h-24 w-24 items-center justify-center rounded-full text-6xl " +
            helperBg[helper.color]
          }
        >
          {helper.emoji}
        </span>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
          {labels.greeting}
        </p>
        <h2 className="text-2xl font-bold">{helper.name[locale]}</h2>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-amber-100 p-4 dark:bg-amber-500/15">
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
              ⭐ {stars}
            </div>
            <div className="mt-1 text-xs font-medium text-amber-700/80 dark:text-amber-300/80">
              {labels.stars}
            </div>
          </div>
          <div className="rounded-2xl bg-indigo-100 p-4 dark:bg-indigo-500/15">
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              {completed}
            </div>
            <div className="mt-1 text-xs font-medium text-indigo-700/80 dark:text-indigo-300/80">
              {labels.completed}
            </div>
          </div>
        </div>

        <Link
          href={playHref}
          className="mt-6 block rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-500"
        >
          {labels.continue}
        </Link>
        <button
          onClick={changeHelper}
          className="mt-3 text-sm font-medium text-zinc-500 hover:text-foreground dark:text-zinc-400"
        >
          {labels.changeHelper}
        </button>
      </div>
    </div>
  );
}
