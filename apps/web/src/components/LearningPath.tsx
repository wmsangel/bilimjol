"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Helper, Locale, Task, Topic } from "@izn-study/shared";
import type { ProgressMap } from "@/lib/progress";
import { Mascot } from "./Mascot";

// Карта-приключение: высокая вьющаяся дорога сверху вниз через разные
// локации (деревня → лес → река → горы → цель). Оформление по классу.

type Band = "land" | "space";
const bandFor = (grade: number): Band => (grade >= 9 ? "space" : "land");

const NODE = 72;
const STEP = 172;
const TOP = 130;
const PAD = 84;

interface Look {
  road: string; roadEdge: string; roadDash: string;
  nodeUnlocked: string; title: string; sub: string; labelBg: string; nodeLocked: string;
}
const LOOK_LAND: Look = {
  road: "#E7C99B", roadEdge: "#C29A66", roadDash: "#FBEAC8",
  nodeUnlocked: "from-emerald-400 to-green-500 shadow-emerald-700/40",
  title: "text-emerald-950 dark:text-emerald-50", sub: "text-emerald-800/70 dark:text-emerald-200/60",
  labelBg: "bg-white/90 dark:bg-black/45", nodeLocked: "bg-white/75 dark:bg-white/10",
};
const LOOK_SPACE: Look = {
  road: "#33D6EA", roadEdge: "#1596B8", roadDash: "#CFFAFF",
  nodeUnlocked: "from-cyan-400 to-blue-600 shadow-cyan-500/50",
  title: "text-cyan-50", sub: "text-cyan-200/70",
  labelBg: "bg-black/50", nodeLocked: "bg-white/10",
};

// ── рисовалки ──
const cloud = (x: number, y: number, s: number, o = 0.9) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity="${o}"><circle cx="0" cy="0" r="17"/><circle cx="20" cy="5" r="14"/><circle cx="-20" cy="5" r="14"/><rect x="-20" y="0" width="40" height="14" rx="7"/></g>`;
const tree = (x: number, y: number, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-5" y="0" width="10" height="26" rx="4" fill="#8a5a34"/><circle cx="0" cy="-18" r="24" fill="#57B85A"/><circle cx="-16" cy="-2" r="18" fill="#49A24E"/><circle cx="16" cy="-2" r="18" fill="#49A24E"/><circle cx="0" cy="-4" r="20" fill="#5FC06A"/></g>`;
const pine = (x: number, y: number, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="0" width="8" height="18" fill="#7a5230"/><path d="M0 -54 L20 -14 H-20 Z" fill="#2E8B57"/><path d="M0 -34 L26 8 H-26 Z" fill="#37A067"/></g>`;
const bush = (x: number, y: number, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})" fill="#5FC06A"><circle cx="-13" cy="0" r="14"/><circle cx="13" cy="0" r="14"/><circle cx="0" cy="-6" r="17"/></g>`;
const flower = (x: number, y: number) =>
  `<g transform="translate(${x} ${y})"><rect x="-1.5" y="0" width="3" height="12" fill="#4CA054"/><g fill="#FF7BA6"><circle cx="0" cy="-3" r="4"/><circle cx="-4" cy="0" r="4"/><circle cx="4" cy="0" r="4"/><circle cx="0" cy="3" r="4"/></g><circle cx="0" cy="0" r="2.6" fill="#FFE07A"/></g>`;
const rock = (x: number, y: number, s = 1) =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-18 6 Q-20 -10 -4 -12 Q14 -16 20 -2 Q24 8 8 8 Z" fill="#B8B2A6"/><path d="M-4 -12 Q14 -16 20 -2 Q10 -6 -4 -12 Z" fill="#CFC9BD"/></g>`;
const house = (x: number, y: number) =>
  `<g transform="translate(${x} ${y})"><rect x="-22" y="-4" width="44" height="30" rx="3" fill="#F0D9B5"/><path d="M-28 -4 L0 -30 L28 -4 Z" fill="#C0512E"/><rect x="-8" y="8" width="16" height="18" rx="2" fill="#8a5a34"/><rect x="10" y="4" width="9" height="9" fill="#9FD3F0"/></g>`;
const mountain = (x: number, base: number, w: number, h: number, c: string, cap: string) =>
  `<g><path d="M${x} ${base} L${x + w / 2} ${base - h} L${x + w} ${base} Z" fill="${c}"/><path d="M${x + w / 2 - h * 0.22} ${base - h * 0.55} L${x + w / 2} ${base - h} L${x + w / 2 + h * 0.22} ${base - h * 0.55} Q${x + w / 2} ${base - h * 0.42} ${x + w / 2 - h * 0.22} ${base - h * 0.55} Z" fill="${cap}"/></g>`;
const star = (x: number, y: number, r: number) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#dff6ff" opacity="${0.35 + r * 0.28}"/>`;
const planet = (x: number, y: number, r: number, c: string) =>
  `<g transform="translate(${x} ${y})"><circle r="${r}" fill="${c}"/><ellipse rx="${r * 1.7}" ry="${r * 0.4}" fill="none" stroke="#ffffff" stroke-opacity=".5" stroke-width="4" transform="rotate(-20)"/></g>`;

function goalMark(x: number, y: number, band: Band): string {
  if (band === "space")
    return `<g transform="translate(${x} ${y})"><circle r="34" fill="#E8836B"/><circle cx="-10" cy="-8" r="7" fill="#C96B54"/><circle cx="12" cy="6" r="10" fill="#C96B54"/><path d="M34 -34 h44 v22 h-44 z" fill="#26D6EA"/><rect x="30" y="-36" width="4" height="60" fill="#cfd8e0"/></g>`;
  // замок-цель
  return `<g transform="translate(${x} ${y})"><rect x="-40" y="-2" width="80" height="42" fill="#D8CFC0"/><rect x="-46" y="-18" width="18" height="20" fill="#C9BFAE"/><rect x="28" y="-18" width="18" height="20" fill="#C9BFAE"/><rect x="-10" y="-24" width="20" height="26" fill="#C9BFAE"/><g fill="#B33"><path d="M-10 -24 v-18 h6 v18 z"/></g><path d="M-10 -42 l18 6 l-18 6 z" fill="#EF4E5B"/><rect x="-8" y="18" width="16" height="22" rx="2" fill="#6A4A2E"/><g fill="#C9BFAE"><rect x="-46" y="-24" width="6" height="6"/><rect x="-34" y="-24" width="6" height="6"/><rect x="34" y="-24" width="6" height="6"/><rect x="46" y="-24" width="0" height="6"/></g></g>`;
}

function scene(band: Band, w: number, h: number): string {
  const Y = (f: number) => Math.round(f * h);
  const X = (f: number) => Math.round(f * w);
  const P: string[] = [];
  if (band === "space") {
    P.push(`<defs><linearGradient id="skyS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B2440"/><stop offset="0.6" stop-color="#141A33"/><stop offset="1" stop-color="#0E1226"/></linearGradient></defs>`);
    P.push(`<rect width="${w}" height="${h}" fill="url(#skyS)"/>`);
    for (let i = 0; i < 90; i++) {
      const gx = ((i * 137.5) % 100) / 100, gy = ((i * 61.7) % 100) / 100;
      P.push(star(X(gx), Y(gy), 0.6 + ((i * 53) % 20) / 12));
    }
    P.push(planet(X(0.82), Y(0.2), 26, "#7C6BE0"), planet(X(0.16), Y(0.5), 18, "#4FA6E0"));
    P.push(`<circle cx="${X(0.2)}" cy="${Y(0.78)}" r="30" fill="#E6E0C6"/><circle cx="${X(0.14)}" cy="${Y(0.74)}" r="6" fill="#D0C9A8"/>`);
    return P.join("");
  }
  // земля: небо → трава, локации сверху вниз
  P.push(`<defs><linearGradient id="skyL" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE6FF"/><stop offset="0.28" stop-color="#DBF3E4"/><stop offset="1" stop-color="#E6F6D6"/></linearGradient></defs>`);
  P.push(`<rect width="${w}" height="${h}" fill="url(#skyL)"/>`);
  P.push(`<circle cx="${w - 66}" cy="72" r="34" fill="#FFE07A"/><circle cx="${w - 66}" cy="72" r="48" fill="#FFE07A" opacity=".28"/>`);
  P.push(cloud(X(0.22), 92, 1), cloud(X(0.72), 150, 0.8), cloud(X(0.4), Y(0.28), 0.7, 0.7));
  // холмы по всей высоте
  for (let k = 0; k < 6; k++) {
    const yy = Y(0.16 + k * 0.15);
    P.push(`<path d="M0 ${yy} Q${X(0.3)} ${yy - 46} ${X(0.62)} ${yy} T${w} ${yy - 24} L${w} ${h} L0 ${h} Z" fill="${k % 2 ? "#9ED98D" : "#B7E39D"}" opacity=".5"/>`);
  }
  // дальние горы (низ)
  P.push(mountain(X(0.02), Y(0.82), X(0.4), 190, "#AEBBD6", "#F3F6FC"));
  P.push(mountain(X(0.42), Y(0.85), X(0.55), 240, "#98A8CC", "#F3F6FC"));
  // река поперёк
  P.push(`<path d="M-20 ${Y(0.55)} C${X(0.3)} ${Y(0.5)} ${X(0.62)} ${Y(0.62)} ${w + 20} ${Y(0.55)} L${w + 20} ${Y(0.63)} C${X(0.62)} ${Y(0.7)} ${X(0.3)} ${Y(0.58)} -20 ${Y(0.63)} Z" fill="#8FD0F0" opacity=".85"/>`);
  // локация 1 — деревня (верх)
  P.push(house(X(0.14), Y(0.11)), house(X(0.82), Y(0.15)), flower(X(0.32), Y(0.2)), flower(X(0.66), Y(0.23)), flower(X(0.5), Y(0.09)));
  // локация 2 — лес (треть)
  P.push(tree(X(0.09), Y(0.31)), tree(X(0.88), Y(0.35), 0.9), tree(X(0.2), Y(0.44), 0.85), tree(X(0.8), Y(0.42), 1.05), bush(X(0.4), Y(0.4)));
  // локация 3 — у реки / холмы
  P.push(bush(X(0.16), Y(0.66)), bush(X(0.84), Y(0.64)), rock(X(0.28), Y(0.72)), flower(X(0.7), Y(0.68)));
  // локация 4 — горы (низ)
  P.push(pine(X(0.1), Y(0.86)), pine(X(0.9), Y(0.88), 0.9), rock(X(0.78), Y(0.92), 1.2), rock(X(0.2), Y(0.94)));
  return P.join("");
}

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
  const look = band === "space" ? LOOK_SPACE : LOOK_LAND;
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

  const stops = useMemo<Stop[]>(() => {
    if (width === 0) return [];
    const amp = Math.min((width - 2 * PAD) / 2, 300);
    let prevPassed = true;
    return topics.map((topic, i) => {
      const avail = allTasks.filter((t) => t.topic === topic.id && (premium || t.free));
      const total = avail.length;
      const done = avail.filter((t) => t.id in results).length;
      const passed = total > 0 && done >= Math.ceil(total / 2);
      const mastered = total > 0 && done === total;
      const unlocked = prevPassed;
      prevPassed = passed;
      const swing = 0.72 * Math.sin(i * 0.85 + 0.6) + 0.28 * Math.sin(i * 2.1 + 1);
      const x = Math.max(PAD, Math.min(width - PAD, width / 2 + amp * swing));
      return { topic, x, y: TOP + i * STEP, done, total, unlocked, mastered };
    });
  }, [topics, allTasks, results, premium, width]);

  const currentIdx = useMemo(() => {
    const idx = stops.findIndex((s) => s.unlocked && !s.mastered);
    return idx === -1 ? Math.max(0, stops.length - 1) : idx;
  }, [stops]);

  const height = TOP + Math.max(0, topics.length - 1) * STEP + 220;
  const last = stops[stops.length - 1];

  return (
    <div
      ref={ref}
      className="relative w-full overflow-hidden rounded-[2rem] shadow-inner"
      style={{ height: width === 0 ? 560 : height }}
    >
      {width > 0 && (
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="pointer-events-none absolute inset-0" aria-hidden="true">
          <g dangerouslySetInnerHTML={{ __html: scene(band, width, height) }} />
          {last && (
            <g dangerouslySetInnerHTML={{ __html: goalMark(last.x, last.y + 96, band) }} />
          )}
          {stops.length > 1 && (
            <>
              <path d={roadPath(stops)} fill="none" stroke={look.roadEdge} strokeWidth={42} strokeLinecap="round" strokeLinejoin="round" opacity={dark ? 0.5 : 1} />
              <path d={roadPath(stops)} fill="none" stroke={look.road} strokeWidth={32} strokeLinecap="round" strokeLinejoin="round" opacity={dark ? 0.85 : 1} style={dark ? { filter: "drop-shadow(0 0 7px #33D6EA)" } : undefined} />
              <path d={roadPath(stops)} fill="none" stroke={look.roadDash} strokeWidth={3.5} strokeDasharray="2 20" strokeLinecap="round" opacity={0.9} />
            </>
          )}
        </svg>
      )}

      {stops.map((s, i) => {
        const stateName = !s.unlocked ? "locked" : s.mastered ? "mastered" : "open";
        const isCurrent = i === currentIdx;
        return (
          <div key={s.topic.id} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: s.x, top: s.y, width: 150 }}>
            {isCurrent && (
              <div className="pointer-events-none absolute -top-[78px] left-1/2 -translate-x-1/2 scale-[.62]">
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
                "relative flex items-center justify-center rounded-full border-[6px] text-3xl transition " +
                (stateName === "locked"
                  ? `${look.nodeLocked} cursor-not-allowed border-white/70 text-black/25 dark:border-white/15 dark:text-white/25`
                  : stateName === "mastered"
                    ? "border-white bg-gradient-to-br from-amber-300 to-yellow-400 text-amber-900 shadow-xl"
                    : `border-white bg-gradient-to-br ${look.nodeUnlocked} text-white shadow-xl hover:scale-110 ${isCurrent ? "ring-4 ring-white/80 animate-pulse" : ""}`)
              }
            >
              {stateName === "locked" ? "🔒" : s.topic.icon}
              {stateName === "mastered" && (
                <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow">⭐</span>
              )}
            </button>
            <div className={`mt-2 max-w-[146px] truncate rounded-full px-3 py-1 text-center text-sm font-bold shadow-sm ${look.labelBg} ${stateName === "locked" ? look.sub : look.title}`}>
              {s.topic.title[locale]}
            </div>
            {s.unlocked && s.total > 0 && (
              <div className={`mt-1 rounded-full px-2 text-[11px] font-bold ${look.labelBg} ${look.sub}`}>
                {s.mastered ? `⭐ ${masteredLabel}` : `${s.done}/${s.total}`}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
