import { describe, it, expect } from "vitest";
import { tasks } from "@izn-study/shared";
import { GAME_META } from "./classGames";
import { premiumStats } from "./premiumStats";

describe("premiumStats — цифры страницы подписки берутся из контента", () => {
  const s = premiumStats();

  it("бесплатные + закрытые = все задания", () => {
    expect(s.freeTasks + s.premiumTasks).toBe(s.totalTasks);
    expect(s.totalTasks).toBe(tasks.length);
  });

  it("премиум действительно что-то добавляет (иначе блок «что прибавится» врёт)", () => {
    expect(s.premiumTasks).toBeGreaterThan(0);
    expect(s.totalGames).toBeGreaterThan(s.freeGames);
    expect(s.topicsWithPremium).toBeGreaterThan(0);
  });

  it("игры считаются по GAME_META", () => {
    expect(s.totalGames).toBe(Object.keys(GAME_META).length);
  });

  it("классы включают подготовку к школе и 11 класс", () => {
    expect(s.grades).toBeGreaterThanOrEqual(12);
  });
});
