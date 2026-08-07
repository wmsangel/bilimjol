"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Helper, Locale, Task, Topic } from "@izn-study/shared";
import type { ProgressMap } from "@/lib/progress";
import { Mascot } from "./Mascot";

// Тропа занятий как игровая карта: вьющаяся дорога через остановки и
// иллюстрированная сцена (холмы, деревья, горы, космос) по классу.

type Band = "meadow" | "forest" | "peaks" | "space";
function bandFor(grade: number): Band {
  if (grade <= 2) return "meadow";
  if (grade <= 5) return "forest";
  if (grade <= 8) return "peaks";
  return "space";
}

interface Look {
  wrap: string;
  road: string; roadEdge: string; roadDash: string;
  nodeUnlocked: string; nodeMastered: string; nodeLocked: string;
  title: string; sub: string; labelBg: string;
}
const LOOKS: Record<Band, Look> = {
  meadow: {
    wrap: "from-sky-200 via-emerald-50 to-lime-100 dark:from-sky-950 dark:via-emerald-950 dark:to-emerald-900",
    road: "#E9C99B", roadEdge: "#CDA976", roadDash: "#FBEAC8",
    nodeUnlocked: "from-emerald-400 to-green-500 shadow-emerald-600/40", nodeMastered: "from-amber-300 to-yellow-400",
    nodeLocked: "bg-white/70 dark:bg-white/10", title: "text-emerald-950 dark:text-emerald-100",
    sub: "text-emerald-800/70 dark:text-emerald-300/60", labelBg: "bg-white/85 dark:bg-black/40",
  },
  forest: {
    wrap: "from-teal-200 via-emerald-50 to-green-100 dark:from-teal-950 dark:via-emerald-950 dark:to-green-950",
    road: "#DDBE8E", roadEdge: "#B7965F", roadDash: "#F1E1BF",
    nodeUnlocked: "from-teal-400 to-emerald-500 shadow-teal-600/40", nodeMastered: "from-amber-300 to-yellow-400",
    nodeLocked: "bg-white/70 dark:bg-white/10", title: "text-teal-950 dark:text-teal-100",
    sub: "text-teal-800/70 dark:text-teal-300/60", labelBg: "bg-white/85 dark:bg-black/40",
  },
  peaks: {
    wrap: "from-indigo-200 via-violet-100 to-fuchsia-100 dark:from-indigo-950 dark:via-violet-950 dark:to-slate-900",
    road: "#CFC2E4", roadEdge: "#A794C9", roadDash: "#EFE8FA",
    nodeUnlocked: "from-violet-500 to-fuchsia-500 shadow-violet-600/40", nodeMastered: "from-amber-300 to-yellow-400",
    nodeLocked: "bg-white/70 dark:bg-white/10", title: "text-violet-950 dark:text-violet-100",
    sub: "text-violet-800/70 dark:text-violet-300/60", labelBg: "bg-white/85 dark:bg-black/40",
  },
  space: {
    wrap: "from-slate-800 via-slate-900 to-indigo-950",
    road: "#2BD4E8", roadEdge: "#1596B8", roadDash: "#BFF6FF",
    nodeUnlocked: "from-cyan-500 to-blue-600 shadow-cyan-500/40", nodeMastered: "from-amber-300 to-yellow-400",
    nodeLocked: "bg-white/10", title: "text-cyan-100", sub: "text-cyan-200/60", labelBg: "bg-black/45",
  },
};

const NODE = 62, ROWH = 172, TOP = 96, PADX = 54;

// ─── рисовалки декораций ───────────────────────────────
function tree(x: number, y: number, s: number, c1: string, c2: string) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-4" y="0" width="8" height="20" rx="3" fill="#8a5a34"/>
    <circle cx="0" cy="-14" r="20" fill="${c1}"/>
    <circle cx="-13" cy="-2" r="15" fill="${c2}"/>
    <circle cx="13" cy="-2" r="15" fill="${c2}"/>
    <circle cx="0" cy="-2" r="17" fill="${c1}"/></g>`;
}
function pine(x: number, y: number, s: number, c: string) {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-3" y="0" width="6" height="14" fill="#7a5230"/>
    <path d="M0 -44 L16 -10 H-16 Z" fill="${c}"/>
    <path d="M0 -30 L20 4 H-20 Z" fill="${c}"/></g>`;
}
function cloud(x: number, y: number, s: number, o = 0.9) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity="${o}">
    <circle cx="0" cy="0" r="16"/><circle cx="18" cy="4" r="13"/><circle cx="-18" cy="4" r="13"/>
    <rect x="-18" y="0" width="36" height="12" rx="6"/></g>`;
}
function bush(x: number, y: number, s: number, c: string) {
  return `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}">
    <circle cx="-10" cy="0" r="11"/><circle cx="10" cy="0" r="11"/><circle cx="0" cy="-5" r="13"/></g>`;
}
function mountain(x: number, baseY: number, w: number, h: number, c: string, cap: string) {
  return `<g><path d="M${x} ${baseY} L${x + w / 2} ${baseY - h} L${x + w} ${baseY} Z" fill="${c}"/>
    <path d="M${x + w / 2 - h * 0.22} ${baseY - h * 0.56} L${x + w / 2} ${baseY - h} L${x + w / 2 + h * 0.22} ${baseY - h * 0.56} q-${h * 0.22} ${h * 0.12} -${h * 0.22} 0 q-${h * 0.11} -${h * 0.1} -${h * 0.22} 0 Z" fill="${cap}"/></g>`;
}
function star(x: number, y: number, r: number) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="#dff6ff" opacity="${0.4 + r * 0.3}"/>`;
}

function scene(band: Band, w: number, h: number): string {
  const p: string[] = [];
  const X = (f: number) => Math.round(f * w);
  if (band === "meadow") {
    p.push(`<path d="M0 ${h - 90} Q${X(0.3)} ${h - 150} ${X(0.55)} ${h - 100} T${w} ${h - 110} L${w} ${h} L0 ${h} Z" fill="#9BE39A" opacity=".55"/>`);
    p.push(`<path d="M0 ${h - 40} Q${X(0.4)} ${h - 90} ${w} ${h - 55} L${w} ${h} L0 ${h} Z" fill="#79D07F" opacity=".55"/>`);
    p.push(`<circle cx="${X(0.9)}" cy="70" r="34" fill="#FFE07A"/><circle cx="${X(0.9)}" cy="70" r="46" fill="#FFE07A" opacity=".3"/>`);
    p.push(cloud(X(0.18), 66, 1), cloud(X(0.62), 48, 0.8));
    p.push(`<ellipse cx="${X(0.5)}" cy="${h - 46}" rx="70" ry="20" fill="#7FC9EF" opacity=".7"/>`);
    p.push(tree(X(0.08), h - 96, 1.1, "#57B85A", "#49A24E"), tree(X(0.95), 150, 0.9, "#57B85A", "#49A24E"));
    p.push(bush(X(0.28), h - 30, 1, "#5FC06A"), bush(X(0.78), h - 26, 1.1, "#5FC06A"), bush(X(0.5), 40, 0.8, "#7ED08A"));
  } else if (band === "forest") {
    p.push(`<path d="M0 ${h - 80} Q${X(0.35)} ${h - 140} ${w} ${h - 90} L${w} ${h} L0 ${h} Z" fill="#4FA574" opacity=".5"/>`);
    p.push(`<path d="M0 ${h - 34} Q${X(0.5)} ${h - 80} ${w} ${h - 44} L${w} ${h} L0 ${h} Z" fill="#3E8E63" opacity=".55"/>`);
    p.push(cloud(X(0.75), 52, 0.8, 0.7));
    p.push(pine(X(0.06), 160, 1.3, "#2E8B57"), pine(X(0.14), 120, 0.9, "#37A067"),
      pine(X(0.9), h - 90, 1.3, "#2E8B57"), pine(X(0.82), h - 60, 0.85, "#37A067"),
      pine(X(0.5), 30, 0.7, "#3B9A63"));
    p.push(bush(X(0.3), h - 26, 1.1, "#46A06B"), bush(X(0.68), h - 30, 1, "#46A06B"));
  } else if (band === "peaks") {
    p.push(mountain(X(0.05), h - 70, 220, 200, "#8E7BB8", "#F1ECFA"));
    p.push(mountain(X(0.55), h - 70, 260, 240, "#7C68AC", "#F1ECFA"));
    p.push(mountain(X(0.34), h - 70, 180, 150, "#A492CE", "#F5F1FB"));
    p.push(`<path d="M0 ${h - 60} Q${X(0.5)} ${h - 96} ${w} ${h - 64} L${w} ${h} L0 ${h} Z" fill="#B7A7D6" opacity=".5"/>`);
    p.push(cloud(X(0.2), 60, 1, 0.85), cloud(X(0.8), 44, 0.8, 0.8));
    p.push(pine(X(0.9), h - 70, 1.1, "#6D5C93"), pine(X(0.08), h - 66, 1, "#6D5C93"));
  } else {
    for (let i = 0; i < 46; i++) {
      const gx = ((i * 137) % 100) / 100, gy = ((i * 89) % 100) / 100;
      p.push(star(X(gx), 30 + gy * (h - 60), 0.8 + ((i * 53) % 20) / 12));
    }
    p.push(`<circle cx="${X(0.86)}" cy="80" r="30" fill="#EDE7C8"/><circle cx="${X(0.79)}" cy="72" r="30" fill="none"/><circle cx="${X(0.9)}" cy="74" r="6" fill="#D8CFA6"/><circle cx="${X(0.82)}" cy="92" r="4" fill="#D8CFA6"/>`);
    p.push(`<g transform="translate(${X(0.12)} ${h - 90})"><circle r="26" fill="#5B78D8"/><ellipse rx="42" ry="10" fill="none" stroke="#8fa6ee" stroke-width="4" transform="rotate(-18)"/></g>`);
    p.push(`<circle cx="${X(0.7)}" cy="${h - 60}" r="14" fill="#E8836B"/>`);
  }
  return p.join("");
}

// плавная дорога через точки (Catmull-Rom → Безье)
function roadPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

interface Stop {
  topic: Topic; x: number; y: number; done: number; total: number; unlocked: boolean; mastered: boolean;
}

export function LearningPath({
  grade, topics, allTasks, results, premium, locale, helper, onPick, masteredLabel,
}: {
  grade: number; topics: Topic[]; allTasks: Task[]; results: ProgressMap;
  premium: boolean; locale: Locale; helper: Helper; onPick: (t: string) => void; masteredLabel: string;
}) {
  const band = bandFor(grade);
  const look = LOOKS[band];
  const dark = band === "space";
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

  const cols = Math.max(2, Math.min(6, Math.floor(width / 220) || 2));

  const stops = useMemo<Stop[]>(() => {
    if (width === 0) return [];
    const usable = width - 2 * PADX;
    let prevPassed = true;
    return topics.map((topic, i) => {
      const avail = allTasks.filter((t) => t.topic === topic.id && (premium || t.free));
      const total = avail.length;
      const done = avail.filter((t) => t.id in results).length;
      const passed = total > 0 && done >= Math.ceil(total / 2);
      const mastered = total > 0 && done === total;
      const unlocked = prevPassed;
      prevPassed = passed;
      const row = Math.floor(i / cols), k = i % cols;
      const col = row % 2 === 0 ? k : cols - 1 - k;
      return { topic, x: PADX + (col + 0.5) * (usable / cols), y: TOP + row * ROWH, done, total, unlocked, mastered };
    });
  }, [topics, allTasks, results, premium, width, cols]);

  const currentIdx = useMemo(() => {
    const idx = stops.findIndex((s) => s.unlocked && !s.mastered);
    return idx === -1 ? Math.max(0, stops.length - 1) : idx;
  }, [stops]);

  const rows = Math.max(1, Math.ceil(topics.length / cols));
  const height = TOP + (rows - 1) * ROWH + 170;

  return (
    <div
      ref={ref}
      className={`relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-b ${look.wrap} shadow-inner`}
      style={{ height: width === 0 ? 440 : height }}
    >
      {width > 0 && (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <g dangerouslySetInnerHTML={{ __html: scene(band, width, height) }} />
          {stops.length > 1 && (
            <>
              <path d={roadPath(stops)} fill="none" stroke={look.roadEdge} strokeWidth={36} strokeLinecap="round" strokeLinejoin="round" opacity={dark ? 0.5 : 1} />
              <path d={roadPath(stops)} fill="none" stroke={look.road} strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" opacity={dark ? 0.85 : 1} style={dark ? { filter: "drop-shadow(0 0 6px #2BD4E8)" } : undefined} />
              <path d={roadPath(stops)} fill="none" stroke={look.roadDash} strokeWidth={3} strokeDasharray="2 18" strokeLinecap="round" opacity={0.9} />
            </>
          )}
        </svg>
      )}

      {stops.map((s, i) => {
        const stateName = !s.unlocked ? "locked" : s.mastered ? "mastered" : "open";
        const isCurrent = i === currentIdx;
        return (
          <div
            key={s.topic.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
            style={{ left: s.x, top: s.y, width: 148 }}
          >
            {isCurrent && (
              <div className="pointer-events-none absolute -top-[68px] left-1/2 -translate-x-1/2 scale-[.56]">
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
                "relative flex items-center justify-center rounded-full border-[5px] text-2xl transition " +
                (stateName === "locked"
                  ? `${look.nodeLocked} cursor-not-allowed border-white/70 text-black/30 dark:border-white/15 dark:text-white/30`
                  : stateName === "mastered"
                    ? `bg-gradient-to-br ${look.nodeMastered} border-white text-amber-900 shadow-xl`
                    : `bg-gradient-to-br ${look.nodeUnlocked} border-white text-white shadow-xl hover:scale-110 ${isCurrent ? "ring-4 ring-white/80 animate-pulse" : ""}`)
              }
            >
              {stateName === "locked" ? "🔒" : s.topic.icon}
              {stateName === "mastered" && (
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs shadow">⭐</span>
              )}
            </button>

            <div className={`mt-1.5 max-w-[142px] truncate rounded-full px-2.5 py-0.5 text-center text-xs font-bold shadow-sm ${look.labelBg} ${stateName === "locked" ? look.sub : look.title}`}>
              {s.topic.title[locale]}
            </div>
            {s.unlocked && s.total > 0 && (
              <div className={`mt-0.5 rounded-full px-1.5 text-[10px] font-bold ${look.labelBg} ${look.sub}`}>
                {s.mastered ? `⭐ ${masteredLabel}` : `${s.done}/${s.total}`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
