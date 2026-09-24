"use client";

import { useEffect, useState } from "react";
import { helpers, type Locale } from "@izn-study/shared";
import type { Helper } from "@izn-study/shared";
import { Character } from "./Character";
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
  bestStreak: 0,
  lastActiveDate: null,
  dailyDate: null,
  dailySolved: 0,
  activeDates: [],
  unlockedHelpers: [],
  spentStars: 0,
  totalAnswered: 0,
  totalCorrect: 0,
  timeSpentSec: 0,
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
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-3.5">
      {helpers.map((helper, index) => {
        const active = helper.id === selectedId;
        const unlocked = isHelperUnlocked(helper.id, index, stats);
        const denied = deniedId === helper.id;
        return (
          <button
            key={helper.id}
            onClick={() => handleClick(helper, index)}
            className={
              "relative flex flex-col items-center gap-1 rounded-[22px] border-2 bg-white p-3 pb-2.5 transition hover:-translate-y-1 " +
              (active
                ? "border-[#6d5cf7] shadow-[0_0_0_4px_#e6e1ff]"
                : "border-black/[.06] shadow-[0_6px_18px_rgba(25,21,57,.05)] hover:border-[#b9b3e6]") +
              (denied ? " animate-shake border-[#fb7185]" : "")
            }
          >
            <div className={unlocked ? "" : "opacity-40 grayscale"}>
              <Character charId={helper.id} sizePx={64} />
            </div>
            {unlocked ? (
              <span className="font-display text-[13px] font-bold text-[#191539]">
                {helper.name[locale]}
              </span>
            ) : (
              <span className="font-display text-[11px] font-extrabold leading-tight text-[#9a7430]">
                {denied ? notEnoughLabel : `${unlockForLabel} ${UNLOCK_COST} ⭐`}
              </span>
            )}
            {!unlocked && (
              <span className="absolute right-2 top-2 text-[13px]">🔒</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
