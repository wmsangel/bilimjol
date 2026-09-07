// Прогрессия и удержание (localStorage). Позже синхронизируется с backend.

const KEY = "izn.study:stats:v1";

export const DAILY_GOAL = 5;
export const FREE_HELPER_COUNT = 6; // первые 6 персонажей бесплатны
export const UNLOCK_COST = 2; // цена разблокировки персонажа в звёздах
export const STARS_PER_LEVEL = 5;

export interface StatsStore {
  streakCount: number;
  bestStreak: number; // рекорд серии дней
  lastActiveDate: string | null;
  dailyDate: string | null;
  dailySolved: number;
  activeDates: string[]; // ISO активных дней (для недельной полоски), последние ~60
  unlockedHelpers: string[];
  spentStars: number;
  totalAnswered: number; // всего ответов (с повторами)
  totalCorrect: number; // из них верных
  timeSpentSec: number; // суммарное время занятий, сек
}

const DEFAULT: StatsStore = {
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

// Максимум секунд, который засчитываем за один ответ — чтобы вкладка,
// оставленная открытой, не раздувала «время занятий».
const MAX_ANSWER_SEC = 180;

export function loadStats(): StatsStore {
  if (typeof window === "undefined") return { ...DEFAULT };
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...JSON.parse(raw) } : { ...DEFAULT };
  } catch {
    return { ...DEFAULT };
  }
}

export function saveStats(stats: StatsStore): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(stats));
  } catch {
    // игнорируем
  }
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
}

/**
 * Отмечает ответ: серия дней, дневной счётчик и итоговые счётчики
 * (всего/верных/время). `correct`/`durationSec` необязательны для обратной
 * совместимости, но плееры их передают.
 */
export function recordActivity(opts?: {
  correct?: boolean;
  durationSec?: number;
}): StatsStore {
  const s = loadStats();
  const today = todayStr();

  if (s.lastActiveDate !== today) {
    if (s.lastActiveDate && daysBetween(s.lastActiveDate, today) === 1) {
      s.streakCount += 1;
    } else {
      s.streakCount = 1;
    }
    s.lastActiveDate = today;
  } else if (s.streakCount === 0) {
    s.streakCount = 1;
  }
  if (s.streakCount > s.bestStreak) s.bestStreak = s.streakCount;
  if (!s.activeDates.includes(today)) {
    s.activeDates.push(today);
    if (s.activeDates.length > 60) s.activeDates = s.activeDates.slice(-60);
  }

  if (s.dailyDate !== today) {
    s.dailyDate = today;
    s.dailySolved = 0;
  }
  s.dailySolved += 1;

  // Итоговые счётчики.
  s.totalAnswered += 1;
  if (opts?.correct) s.totalCorrect += 1;
  if (opts?.durationSec && opts.durationSec > 0) {
    s.timeSpentSec += Math.min(MAX_ANSWER_SEC, Math.round(opts.durationSec));
  }

  saveStats(s);
  return s;
}

/** «45 мин» / «2 ч 15 мин» — человекочитаемое время из секунд. */
export function formatDuration(sec: number): string {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem ? `${h} ч ${rem} мин` : `${h} ч`;
}

/** Точность в % (0–100), 0 при отсутствии ответов. */
export function accuracyPct(answered: number, correct: number): number {
  return answered > 0 ? Math.round((correct / answered) * 100) : 0;
}

/** Сегодняшний прогресс к дневной цели (с учётом смены суток). */
export function todayProgress(stats: StatsStore): number {
  return stats.dailyDate === todayStr() ? stats.dailySolved : 0;
}

export interface DayCell {
  date: string;
  weekday: string;
  active: boolean;
  today: boolean;
}

const WEEKDAY_SHORT: Record<"ru" | "ky", string[]> = {
  // индекс по getUTCDay(): 0 = воскресенье … 6 = суббота
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  ky: ["Жш", "Дш", "Шш", "Шр", "Бш", "Жм", "Иш"],
};

/** Последние 7 дней (включая сегодня) с отметкой активности — для полоски недели. */
export function lastSevenDays(
  stats: StatsStore,
  locale: "ru" | "ky" = "ru",
): DayCell[] {
  const names = WEEKDAY_SHORT[locale];
  const active = new Set(stats.activeDates);
  const now = new Date();
  const base = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const cells: DayCell[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base - i * 86_400_000);
    const iso = d.toISOString().slice(0, 10);
    cells.push({
      date: iso,
      weekday: names[d.getUTCDay()],
      active: active.has(iso),
      today: i === 0,
    });
  }
  return cells;
}

export function levelInfo(earnedStars: number) {
  const level = Math.floor(earnedStars / STARS_PER_LEVEL) + 1;
  const inLevel = earnedStars % STARS_PER_LEVEL;
  return { level, inLevel, perLevel: STARS_PER_LEVEL };
}

export function isHelperUnlocked(
  id: string,
  index: number,
  stats: StatsStore,
): boolean {
  return index < FREE_HELPER_COUNT || stats.unlockedHelpers.includes(id);
}

export function spendableStars(earnedStars: number, stats: StatsStore): number {
  return earnedStars - stats.spentStars;
}

export interface AchievementState {
  id: string;
  icon: string;
  unlocked: boolean;
}

export function computeAchievements(summary: {
  earnedStars: number;
  totalSolved: number;
  streak: number;
  bestStreak?: number;
  subjectsTried: number;
  unlockedCount: number;
  accuracy?: number;
}): AchievementState[] {
  const bestStreak = Math.max(summary.streak, summary.bestStreak ?? 0);
  return [
    { id: "firstTask", icon: "👣", unlocked: summary.totalSolved >= 1 },
    { id: "stars5", icon: "⭐", unlocked: summary.earnedStars >= 5 },
    { id: "tasks10", icon: "🎯", unlocked: summary.totalSolved >= 10 },
    { id: "streak3", icon: "🔥", unlocked: bestStreak >= 3 },
    { id: "bothSubjects", icon: "🧠", unlocked: summary.subjectsTried >= 2 },
    { id: "unlockHero", icon: "🎁", unlocked: summary.unlockedCount >= 1 },
    { id: "stars25", icon: "🏅", unlocked: summary.earnedStars >= 25 },
    { id: "tasks50", icon: "🚀", unlocked: summary.totalSolved >= 50 },
    { id: "streak7", icon: "📅", unlocked: bestStreak >= 7 },
    {
      id: "sharpshooter",
      icon: "🎓",
      unlocked: (summary.accuracy ?? 0) >= 90 && summary.totalSolved >= 20,
    },
  ];
}

/** Разблокирует персонажа, списывая звёзды. Возвращает обновлённую статистику. */
export function unlockHelper(id: string): StatsStore {
  const s = loadStats();
  if (!s.unlockedHelpers.includes(id)) {
    s.unlockedHelpers.push(id);
    s.spentStars += UNLOCK_COST;
    saveStats(s);
  }
  return s;
}
