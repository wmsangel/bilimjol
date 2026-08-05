import { z } from "zod";

export const statsSchema = z.object({
  streakCount: z.number().int().min(0),
  lastActiveDate: z.string().nullable().optional(),
  dailyDate: z.string().nullable().optional(),
  dailySolved: z.number().int().min(0),
  unlockedHelpers: z.array(z.string()),
  spentStars: z.number().int().min(0),
});
export type StatsDto = z.infer<typeof statsSchema>;

export const syncSchema = z.object({
  progress: z.record(z.object({ correct: z.boolean() })),
  stats: statsSchema,
});
export type SyncDto = z.infer<typeof syncSchema>;
