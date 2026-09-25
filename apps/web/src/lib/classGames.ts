// Игры по классам (задача Н10). У каждого класса — 2 игры: первая бесплатная,
// вторая — только по премиуму. Чтобы одна и та же игра не была где-то free, а
// где-то премиум, роли зафиксированы глобально:
//   бесплатные: Обводилки (trace), Быстрый счёт (sprint);
//   премиум:    Мемори (memory), Лови правильные (bubbles), Собери пример (build).

export type GameId = "memory" | "sprint" | "bubbles" | "trace" | "build";

export interface GameMeta {
  id: GameId;
  slug: string; // путь без языка, напр. "/games/memory"
  icon: string;
  title: { ru: string; ky: string };
  premium: boolean;
}

export const GAME_META: Record<GameId, GameMeta> = {
  trace: {
    id: "trace",
    slug: "/games/trace",
    icon: "✏️",
    title: { ru: "Обводилки", ky: "Сызуучулар" },
    premium: false,
  },
  sprint: {
    id: "sprint",
    slug: "/games/sprint",
    icon: "⚡",
    title: { ru: "Быстрый счёт", ky: "Ылдам эсеп" },
    premium: false,
  },
  memory: {
    id: "memory",
    slug: "/games/memory",
    icon: "🧠",
    title: { ru: "Мемори", ky: "Мемори" },
    premium: true,
  },
  bubbles: {
    id: "bubbles",
    slug: "/games/bubbles",
    icon: "🎈",
    title: { ru: "Лови правильные", ky: "Туурасын кар" },
    premium: true,
  },
  build: {
    id: "build",
    slug: "/games/build",
    icon: "🧮",
    title: { ru: "Собери пример", ky: "Мисал түз" },
    premium: true,
  },
};

/** Все игры, доступные только по премиуму (для гейта на страницах игр). */
export const PREMIUM_GAME_IDS: GameId[] = (Object.values(GAME_META) as GameMeta[])
  .filter((g) => g.premium)
  .map((g) => g.id);

export function isPremiumGame(id: string): boolean {
  return (PREMIUM_GAME_IDS as string[]).includes(id);
}

/** Две игры класса: [бесплатная, премиум] — подобраны по возрасту. */
export function gamesForGrade(grade: number): [GameMeta, GameMeta] {
  if (grade <= 1) return [GAME_META.trace, GAME_META.memory];
  if (grade <= 4) return [GAME_META.sprint, GAME_META.bubbles];
  return [GAME_META.sprint, GAME_META.build];
}
