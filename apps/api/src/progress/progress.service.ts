import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import type { StatsDto, SyncDto } from "./dto";

const DEFAULT_STATS: StatsDto = {
  streakCount: 0,
  lastActiveDate: null,
  dailyDate: null,
  dailySolved: 0,
  unlockedHelpers: [],
  spentStars: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  timeSpentSec: 0,
};

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertOwned(userId: string, childId: string) {
    const child = await this.prisma.childProfile.findUnique({
      where: { id: childId },
    });
    if (!child || child.userId !== userId) {
      throw new NotFoundException("Профиль ребёнка не найден");
    }
    return child;
  }

  async getState(userId: string, childId: string) {
    const child = await this.assertOwned(userId, childId);
    const [rows, stats] = await Promise.all([
      this.prisma.progress.findMany({ where: { childId } }),
      this.prisma.childStats.findUnique({ where: { childId } }),
    ]);
    const progress: Record<string, { correct: boolean }> = {};
    for (const r of rows) progress[r.taskId] = { correct: r.correct };
    return {
      progress,
      stats: this.toStatsDto(stats),
      outfit: (child.outfit as Record<string, string> | null) ?? {},
      helperId: child.avatarHelperId,
    };
  }

  async sync(userId: string, childId: string, body: SyncDto) {
    await this.assertOwned(userId, childId);

    // Слияние прогресса: результат монотонен (OR по correct).
    const existing = await this.prisma.progress.findMany({ where: { childId } });
    const exMap = new Map(existing.map((e) => [e.taskId, e.correct]));
    const ops = Object.entries(body.progress).map(([taskId, r]) => {
      const merged = (exMap.get(taskId) ?? false) || r.correct;
      return this.prisma.progress.upsert({
        where: { childId_taskId: { childId, taskId } },
        create: { childId, taskId, correct: merged },
        update: { correct: merged },
      });
    });
    if (ops.length > 0) await this.prisma.$transaction(ops);

    // Слияние статистики.
    const serverStats = this.toStatsDto(
      await this.prisma.childStats.findUnique({ where: { childId } }),
    );
    const merged = this.mergeStats(serverStats, body.stats);
    await this.prisma.childStats.upsert({
      where: { childId },
      create: { childId, ...merged },
      update: merged,
    });

    // Наряд и герой: не даём пустому клиенту (новое устройство) затереть сервер.
    const profileUpdate: { outfit?: object; avatarHelperId?: string } = {};
    if (body.outfit && Object.keys(body.outfit).length > 0) profileUpdate.outfit = body.outfit;
    if (body.avatarHelperId) profileUpdate.avatarHelperId = body.avatarHelperId;
    if (Object.keys(profileUpdate).length > 0) {
      await this.prisma.childProfile.update({ where: { id: childId }, data: profileUpdate });
    }

    return this.getState(userId, childId);
  }

  private toStatsDto(
    s: {
      streakCount: number;
      lastActiveDate: string | null;
      dailyDate: string | null;
      dailySolved: number;
      unlockedHelpers: string[];
      spentStars: number;
      totalAnswered: number;
      totalCorrect: number;
      timeSpentSec: number;
    } | null,
  ): StatsDto {
    if (!s) return { ...DEFAULT_STATS };
    return {
      streakCount: s.streakCount,
      lastActiveDate: s.lastActiveDate,
      dailyDate: s.dailyDate,
      dailySolved: s.dailySolved,
      unlockedHelpers: s.unlockedHelpers,
      spentStars: s.spentStars,
      totalAnswered: s.totalAnswered,
      totalCorrect: s.totalCorrect,
      timeSpentSec: s.timeSpentSec,
    };
  }

  private mergeStats(s: StatsDto, c: StatsDto): StatsDto {
    const later = (a?: string | null, b?: string | null) =>
      (a ?? "") >= (b ?? "") ? a ?? null : b ?? null;

    // Дневная цель: берём запись с более поздней датой, при равенстве — max.
    let dailyDate = s.dailyDate ?? null;
    let dailySolved = s.dailySolved;
    if ((c.dailyDate ?? "") > (s.dailyDate ?? "")) {
      dailyDate = c.dailyDate ?? null;
      dailySolved = c.dailySolved;
    } else if ((c.dailyDate ?? "") === (s.dailyDate ?? "")) {
      dailySolved = Math.max(s.dailySolved, c.dailySolved);
    }

    return {
      streakCount: Math.max(s.streakCount, c.streakCount),
      lastActiveDate: later(s.lastActiveDate, c.lastActiveDate),
      dailyDate,
      dailySolved,
      unlockedHelpers: [
        ...new Set([...s.unlockedHelpers, ...c.unlockedHelpers]),
      ],
      spentStars: Math.max(s.spentStars, c.spentStars),
      // Счётчики монотонно растут — берём максимум (защита от отставшего клиента).
      totalAnswered: Math.max(s.totalAnswered, c.totalAnswered),
      totalCorrect: Math.max(s.totalCorrect, c.totalCorrect),
      timeSpentSec: Math.max(s.timeSpentSec, c.timeSpentSec),
    };
  }
}
