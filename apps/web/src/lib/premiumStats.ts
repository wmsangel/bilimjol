// Что реально прибавляет премиум — считается из самого контента, а не вписано
// руками: при изменении пейвола (поле free у заданий, premium у игр) цифры на
// странице подписки обновятся сами. Никаких «оценочных» чисел здесь быть не должно.
import { tasks, tests } from "@izn-study/shared";
import { GAME_META } from "./classGames";

export interface PremiumStats {
  /** Заданий доступно без подписки. */
  freeTasks: number;
  /** Заданий всего (с подпиской). */
  totalTasks: number;
  /** Заданий, закрытых без подписки. */
  premiumTasks: number;
  /** Тем, в которых есть закрытые задания. */
  topicsWithPremium: number;
  freeGames: number;
  totalGames: number;
  /** Тесты-тренажёры (не закрыты подпиской). */
  tests: number;
  subjects: number;
  /** Классов, включая подготовку к школе (0). */
  grades: number;
}

export function premiumStats(): PremiumStats {
  const freeTasks = tasks.filter((t) => t.free).length;
  const games = Object.values(GAME_META);
  return {
    freeTasks,
    totalTasks: tasks.length,
    premiumTasks: tasks.length - freeTasks,
    topicsWithPremium: new Set(tasks.filter((t) => !t.free).map((t) => t.topic)).size,
    freeGames: games.filter((g) => !g.premium).length,
    totalGames: games.length,
    tests: tests.length,
    subjects: new Set(tasks.map((t) => t.subject)).size,
    grades: new Set(tasks.map((t) => t.grade)).size,
  };
}
