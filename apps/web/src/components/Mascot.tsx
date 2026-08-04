"use client";

import type { Helper } from "@izn-study/shared";
import { helperGradient } from "@/lib/helperTheme";

export type Mood = "idle" | "happy" | "sad";

const SIZES = {
  md: { circle: "h-24 w-24", emoji: "text-5xl" },
  lg: { circle: "h-32 w-32", emoji: "text-7xl" },
};

export function Mascot({
  helper,
  mood = "idle",
  message,
  size = "md",
}: {
  helper: Helper;
  mood?: Mood;
  message?: string;
  size?: keyof typeof SIZES;
}) {
  const anim =
    mood === "happy"
      ? "animate-happy"
      : mood === "sad"
        ? "animate-shake"
        : "animate-bob";

  const s = SIZES[size];

  return (
    <div className="flex flex-col items-center">
      <div
        className={
          "relative flex items-center justify-center rounded-full bg-gradient-to-br shadow-lg ring-4 ring-white/70 dark:ring-white/10 " +
          helperGradient[helper.color] +
          " " +
          s.circle +
          " " +
          anim
        }
      >
        <span className={s.emoji}>{helper.emoji}</span>
      </div>

      {message && (
        <div className="animate-pop relative mt-3 max-w-xs rounded-2xl bg-white px-4 py-2 text-center font-display text-lg font-bold shadow-md dark:bg-zinc-800">
          {/* хвостик реплики */}
          <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white dark:bg-zinc-800" />
          {message}
        </div>
      )}
    </div>
  );
}
