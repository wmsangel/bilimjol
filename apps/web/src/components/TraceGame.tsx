"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface TraceLabels {
  title: string;
  description: string;
  hint: string; // «Веди пальцем по линии от зелёной точки»
  shapeLabel: string; // «Фигура {n} из {total}»
  done: string; // «Готово!»
  next: string;
  restart: string;
  back: string;
}

// Фигуры на квадрате 0..100. Порядок — от простого к сложному.
const SHAPES: { id: string; d: string; closed?: boolean }[] = [
  { id: "line", d: "M12 50 L88 50" },
  { id: "arc", d: "M12 78 Q50 8 88 78" },
  { id: "wave", d: "M10 55 Q25 22 40 55 T70 55 T100 55" },
  { id: "zigzag", d: "M12 72 L31 28 L50 72 L69 28 L88 72" },
  { id: "triangle", d: "M50 14 L86 84 L14 84 Z", closed: true },
  { id: "square", d: "M22 22 L78 22 L78 78 L22 78 Z", closed: true },
  {
    id: "circle",
    d: "M50 12 C71 12 88 29 88 50 C88 71 71 88 50 88 C29 88 12 71 12 50 C12 29 29 12 50 12 Z",
    closed: true,
  },
];

const REACH = 13; // радиус попадания в точку (в единицах viewBox)
const SAMPLES = 48;

interface Pt {
  x: number;
  y: number;
}

export function TraceGame({
  labels,
  homeHref,
}: {
  labels: TraceLabels;
  homeHref: string;
}) {
  const total = SHAPES.length;
  const [shapeIdx, setShapeIdx] = useState(0);
  const [progress, setProgress] = useState(0); // 0..1
  const [done, setDone] = useState(false);
  const [drawing, setDrawing] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const guideRef = useRef<SVGPathElement | null>(null);
  const points = useRef<Pt[]>([]);
  const reached = useRef(0);

  const shape = SHAPES[shapeIdx];

  // Пересчитать контрольные точки при смене фигуры.
  useEffect(() => {
    const path = guideRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    const pts: Pt[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const p = path.getPointAtLength((len * i) / SAMPLES);
      pts.push({ x: p.x, y: p.y });
    }
    points.current = pts;
    reached.current = 0;
    setProgress(0);
    setDone(false);
  }, [shapeIdx]);

  const toSvg = useCallback((clientX: number, clientY: number): Pt => {
    const svg = svgRef.current!;
    const r = svg.getBoundingClientRect();
    return {
      x: ((clientX - r.left) / r.width) * 100,
      y: ((clientY - r.top) / r.height) * 100,
    };
  }, []);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      if (done) return;
      const pts = points.current;
      if (!pts.length) return;
      const p = toSvg(clientX, clientY);
      // Двигаемся по точкам по порядку: пока следующая точка близко — засчитываем.
      let i = reached.current;
      while (i < pts.length) {
        const d = Math.hypot(pts[i].x - p.x, pts[i].y - p.y);
        if (d <= REACH) {
          i++;
        } else {
          break;
        }
      }
      if (i > reached.current) {
        reached.current = i;
        const prog = i / (pts.length - 1);
        setProgress(prog);
        if (prog >= 0.94) {
          setProgress(1);
          setDone(true);
          setDrawing(false);
        }
      }
    },
    [done, toSvg],
  );

  function onPointerDown(e: React.PointerEvent) {
    if (done) return;
    setDrawing(true);
    (e.target as Element).setPointerCapture?.(e.pointerId);
    handleMove(e.clientX, e.clientY);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drawing) return;
    handleMove(e.clientX, e.clientY);
  }
  function onPointerUp() {
    setDrawing(false);
  }

  function restartShape() {
    reached.current = 0;
    setProgress(0);
    setDone(false);
  }
  function next() {
    if (shapeIdx + 1 < total) setShapeIdx(shapeIdx + 1);
    else setShapeIdx(0);
  }

  const start = points.current[0];
  const end = points.current[points.current.length - 1];

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-3 flex items-center justify-between text-sm font-bold text-zinc-600 dark:text-zinc-400">
        <span className="rounded-full bg-black/[.05] px-3 py-1 dark:bg-white/10">
          {labels.shapeLabel
            .replace("{n}", String(shapeIdx + 1))
            .replace("{total}", String(total))}
        </span>
        <span className="rounded-full bg-black/[.05] px-3 py-1 dark:bg-white/10">
          {Math.round(progress * 100)}%
        </span>
      </div>

      <p className="mb-3 text-center text-sm font-semibold text-zinc-500 dark:text-zinc-400">
        {labels.hint}
      </p>

      <div className="relative rounded-[2rem] border border-black/[.06] bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          className="aspect-square w-full touch-none select-none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* Направляющая-«дорога» */}
          <path
            ref={guideRef}
            d={shape.d}
            fill="none"
            stroke="currentColor"
            className="text-indigo-100 dark:text-indigo-500/20"
            strokeWidth={14}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Пунктир по центру дороги */}
          <path
            d={shape.d}
            fill="none"
            stroke="currentColor"
            className="text-indigo-300 dark:text-indigo-400/40"
            strokeWidth={2}
            strokeDasharray="1 7"
            strokeLinecap="round"
          />
          {/* Обведённая часть */}
          <path
            d={shape.d}
            fill="none"
            stroke="url(#traceGrad)"
            strokeWidth={14}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={100}
            style={{
              strokeDasharray: 100,
              strokeDashoffset: 100 - progress * 100,
              transition: "stroke-dashoffset .1s linear",
            }}
          />
          <defs>
            <linearGradient id="traceGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6366f1" />
              <stop offset="1" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>
          {/* Старт / финиш */}
          {start && !done && (
            <circle cx={start.x} cy={start.y} r={5} fill="#22c55e" stroke="#fff" strokeWidth={1.5} />
          )}
          {end && !shape.closed && !done && (
            <circle cx={end.x} cy={end.y} r={5} fill="#ef4444" stroke="#fff" strokeWidth={1.5} />
          )}
        </svg>

        {done && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[2rem] bg-white/70 dark:bg-zinc-900/70">
            <div className="text-center">
              <div className="text-6xl">🎉</div>
              <p className="mt-2 font-display text-2xl font-extrabold">
                {labels.done}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        {done ? (
          <button
            onClick={next}
            className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-8 py-3 font-bold text-white shadow-md transition hover:brightness-110"
          >
            {labels.next} →
          </button>
        ) : (
          <button
            onClick={restartShape}
            className="rounded-full border-2 border-black/10 px-6 py-3 font-bold transition hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/5"
          >
            🔄 {labels.restart}
          </button>
        )}
      </div>

      <div className="mt-6 text-center">
        <Link
          href={homeHref}
          className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {labels.back}
        </Link>
      </div>
    </div>
  );
}
