// Прогрессия и удержание (localStorage). Позже синхронизируется с backend.

const KEY = "izn.study:stats:v1";

export const DAILY_GOAL = 5;
export const FREE_HELPER_COUNT = 6; // первые 6 персонажей бесплатны
export const UNLOCK_COST = 2; // цена разблокировки персонажа в звёздах
export const STARS_PER_LEVEL = 5;

export interface StatsStore {
  streakCount: number;
  lastActiveDate: string | null;
  dailyDate: string | null;
  dailySolved: number;
  unlockedHelpers: string[];
  spentStars: number;
}

const DEFAULT: StatsStore = {
  streakCount: 0,
  lastActiveDate: null,
  dailyDate: null,
  dailySolved: 0,
  unlockedHelpers: [],
  spentStars: 0,
};

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

/** Отмечает активность: обновляет серию дней и дневной счётчик. */
export function recordActivity(): StatsStore {
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

  if (s.dailyDate !== today) {
    s.dailyDate = today;
    s.dailySolved = 0;
  }
  s.dailySolved += 1;

  saveStats(s);
  return s;
}

/** Сегодняшний прогресс к дневной цели (с учётом смены суток). */
export function todayProgress(stats: StatsStore): number {
  return stats.dailyDate === todayStr() ? stats.dailySolved : 0;
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
  subjectsTried: number;
  unlockedCount: number;
}): AchievementState[] {
  return [
    { id: "firstTask", icon: "👣", unlocked: summary.totalSolved >= 1 },
    { id: "stars5", icon: "⭐", unlocked: summary.earnedStars >= 5 },
    { id: "tasks10", icon: "🎯", unlocked: summary.totalSolved >= 10 },
    { id: "streak3", icon: "🔥", unlocked: summary.streak >= 3 },
    { id: "bothSubjects", icon: "🧠", unlocked: summary.subjectsTried >= 2 },
    { id: "unlockHero", icon: "🎁", unlocked: summary.unlockedCount >= 1 },
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
