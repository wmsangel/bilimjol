"use client";

import { useMemo } from "react";
import type { Helper, Locale, Task, Topic } from "@izn-study/shared";
import type { ProgressMap } from "@/lib/progress";
import { Mascot } from "./Mascot";

// Тропа занятий: тема открывается, когда пройдена предыдущая.
// Чем старше класс — тем «взрослее» оформление карты.

interface Theme {
  wrap: string;
  trail: string;
  nodeUnlocked: string;
  nodeMastered: string;
  nodeLocked: string;
  title: string;
  sub: string;
  deco: { emoji: string; className: string }[];
}

function themeFor(grade: number): Theme {
  if (grade <= 2) {
    return {
      wrap: "from-lime-100 via-emerald-50 to-sky-100",
      trail: "bg-emerald-300",
      nodeUnlocked: "from-emerald-400 to-green-500 shadow-emerald-500/40",
      nodeMastered: "from-amber-300 to-yellow-400",
      nodeLocked: "bg-emerald-900/10 dark:bg-white/5",
      title: "text-emerald-900 dark:text-emerald-200",
      sub: "text-emerald-700/70 dark:text-emerald-300/60",
      deco: [
        { emoji: "☀️", className: "left-4 top-4 text-3xl" },
        { emoji: "🌳", className: "right-5 top-16 text-3xl" },
        { emoji: "🌸", className: "left-6 bottom-10 text-2xl" },
        { emoji: "🦋", className: "right-8 bottom-24 text-2xl" },
      ],
    };
  }
  if (grade <= 5) {
    return {
      wrap: "from-teal-100 via-cyan-50 to-emerald-100",
      trail: "bg-teal-300",
      nodeUnlocked: "from-teal-400 to-cyan-500 shadow-teal-500/40",
      nodeMastered: "from-amber-300 to-yellow-400",
      nodeLocked: "bg-teal-900/10 dark:bg-white/5",
      title: "text-teal-900 dark:text-teal-200",
      sub: "text-teal-700/70 dark:text-teal-300/60",
      deco: [
        { emoji: "🏕️", className: "left-4 top-5 text-3xl" },
        { emoji: "🌲", className: "right-5 top-20 text-3xl" },
        { emoji: "🪵", className: "left-7 bottom-12 text-2xl" },
        { emoji: "🍄", className: "right-8 bottom-28 text-2xl" },
      ],
    };
  }
  if (grade <= 8) {
    return {
      wrap: "from-indigo-100 via-violet-50 to-fuchsia-100 dark:from-indigo-950 dark:via-violet-950/60 dark:to-slate-900",
      trail: "bg-violet-400/70",
      nodeUnlocked: "from-violet-500 to-fuchsia-500 shadow-violet-500/40",
      nodeMastered: "from-amber-300 to-yellow-400",
      nodeLocked: "bg-violet-900/10 dark:bg-white/5",
      title: "text-violet-900 dark:text-violet-200",
      sub: "text-violet-700/70 dark:text-violet-300/60",
      deco: [
        { emoji: "🏔️", className: "left-4 top-5 text-3xl" },
        { emoji: "✨", className: "right-6 top-16 text-2xl" },
        { emoji: "🧭", className: "left-7 bottom-14 text-2xl" },
      ],
    };
  }
  return {
    wrap: "from-slate-800 via-slate-900 to-indigo-950",
    trail: "bg-cyan-400/50",
    nodeUnlocked: "from-cyan-500 to-blue-600 shadow-cyan-500/40",
    nodeMastered: "from-amber-300 to-yellow-400",
    nodeLocked: "bg-white/[.06]",
    title: "text-cyan-100",
    sub: "text-cyan-200/50",
    deco: [
      { emoji: "🛰️", className: "left-4 top-5 text-3xl" },
      { emoji: "✦", className: "right-8 top-14 text-xl text-cyan-200/70" },
      { emoji: "✦", className: "left-10 bottom-24 text-sm text-cyan-200/50" },
      { emoji: "🌌", className: "right-5 bottom-12 text-3xl" },
    ],
  };
}

const SP = 124; // вертикальный шаг между узлами
const TOP = 96; // отступ сверху (место для персонажа)
const AMP = 30; // амплитуда змейки, %

interface Stop {
  topic: Topic;
  cx: number; // % от ширины
  cy: number; // px
  done: number;
  total: number;
  unlocked: boolean;
  mastered: boolean;
}

export function LearningPath({
  grade,
  topics,
  allTasks,
  results,
  premium,
  locale,
  helper,
  onPick,
  masteredLabel,
}: {
  grade: number;
  topics: Topic[];
  allTasks: Task[];
  results: ProgressMap;
  premium: boolean;
  locale: Locale;
  helper: Helper;
  onPick: (topicId: string) => void;
  masteredLabel: string;
}) {
  const theme = themeFor(grade);
  const dark = grade >= 9;

  const stops = useMemo<Stop[]>(() => {
    let prevPassed = true; // первая тема всегда открыта
    return topics.map((topic, i) => {
      const avail = allTasks.filter(
        (t) => t.topic === topic.id && (premium || t.free),
      );
      const total = avail.length;
      const done = avail.filter((t) => t.id in results).length;
      const passed = total > 0 && done >= Math.ceil(total / 2);
      const mastered = total > 0 && done === total;
      const unlocked = prevPassed;
      prevPassed = passed;
      return {
        topic,
        cx: 50 + AMP * Math.sin(i * 0.9),
        cy: TOP + i * SP,
        done,
        total,
        unlocked,
        mastered,
      };
    });
  }, [topics, allTasks, results, premium]);

  // Текущая остановка — первая открытая, но ещё не освоенная.
  const currentIdx = useMemo(() => {
    const idx = stops.findIndex((s) => s.unlocked && !s.mastered);
    return idx === -1 ? stops.length - 1 : idx;
  }, [stops]);

  const height = TOP + (stops.length - 1) * SP + 140;

  // Точки-«следы» между узлами.
  const dots: { x: number; y: number; on: boolean }[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    for (const t of [0.3, 0.5, 0.7]) {
      dots.push({
        x: a.cx + (b.cx - a.cx) * t,
        y: a.cy + (b.cy - a.cy) * t,
        on: b.unlocked,
      });
    }
  }

  return (
    <div
      className={`relative mx-auto w-full max-w-md overflow-hidden rounded-[2rem] bg-gradient-to-b ${theme.wrap} p-2 shadow-inner`}
      style={{ height }}
    >
      {/* Декор */}
      {theme.deco.map((d, i) => (
        <span key={i} className={`pointer-events-none absolute opacity-70 ${d.className}`}>
          {d.emoji}
        </span>
      ))}

      {/* Следы тропы */}
      {dots.map((d, i) => (
        <span
          key={i}
          className={`absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
            d.on ? theme.trail : "bg-black/10 dark:bg-white/10"
          }`}
          style={{ left: `${d.x}%`, top: d.y }}
        />
      ))}

      {/* Узлы-остановки */}
      {stops.map((s, i) => {
        const state = !s.unlocked ? "locked" : s.mastered ? "mastered" : "open";
        const isCurrent = i === currentIdx;
        return (
          <div
            key={s.topic.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: `${s.cx}%`, top: s.cy, width: 132 }}
          >
            {/* Персонаж над текущей остановкой */}
            {isCurrent && (
              <div className="pointer-events-none absolute -top-[76px] left-1/2 -translate-x-1/2 scale-[.62]">
                <Mascot helper={helper} mood="happy" size="md" />
              </div>
            )}

            <button
              type="button"
              disabled={state === "locked"}
              onClick={() => onPick(s.topic.id)}
              aria-label={s.topic.title[locale]}
              className={
                "relative flex h-16 w-16 items-center justify-center rounded-full border-4 text-2xl transition " +
                (state === "locked"
                  ? `${theme.nodeLocked} cursor-not-allowed border-white/40 text-black/25 dark:border-white/10 dark:text-white/25`
                  : state === "mastered"
                    ? `bg-gradient-to-br ${theme.nodeMastered} border-white text-amber-900 shadow-lg`
                    : `bg-gradient-to-br ${theme.nodeUnlocked} border-white text-white shadow-lg hover:scale-110 ${
                        isCurrent ? "ring-4 ring-white/70 animate-pulse" : ""
                      }`)
              }
            >
              {state === "locked" ? "🔒" : s.topic.icon}
              {state === "mastered" && (
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow">
                  ⭐
                </span>
              )}
            </button>

            {/* Подпись */}
            <div
              className={`mt-1.5 max-w-[128px] truncate rounded-full px-2 py-0.5 text-center text-xs font-bold ${
                dark ? "bg-black/30" : "bg-white/70"
              } ${state === "locked" ? theme.sub : theme.title}`}
            >
              {s.topic.title[locale]}
            </div>
            {s.unlocked && s.total > 0 && (
              <div className={`text-[10px] font-semibold ${theme.sub}`}>
                {s.mastered ? `⭐ ${masteredLabel}` : `${s.done}/${s.total}`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
