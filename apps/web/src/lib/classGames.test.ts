import { describe, expect, it } from "vitest";
import { GAME_META, gamesForGrade } from "./classGames";
import type { GameId } from "./classGames";

const GAME_IDS: GameId[] = [
  "memory",
  "sprint",
  "bubbles",
  "trace",
  "build",
  "pattern",
  "word",
  "groups",
  "clock",
  "compare",
  "shadow",
];

describe("gamesForGrade", () => {
  it("даёт две игры на класс: первая бесплатная, вторая премиум", () => {
    const expected: Record<number, [GameId, GameId]> = {
      0: ["shadow", "groups"],
      1: ["trace", "word"],
      2: ["sprint", "clock"],
      3: ["compare", "build"],
      4: ["sprint", "memory"],
      5: ["pattern", "bubbles"],
      6: ["pattern", "bubbles"],
      7: ["sprint", "build"],
      8: ["sprint", "build"],
      9: ["sprint", "build"],
      10: ["pattern", "memory"],
      11: ["pattern", "memory"],
    };

    for (const [grade, [freeId, premiumId]] of Object.entries(expected)) {
      const games = gamesForGrade(Number(grade));
      expect(games).toHaveLength(2);
      expect(games.map((game) => game.id)).toEqual([freeId, premiumId]);
      expect(games[0].premium).toBe(false);
      expect(games[1].premium).toBe(true);
    }
  });
});

describe("GAME_META", () => {
  it("ключи совпадают с GameId, id записи равен ключу, slug уникальны", () => {
    expect(Object.keys(GAME_META).sort()).toEqual([...GAME_IDS].sort());
    for (const id of GAME_IDS) {
      expect(GAME_META[id].id).toBe(id);
    }
    const slugs = Object.values(GAME_META).map((game) => game.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
