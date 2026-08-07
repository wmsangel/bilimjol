"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Helper, Locale, Task, Topic } from "@izn-study/shared";
import type { ProgressMap } from "@/lib/progress";
import { Mascot } from "./Mascot";

// Тропа занятий: тема открывается, когда пройдена предыдущая.
// Змейка-бродилка на всю ширину; оформление зависит от класса.

interface Theme {
  wrap: string;
  trail: string;
  nodeUnlocked: string;
  nodeMastered: string;
  nodeLocked: string;
  title: string;
  sub: string;
  labelBg: string;
  deco: { emoji: string; className: string }[];
}

function themeFor(grade: number): Theme {
  if (grade <= 2)
    return {
      wrap: "from-lime-100 via-emerald-50 to-sky-100 dark:from-emerald-950 dark:via-emerald-950/50 dark:to-sky-950",
      trail: "bg-emerald-300", nodeUnlocked: "from-emerald-400 to-green-500 shadow-emerald-500/40",
      nodeMastered: "from-amber-300 to-yellow-400", nodeLocked: "bg-black/[.06] dark:bg-white/[.06]",
      title: "text-emerald-900 dark:text-emerald-100", sub: "text-emerald-700/70 dark:text-emerald-300/60",
      labelBg: "bg-white/75 dark:bg-black/35",
      deco: [
        { emoji: "☀️", className: "left-5 top-5 text-4xl" },
        { emoji: "🌳", className: "right-6 top-10 text-4xl" },
        { emoji: "🌸", className: "left-10 bottom-8 text-3xl" },
        { emoji: "🦋", className: "right-12 bottom-16 text-3xl" },
        { emoji: "🍄", className: "left-1/3 bottom-6 text-2xl" },
      ],
    };
  if (grade <= 5)
    return {
      wrap: "from-teal-100 via-cyan-50 to-emerald-100 dark:from-teal-950 dark:via-cyan-950/50 dark:to-emerald-950",
      trail: "bg-teal-300", nodeUnlocked: "from-teal-400 to-cyan-500 shadow-teal-500/40",
      nodeMastered: "from-amber-300 to-yellow-400", nodeLocked: "bg-black/[.06] dark:bg-white/[.06]",
      title: "text-teal-900 dark:text-teal-100", sub: "text-teal-700/70 dark:text-teal-300/60",
      labelBg: "bg-white/75 dark:bg-black/35",
      deco: [
        { emoji: "🏕️", className: "left-5 top-6 text-4xl" },
        { emoji: "🌲", className: "right-7 top-10 text-4xl" },
        { emoji: "🪵", className: "left-12 bottom-8 text-3xl" },
        { emoji: "🧭", className: "right-10 bottom-14 text-3xl" },
      ],
    };
  if (grade <= 8)
    return {
      wrap: "from-indigo-100 via-violet-50 to-fuchsia-100 dark:from-indigo-950 dark:via-violet-950/60 dark:to-slate-900",
      trail: "bg-violet-400/70", nodeUnlocked: "from-violet-500 to-fuchsia-500 shadow-violet-500/40",
      nodeMastered: "from-amber-300 to-yellow-400", nodeLocked: "bg-black/[.06] dark:bg-white/[.07]",
      title: "text-violet-900 dark:text-violet-100", sub: "text-violet-700/70 dark:text-violet-300/60",
      labelBg: "bg-white/75 dark:bg-black/35",
      deco: [
        { emoji: "🏔️", className: "left-6 top-6 text-4xl" },
        { emoji: "✨", className: "right-10 top-12 text-3xl" },
        { emoji: "🛰️", className: "right-7 bottom-12 text-3xl" },
      ],
    };
  return {
    wrap: "from-slate-800 via-slate-900 to-indigo-950",
    trail: "bg-cyan-400/50", nodeUnlocked: "from-cyan-500 to-blue-600 shadow-cyan-500/40",
    nodeMastered: "from-amber-300 to-yellow-400", nodeLocked: "bg-white/[.06]",
    title: "text-cyan-100", sub: "text-cyan-200/50", labelBg: "bg-black/40",
    deco: [
      { emoji: "🛰️", className: "left-6 top-6 text-4xl" },
      { emoji: "✦", className: "right-14 top-12 text-2xl text-cyan-200/70" },
      { emoji: "✦", className: "left-1/4 bottom-16 text-base text-cyan-200/50" },
      { emoji: "🌌", className: "right-8 bottom-10 text-4xl" },
    ],
  };
}

const NODE = 62;
const ROWH = 158;
const TOP = 84;
const PADX = 44;

interface Stop {
  topic: Topic;
  x: number;
  y: number;
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
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const cols = Math.max(2, Math.min(6, Math.floor(width / 210) || 2));

  const stops = useMemo<Stop[]>(() => {
    if (width === 0) return [];
    const usable = width - 2 * PADX;
    let prevPassed = true;
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
      const row = Math.floor(i / cols);
      const k = i % cols;
      const col = row % 2 === 0 ? k : cols - 1 - k;
      return {
        topic,
        x: PADX + (col + 0.5) * (usable / cols),
        y: TOP + row * ROWH,
        done,
        total,
        unlocked,
        mastered,
      };
    });
  }, [topics, allTasks, results, premium, width, cols]);

  const currentIdx = useMemo(() => {
    const idx = stops.findIndex((s) => s.unlocked && !s.mastered);
    return idx === -1 ? Math.max(0, stops.length - 1) : idx;
  }, [stops]);

  const rows = Math.max(1, Math.ceil(topics.length / cols));
  const height = TOP + (rows - 1) * ROWH + 150;

  // Точки-«следы» между узлами.
  const dots: { x: number; y: number; on: boolean }[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    for (const t of [0.28, 0.5, 0.72]) {
      dots.push({
        x: a.x + (b.x - a.x) * t,
        y: a.y + (b.y - a.y) * t,
        on: b.unlocked,
      });
    }
  }

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-br ${theme.wrap} shadow-inner`}
      style={{ height: width === 0 ? 420 : height }}
    >
      {theme.deco.map((d, i) => (
        <span key={i} className={`pointer-events-none absolute opacity-70 ${d.className}`}>
          {d.emoji}
        </span>
      ))}

      {dots.map((d, i) => (
        <span
          key={i}
          className={`absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full ${
            d.on ? theme.trail : "bg-black/10 dark:bg-white/10"
          }`}
          style={{ left: d.x, top: d.y }}
        />
      ))}

      {stops.map((s, i) => {
        const stateName = !s.unlocked ? "locked" : s.mastered ? "mastered" : "open";
        const isCurrent = i === currentIdx;
        return (
          <div
            key={s.topic.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: s.x, top: s.y, width: 140 }}
          >
            {isCurrent && (
              <div className="pointer-events-none absolute -top-[70px] left-1/2 -translate-x-1/2 scale-[.58]">
                <Mascot helper={helper} mood="happy" size="md" />
              </div>
            )}

            <button
              type="button"
              disabled={stateName === "locked"}
              onClick={() => onPick(s.topic.id)}
              aria-label={s.topic.title[locale]}
              style={{ height: NODE, width: NODE }}
              className={
                "relative flex items-center justify-center rounded-full border-4 text-2xl transition " +
                (stateName === "locked"
                  ? `${theme.nodeLocked} cursor-not-allowed border-white/40 text-black/25 dark:border-white/10 dark:text-white/25`
                  : stateName === "mastered"
                    ? `bg-gradient-to-br ${theme.nodeMastered} border-white text-amber-900 shadow-lg`
                    : `bg-gradient-to-br ${theme.nodeUnlocked} border-white text-white shadow-lg hover:scale-110 ${
                        isCurrent ? "ring-4 ring-white/70 animate-pulse" : ""
                      }`)
              }
            >
              {stateName === "locked" ? "🔒" : s.topic.icon}
              {stateName === "mastered" && (
                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow">
                  ⭐
                </span>
              )}
            </button>

            <div
              className={`mt-1.5 max-w-[136px] truncate rounded-full px-2 py-0.5 text-center text-xs font-bold ${theme.labelBg} ${
                stateName === "locked" ? theme.sub : theme.title
              }`}
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
