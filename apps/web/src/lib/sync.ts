// Мост между локальным состоянием (localStorage) и сервером.

import { loadProgress, saveProgress } from "./progress";
import { loadStats, saveStats } from "./stats";
import { loadOutfit, saveOutfit } from "./wardrobe";
import { loadHelperId, saveHelperId } from "./prefs";
import { syncState, type ServerState, type SyncSnapshot } from "./api";

export function localSnapshot(): SyncSnapshot {
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
    outfit: loadOutfit() as Record<string, string>,
    avatarHelperId: loadHelperId() ?? undefined,
  };
}

export function applyServer(server: ServerState) {
  saveProgress(server.progress);
  saveStats({ ...loadStats(), ...server.stats });
  if (server.outfit) saveOutfit(server.outfit);
  if (server.helperId) saveHelperId(server.helperId);
}

/** Двусторонняя синхронизация: заливаем локальное, применяем слитое. */
export async function syncChild(childId: string): Promise<ServerState> {
  const merged = await syncState(childId, localSnapshot());
  applyServer(merged);
  return merged;
}
