"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getHelper,
  news,
  tasks as allTasks,
  unseenNewsCount,
  type Locale,
} from "@izn-study/shared";
import { loadProgress } from "@/lib/progress";
import { loadHelperId, removeHelperId } from "@/lib/prefs";
import {
  accuracyPct,
  computeAchievements,
  DAILY_GOAL,
  formatDuration,
  levelInfo,
  loadStats,
  spendableStars,
  todayProgress,
  type StatsStore,
} from "@/lib/stats";
import { getEntitlement, loadAuth, loadChildId } from "@/lib/api";
import { syncChild } from "@/lib/sync";
import { Mascot } from "./Mascot";

export interface AccountLabels {
  loggedInAs: string;
  logout: string;
  login: string;
  parentReport: string;
}

export interface CabinetLabels {
  title: string;
  greeting: string;
  stars: string;
  completed: string;
  continue: string;
  changeHelper: string;
  noHelper: string;
  noHelperCta: string;
  level: string;
  streak: string;
  daily: string;
  dailyDone: string;
  statsTitle: string;
  newsTitle: string;
  nextTitle: string;
  nextPlay: string;
  nextGames: string;
  nextWardrobe: string;
  answers: string;
  correct: string;
  incorrect: string;
  accuracy: string;
  timeSpent: string;
  achievementsTitle: string;
  premiumActive: string;
  subscribe: string;
}

const EMPTY_STATS: StatsStore = {
  streakCount: 0,
  lastActiveDate: null,
  dailyDate: null,
  dailySolved: 0,
  unlockedHelpers: [],
  spentStars: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  timeSpentSec: 0,
};

const subjectOf = (id: string) => allTasks.find((t) => t.id === id)?.subject;

export function Cabinet({
  locale,
  labels,
  achievementsLabels,
  accountLabels,
  loginHref,
  parentHref,
  playHref,
}: {
  locale: Locale;
  labels: CabinetLabels;
  achievementsLabels: Record<string, string>;
  accountLabels: AccountLabels;
  loginHref: string;
  parentHref: string;
  playHref: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [helperId, setHelperId] = useState<string | null>(null);
  const [stats, setStats] = useState<StatsStore>(EMPTY_STATS);
  const [earnedStars, setEarnedStars] = useState(0);
  const [totalSolved, setTotalSolved] = useState(0);
  const [subjectsTried, setSubjectsTried] = useState(0);
  const [email, setEmail] = useState<string | null>(null);
  const [premiumUntil, setPremiumUntil] = useState<string | null>(null);
  const [prevSeen, setPrevSeen] = useState<string | null>(null);
  const [unseenNews, setUnseenNews] = useState(0);
  const router = useRouter();

  function loadAll() {
    setHelperId(loadHelperId());
    setStats(loadStats());
    const entries = Object.entries(loadProgress());
    setTotalSolved(entries.length);
    setEarnedStars(entries.filter(([, r]) => r.correct).length);
    setSubjectsTried(
      new Set(entries.map(([id]) => subjectOf(id)).filter(Boolean)).size,
    );
  }

  useEffect(() => {
    loadAll();
    const auth = loadAuth();
    setEmail(auth?.user.email ?? null);
    setLoaded(true);

    // Если вошли — подтягиваем прогресс и статус подписки с сервера.
    const childId = loadChildId();
    if (auth && childId) {
      syncChild(childId)
        .then(() => loadAll())
        .catch(() => undefined);
    }
    if (auth) {
      getEntitlement()
        .then((e) => setPremiumUntil(e.premium ? e.until : null))
        .catch(() => undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Лента «Что нового»: считаем непрочитанное и отмечаем просмотренным.
  useEffect(() => {
    let seen: string | null = null;
    try {
      seen = window.localStorage.getItem("izn.study:news-seen:v1");
    } catch {
      /* ignore */
    }
    setPrevSeen(seen);
    setUnseenNews(unseenNewsCount(seen));
    const latest = news[0]?.date;
    if (latest) {
      try {
        window.localStorage.setItem("izn.study:news-seen:v1", latest);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const helper = getHelper(helperId);

  function changeHelper() {
    removeHelperId();
    router.push(playHref);
  }

  const fmtDate = (iso: string | null) =>
    iso ? new Date(iso).toLocaleDateString(locale === "ky" ? "ky-KG" : "ru-RU") : "";

  if (!loaded) {
    return (
      <div className="mx-auto h-64 w-full max-w-md animate-pulse rounded-[2rem] border border-black/[.06] bg-white dark:border-white/10 dark:bg-zinc-900" />
    );
  }

  if (!helper) {
    return (
      <div className="mx-auto w-full max-w-md rounded-[2rem] border border-black/[.06] bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">{labels.noHelper}</p>
        <Link
          href={playHref}
          className="mt-5 inline-block rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
        >
          {labels.noHelperCta}
        </Link>
      </div>
    );
  }

  const spendable = spendableStars(earnedStars, stats);
  const { level, inLevel, perLevel } = levelInfo(earnedStars);
  const daily = todayProgress(stats);
  const dailyPct = Math.min(100, (daily / DAILY_GOAL) * 100);
  const achievements = computeAchievements({
    earnedStars,
    totalSolved,
    streak: stats.streakCount,
    subjectsTried,
    unlockedCount: stats.unlockedHelpers.length,
  });

  return (
    <div className="mx-auto grid w-full max-w-4xl items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      {/* Зона 1 — прогресс */}
      <div>
      <div className="mb-4 flex justify-center">
        <Mascot helper={helper} mood="idle" size="lg" />
      </div>

      <div className="rounded-[2rem] border border-black/[.06] bg-white p-6 shadow-xl dark:border-white/10 dark:bg-zinc-900">
        <div className="text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {labels.greeting}
          </p>
          <h2 className="font-display text-2xl font-extrabold">
            {helper.name[locale]}
          </h2>
        </div>

        {/* Уровень */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-sm font-bold">
            <span>
              {labels.level} {level}
            </span>
            <span className="text-zinc-400">
              {inLevel}/{perLevel} ⭐
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
              style={{ width: `${(inLevel / perLevel) * 100}%` }}
            />
          </div>
        </div>

        {/* Плитки: звёзды, серия, пройдено */}
        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-200 p-3 text-center dark:from-amber-500/15 dark:to-yellow-500/10">
            <div className="font-display text-2xl font-extrabold text-amber-700 dark:text-amber-300">
              {spendable}
            </div>
            <div className="mt-0.5 text-[11px] font-semibold text-amber-700/80 dark:text-amber-300/80">
              ⭐ {labels.stars}
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-orange-100 to-red-200 p-3 text-center dark:from-orange-500/15 dark:to-red-500/10">
            <div className="font-display text-2xl font-extrabold text-orange-700 dark:text-orange-300">
              {stats.streakCount}
            </div>
            <div className="mt-0.5 text-[11px] font-semibold text-orange-700/80 dark:text-orange-300/80">
              🔥 {labels.streak}
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-200 p-3 text-center dark:from-indigo-500/15 dark:to-violet-500/10">
            <div className="font-display text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">
              {totalSolved}
            </div>
            <div className="mt-0.5 text-[11px] font-semibold text-indigo-700/80 dark:text-indigo-300/80">
              ✅ {labels.completed}
            </div>
          </div>
        </div>

        {/* Дневная цель */}
        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between text-sm font-bold">
            <span>{labels.daily}</span>
            <span className="text-zinc-400">
              {daily}/{DAILY_GOAL}
            </span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all"
              style={{ width: `${dailyPct}%` }}
            />
          </div>
          {daily >= DAILY_GOAL && (
            <p className="mt-2 text-center text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {labels.dailyDone}
            </p>
          )}
        </div>

        {/* Статистика */}
        <div className="mt-6">
          <p className="mb-2 text-sm font-bold">{labels.statsTitle}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-black/[.03] p-3 text-center dark:bg-white/[.04]">
              <div className="font-display text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {accuracyPct(stats.totalAnswered, stats.totalCorrect)}%
              </div>
              <div className="mt-0.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                🎯 {labels.accuracy}
              </div>
            </div>
            <div className="rounded-2xl bg-black/[.03] p-3 text-center dark:bg-white/[.04]">
              <div className="font-display text-2xl font-extrabold text-sky-600 dark:text-sky-400">
                {formatDuration(stats.timeSpentSec)}
              </div>
              <div className="mt-0.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
                ⏱️ {labels.timeSpent}
              </div>
            </div>
          </div>
          <p className="mt-2 text-center text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {labels.answers}: {stats.totalAnswered} · {labels.correct}:{" "}
            {stats.totalCorrect} · {labels.incorrect}:{" "}
            {Math.max(0, stats.totalAnswered - stats.totalCorrect)}
          </p>
        </div>

        {/* Достижения */}
        <div className="mt-6">
          <h3 className="mb-3 font-display text-lg font-bold">
            {labels.achievementsTitle}
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={
                  "flex flex-col items-center gap-1 rounded-2xl border p-3 text-center transition " +
                  (a.unlocked
                    ? "border-amber-300 bg-amber-50 dark:border-amber-500/40 dark:bg-amber-500/10"
                    : "border-black/[.06] opacity-45 grayscale dark:border-white/10")
                }
              >
                <span className="text-2xl">{a.icon}</span>
                <span className="text-[11px] font-semibold leading-tight">
                  {achievementsLabels[a.id] ?? a.id}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Link
          href={playHref}
          className="mt-6 block rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 text-center text-lg font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 active:scale-[.98]"
        >
          {labels.continue}
        </Link>
        <button
          onClick={changeHelper}
          className="mt-3 w-full text-sm font-semibold text-zinc-500 hover:text-foreground dark:text-zinc-400"
        >
          {labels.changeHelper}
        </button>

        {/* Подписка */}
        {email && (
          <div className="mt-5 border-t border-black/[.06] pt-4 text-center dark:border-white/10">
            {premiumUntil ? (
              <span className="inline-block rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 px-3 py-1 text-xs font-bold text-amber-900">
                ⭐ {labels.premiumActive} {fmtDate(premiumUntil)}
              </span>
            ) : (
              <Link
                href={`/${locale}/subscribe`}
                className="inline-block rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110 active:scale-[.98]"
              >
                {labels.subscribe}
              </Link>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Зоны 2–3 — справа: новинки и «куда дальше» */}
      <div className="flex flex-col gap-4">
      {/* Что нового */}
      <div className="rounded-[2rem] border border-black/[.06] bg-white p-5 shadow-xl dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-3 flex items-center gap-2">
          <h3 className="font-display text-base font-bold">
            🆕 {labels.newsTitle}
          </h3>
          {unseenNews > 0 && (
            <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-bold text-white">
              {unseenNews}
            </span>
          )}
        </div>
        <ul className="space-y-1">
          {news.slice(0, 4).map((n) => {
            const isNew = prevSeen == null || n.date > prevSeen;
            const inner = (
              <span className="flex items-start gap-2.5">
                <span className="text-lg leading-none">{n.emoji}</span>
                <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-300">
                  {n.title[locale]}
                </span>
                {isNew && (
                  <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-rose-500" />
                )}
              </span>
            );
            return (
              <li key={n.date + n.emoji}>
                {n.href ? (
                  <Link
                    href={`/${locale}${n.href}`}
                    className="-mx-2 block rounded-xl px-2 py-1.5 transition hover:bg-black/[.03] dark:hover:bg-white/5"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div className="px-0 py-1.5">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      {/* Куда дальше — рекомендации (двигатель гринда) */}
      <div className="rounded-[2rem] border border-black/[.06] bg-white p-5 shadow-xl dark:border-white/10 dark:bg-zinc-900">
        <h3 className="mb-3 font-display text-base font-bold">
          🚀 {labels.nextTitle}
        </h3>
        <div className="flex flex-col gap-2">
          {(
            [
              { href: `/${locale}/play`, icon: "🎮", label: labels.nextPlay },
              { href: `/${locale}/games`, icon: "🧩", label: labels.nextGames },
              { href: `/${locale}/wardrobe`, icon: "👕", label: labels.nextWardrobe },
            ] as const
          ).map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="flex items-center gap-3 rounded-2xl bg-black/[.03] px-3 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-black/[.06] dark:bg-white/[.04] dark:text-zinc-200 dark:hover:bg-white/10"
            >
              <span className="text-lg">{r.icon}</span>
              {r.label}
            </Link>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}
