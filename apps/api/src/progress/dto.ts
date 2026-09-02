import { z } from "zod";

export const statsSchema = z.object({
  streakCount: z.number().int().min(0),
  lastActiveDate: z.string().nullable().optional(),
  dailyDate: z.string().nullable().optional(),
  dailySolved: z.number().int().min(0),
  unlockedHelpers: z.array(z.string()),
  spentStars: z.number().int().min(0),
  // Счётчики-итоги (optional + default — старые клиенты их не шлют).
  totalAnswered: z.number().int().min(0).default(0),
  totalCorrect: z.number().int().min(0).default(0),
  timeSpentSec: z.number().int().min(0).default(0),
});
export type StatsDto = z.infer<typeof statsSchema>;

export const syncSchema = z.object({
  progress: z.record(z.object({ correct: z.boolean() })),
  stats: statsSchema,
  outfit: z.record(z.string()).optional(),
  avatarHelperId: z.string().max(40).optional(),
});
export type SyncDto = z.infer<typeof syncSchema>;
