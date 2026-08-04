"use client";

import { useEffect, useState } from "react";
import { helpers, type Locale } from "@izn-study/shared";
import type { Helper } from "@izn-study/shared";
import { Face } from "./Face";
import {
  isHelperUnlocked,
  loadStats,
  spendableStars,
  unlockHelper,
  UNLOCK_COST,
  type StatsStore,
} from "@/lib/stats";

const EMPTY_STATS: StatsStore = {
  streakCount: 0,
  lastActiveDate: null,
  dailyDate: null,
  dailySolved: 0,
  unlockedHelpers: [],
  spentStars: 0,
};

export function HelperPicker({
  locale,
  selectedId,
  onSelect,
  earnedStars,
  unlockForLabel,
  notEnoughLabel,
}: {
  locale: Locale;
  selectedId?: string | null;
  onSelect: (helper: Helper) => void;
  earnedStars: number;
  unlockForLabel: string;
  notEnoughLabel: string;
}) {
  const [stats, setStats] = useState<StatsStore>(EMPTY_STATS);
  const [deniedId, setDeniedId] = useState<string | null>(null);

  useEffect(() => setStats(loadStats()), []);

  const spendable = spendableStars(earnedStars, stats);

  function handleClick(helper: Helper, index: number) {
    if (isHelperUnlocked(helper.id, index, stats)) {
      onSelect(helper);
      return;
    }
    if (spendable >= UNLOCK_COST) {
      setStats(unlockHelper(helper.id));
      onSelect(helper);
    } else {
      setDeniedId(helper.id);
      setTimeout(() => setDeniedId((d) => (d === helper.id ? null : d)), 1200);
    }
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {helpers.map((helper, index) => {
        const active = helper.id === selectedId;
        const unlocked = isHelperUnlocked(helper.id, index, stats);
        const denied = deniedId === helper.id;
        return (
          <button
            key={helper.id}
            onClick={() => handleClick(helper, index)}
            className={
              "relative flex flex-col items-center gap-1 rounded-3xl border-2 bg-white p-3 shadow-sm transition hover:-translate-y-1 dark:bg-zinc-900 " +
              (active
                ? "border-indigo-500 ring-2 ring-indigo-300"
                : "border-black/[.06] hover:border-indigo-300 dark:border-white/10") +
              (denied ? " animate-shake border-red-400" : "")
            }
          >
            <div className={unlocked ? "" : "opacity-40 grayscale"}>
              <Face
                helper={helper}
                mood={active ? "happy" : "idle"}
                sizePx={60}
                track={false}
              />
            </div>
            {unlocked ? (
              <span className="font-display text-sm font-bold">
                {helper.name[locale]}
              </span>
            ) : (
              <span className="font-display text-xs font-bold text-amber-600 dark:text-amber-400">
                {denied ? notEnoughLabel : `${unlockForLabel} ${UNLOCK_COST} ⭐`}
              </span>
            )}
            {!unlocked && (
              <span className="absolute right-2 top-2 text-sm">🔒</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
