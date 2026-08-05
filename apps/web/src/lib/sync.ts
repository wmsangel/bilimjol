// Мост между локальным состоянием (localStorage) и сервером.

import { loadProgress, saveProgress } from "./progress";
import { loadStats, saveStats } from "./stats";
import { syncState, type ServerState } from "./api";

export function localSnapshot(): ServerState {
  const stats = loadStats();
  return {
    progress: loadProgress(),
    stats: {
      streakCount: stats.streakCount,
      lastActiveDate: stats.lastActiveDate,
      dailyDate: stats.dailyDate,
      dailySolved: stats.dailySolved,
      unlockedHelpers: stats.unlockedHelpers,
      spentStars: stats.spentStars,
    },
  };
}

export function applyServer(server: ServerState) {
  saveProgress(server.progress);
  saveStats({ ...loadStats(), ...server.stats });
}

/** Двусторонняя синхронизация: заливаем локальное, применяем слитое. */
export async function syncChild(childId: string): Promise<ServerState> {
  const merged = await syncState(childId, localSnapshot());
  applyServer(merged);
  return merged;
}
