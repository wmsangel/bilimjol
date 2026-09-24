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
  lastSevenDays,
  levelInfo,
  loadStats,
  spendableStars,
  todayProgress,
  type StatsStore,
} from "@/lib/stats";
import { getEntitlement, loadAuth, loadChildId } from "@/lib/api";
import { syncChild } from "@/lib/sync";
import { helperGradient } from "@/lib/helperTheme";
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
  bestStreak: string;
  weekTitle: string;
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
  bestStreak: 0,
  lastActiveDate: null,
  dailyDate: null,
  dailySolved: 0,
  activeDates: [],
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
      <div className="mx-auto h-64 w-full max-w-md animate-pulse rounded-[28px] bg-white shadow-sm" />
    );
  }

  if (!helper) {
    return (
      <div className="mx-auto w-full max-w-md rounded-[28px] bg-white p-8 text-center shadow-[0_8px_24px_rgba(25,21,57,.06)]">
        <p className="text-[#5c5880]">{labels.noHelper}</p>
        <Link
          href={playHref}
          className="mt-5 inline-block rounded-full bg-[#6d5cf7] px-6 py-3.5 font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:shadow-[0_0_0_3px_#e6c079]"
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
    bestStreak: stats.bestStreak,
    subjectsTried,
    unlockedCount: stats.unlockedHelpers.length,
    accuracy: accuracyPct(stats.totalAnswered, stats.totalCorrect),
  });
  const week = lastSevenDays(stats, locale);
  const card = "rounded-3xl bg-white p-6 shadow-[0_8px_24px_rgba(25,21,57,.06)]";

  return (
    <div className="mx-auto grid w-full max-w-5xl items-start gap-6 font-sans text-[#191539] lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* Левая колонка */}
      <div className="flex flex-col gap-4">
        {/* Тёмная hero-карточка */}
        <div className="relative flex flex-col gap-5 overflow-hidden rounded-[28px] bg-[#191539] p-6 text-white xl:flex-row xl:items-center xl:gap-6">
          <div className="pointer-events-none absolute right-[-60px] top-[-80px] h-[260px] w-[260px] rounded-full bg-[#6d5cf7] opacity-40 blur-[60px]" />
          <div
            className={
              "relative flex h-[120px] w-[120px] flex-none items-center justify-center overflow-hidden rounded-full bg-gradient-to-br " +
              (helperGradient[helper.color] ?? "from-[#8577ff] to-[#6d5cf7]")
            }
          >
            <Mascot helper={helper} mood="idle" size="md" />
          </div>
          <div className="relative flex-1">
            <div className="text-[15px] font-bold text-[#d9d5f5]">{labels.greeting}</div>
            <div className="mb-3.5 mt-1 font-display text-[26px] font-bold">{helper.name[locale]}</div>
            <div className="mb-1.5 flex justify-between text-sm font-extrabold">
              <span>{labels.level} {level}</span>
              <span className="text-[#e6c079]">{inLevel}/{perLevel} ⭐</span>
            </div>
            <div className="h-2.5 rounded-full bg-white/[.12]">
              <div className="h-2.5 rounded-full bg-[#e6c079]" style={{ width: `${(inLevel / perLevel) * 100}%` }} />
            </div>
          </div>
          <Link
            href={playHref}
            className="relative w-full rounded-full bg-[#6d5cf7] px-6 py-4 text-center font-extrabold text-white shadow-[0_0_0_3px_#e6c079] transition hover:-translate-y-0.5 xl:w-auto"
          >
            ▶ {labels.continue}
          </Link>
        </div>

        {/* Плитки: звёзды, серия, пройдено */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-[22px] bg-[#fbf3e3] p-4 text-[#7a5a1e]">
            <div className="font-display text-[30px] font-bold leading-none">{spendable}</div>
            <div className="mt-1 text-sm font-extrabold">⭐ {labels.stars}</div>
          </div>
          <div className="rounded-[22px] bg-[#ffedd5] p-4 text-[#9a3412]">
            <div className="font-display text-[30px] font-bold leading-none">{stats.streakCount}</div>
            <div className="mt-1 text-sm font-extrabold">🔥 {labels.streak}</div>
          </div>
          <div className="rounded-[22px] bg-[#efecff] p-4 text-[#4b3cc9]">
            <div className="font-display text-[30px] font-bold leading-none">{totalSolved}</div>
            <div className="mt-1 text-sm font-extrabold">✅ {labels.completed}</div>
          </div>
        </div>

        {/* Цель + неделя | Достижения */}
        <div className="grid items-start gap-4 md:grid-cols-2">
          <div className={card}>
            <div className="mb-2.5 flex justify-between text-sm font-extrabold">
              <span>{labels.daily}</span>
              <span className="text-[#5c5880]">{daily}/{DAILY_GOAL}</span>
            </div>
            <div className="mb-4 h-3 rounded-full bg-[#efecff]">
              <div className="h-3 rounded-full bg-[#34d399] transition-all" style={{ width: `${dailyPct}%` }} />
            </div>
            {daily >= DAILY_GOAL && (
              <p className="mb-3 text-sm font-bold text-[#059669]">{labels.dailyDone}</p>
            )}
            <div className="mb-2.5 flex items-center justify-between text-sm font-extrabold">
              <span>{labels.weekTitle}</span>
              {stats.bestStreak > 0 && (
                <span className="text-[13px] text-[#c2410c]">🔥 {labels.bestStreak}: {stats.bestStreak}</span>
              )}
            </div>
            <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-extrabold text-[#5c5880]">
              {week.map((d) => (
                <div key={d.date}>
                  <div
                    className={
                      "mb-1 flex h-[34px] items-center justify-center rounded-[10px] text-[15px] " +
                      (d.active ? "bg-[#fb923c]" : "bg-[#efecff]") +
                      (d.today ? " shadow-[0_0_0_2px_#fff,0_0_0_4px_#6d5cf7]" : "")
                    }
                  >
                    {d.active ? "🔥" : ""}
                  </div>
                  <span className={d.today ? "text-[#6d5cf7]" : ""}>{d.weekday}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={card}>
            <div className="mb-3 text-sm font-extrabold">{labels.achievementsTitle}</div>
            <div className="grid grid-cols-3 gap-2">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className={
                    "rounded-2xl p-2.5 text-center " +
                    (a.unlocked ? "border-[1.5px] border-[#e6c079] bg-[#fbf3e3]" : "bg-[#f7f5ff] opacity-50")
                  }
                >
                  <div className={"text-[22px] " + (a.unlocked ? "" : "grayscale")}>{a.icon}</div>
                  <div className="text-[11px] font-extrabold leading-tight">{achievementsLabels[a.id] ?? a.id}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Мелочи: сменить героя / отчёт */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-semibold text-[#5c5880]">
          <button onClick={changeHelper} className="hover:text-[#6d5cf7]">{labels.changeHelper}</button>
          <span className="text-[#d9d5f5]">·</span>
          <Link href={parentHref} className="hover:text-[#6d5cf7]">📊 {accountLabels.parentReport}</Link>
          {email && premiumUntil && (
            <>
              <span className="text-[#d9d5f5]">·</span>
              <span className="rounded-full bg-[#fbf3e3] px-3 py-1 text-xs font-bold text-[#7a5a1e]">⭐ {labels.premiumActive} {fmtDate(premiumUntil)}</span>
            </>
          )}
        </div>
      </div>

      {/* Правый рельс */}
      <div className="flex flex-col gap-4">
        {/* Что нового */}
        <div className={card + " p-[22px]"}>
          <div className="mb-3 flex items-center gap-2 font-display text-[17px] font-bold">
            {labels.newsTitle}
            {unseenNews > 0 && (
              <span className="rounded-full bg-[#6d5cf7] px-2 py-0.5 font-sans text-xs font-bold text-white">{unseenNews}</span>
            )}
          </div>
          <ul className="flex flex-col gap-3 text-sm">
            {news.slice(0, 4).map((n) => {
              const isNew = prevSeen == null || n.date > prevSeen;
              const inner = (
                <span className="flex items-start gap-2.5">
                  <span className="text-lg leading-none">{n.emoji}</span>
                  <span className={"flex-1 " + (isNew ? "text-[#191539]" : "text-[#5c5880]")}>{n.title[locale]}</span>
                  {isNew && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-[#6d5cf7]" />}
                </span>
              );
              return (
                <li key={n.date + n.emoji}>
                  {n.href ? (
                    <Link href={`/${locale}${n.href}`} className="-mx-2 block rounded-xl px-2 py-1 transition hover:bg-[#f7f5ff]">{inner}</Link>
                  ) : (
                    <div className="py-1">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Куда дальше */}
        <div className={card + " p-[22px]"}>
          <div className="mb-3 font-display text-[17px] font-bold">{labels.nextTitle}</div>
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
                className="flex items-center gap-3 rounded-2xl bg-[#f7f5ff] px-3.5 py-3 text-[15px] font-extrabold text-[#191539] transition hover:shadow-[0_0_0_2px_#e6e1ff]"
              >
                <span className="text-xl">{r.icon}</span>
                {r.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Premium промо / вход */}
        {premiumUntil ? null : (
          <div className="rounded-[22px] bg-[#e6c079] p-[22px]">
            <div className="mb-1.5 font-display text-[17px] font-bold text-[#191539]">
              {locale === "ky" ? "Бардык тапшырмаларды ач" : "Открой все задания"}
            </div>
            <div className="mb-3.5 text-sm text-[#3d3420]">
              {locale === "ky" ? "Бардык класстар, предметтер жана отчёт — Premiumда." : "Все классы, предметы и отчёт — в Premium."}
            </div>
            <Link
              href={email ? `/${locale}/subscribe` : loginHref}
              className="block rounded-full bg-[#191539] py-3 text-center font-extrabold text-white transition hover:brightness-125"
            >
              {labels.subscribe}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
