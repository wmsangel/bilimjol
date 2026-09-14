"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { speak, speechSupported, stopSpeaking } from "@/lib/speech";

export interface TraceLabels {
  title: string;
  description: string;
  hint: string;
  count: string; // «{n} из {total}»
  done: string;
  next: string;
  restart: string;
  back: string;
  setShapes: string;
  setDigits: string;
  setLetters: string;
}

interface Glyph {
  id: string;
  strokes: string[]; // каждый штрих — path d на квадрате 0..100
}

// ── Фигуры (по одному штриху) ──
const SHAPES: Glyph[] = [
  { id: "line", strokes: ["M12 50 L88 50"] },
  { id: "arc", strokes: ["M12 78 Q50 8 88 78"] },
  { id: "wave", strokes: ["M10 55 Q25 22 40 55 T70 55 T100 55"] },
  { id: "zigzag", strokes: ["M12 72 L31 28 L50 72 L69 28 L88 72"] },
  { id: "triangle", strokes: ["M50 14 L86 84 L14 84 Z"] },
  { id: "square", strokes: ["M22 22 L78 22 L78 78 L22 78 Z"] },
  {
    id: "circle",
    strokes: [
      "M50 12 C71 12 88 29 88 50 C88 71 71 88 50 88 C29 88 12 71 12 50 C12 29 29 12 50 12 Z",
    ],
  },
];

// ── Цифры 0–9 ──
const DIGITS: Glyph[] = [
  { id: "0", strokes: ["M50 15 C31 15 23 32 23 50 C23 68 31 85 50 85 C69 85 77 68 77 50 C77 32 69 15 50 15 Z"] },
  { id: "1", strokes: ["M34 30 L52 15 L52 85"] },
  { id: "2", strokes: ["M28 32 C28 16 62 12 70 32 C76 48 50 58 28 84 L78 84"] },
  { id: "3", strokes: ["M30 26 C48 12 74 20 64 42 C58 52 50 51 50 51 C60 50 80 58 70 80 C62 94 36 90 28 76"] },
  { id: "4", strokes: ["M62 14 L20 64 L82 64", "M64 30 L64 86"] },
  { id: "5", strokes: ["M70 16 L36 16 L31 46 C56 39 78 50 70 70 C62 90 34 86 26 72"] },
  { id: "6", strokes: ["M66 18 C44 22 29 44 29 64 C29 82 47 90 59 80 C72 69 67 50 47 51 C37 52 31 59 30 66"] },
  { id: "7", strokes: ["M22 16 L80 16 L44 86"] },
  { id: "8", strokes: ["M50 50 C34 46 34 22 50 16 C66 22 66 46 50 50 C72 55 74 84 50 86 C26 84 28 55 50 50 Z"] },
  { id: "9", strokes: ["M66 40 C66 24 46 18 36 32 C27 44 37 59 54 57 C63 56 66 47 66 40 C66 62 60 80 42 88"] },
];

// ── Буквы: полный алфавит (кыргызские Ң Ө Ү идут после Н О У) ──
const LETTERS: Glyph[] = [
  { id: "А", strokes: ["M20 86 L50 14 L80 86", "M33 58 L67 58"] },
  { id: "Б", strokes: ["M70 16 L32 16 L32 84 L60 84 C76 84 76 52 60 52 L32 52"] },
  { id: "В", strokes: ["M32 16 L32 84", "M32 16 L60 16 C76 16 76 48 58 50 C78 52 78 84 60 84 L32 84"] },
  { id: "Г", strokes: ["M28 84 L28 16 L74 16"] },
  { id: "Д", strokes: ["M34 16 L66 16 L66 84", "M34 16 L34 84", "M22 84 L82 84"] },
  { id: "Е", strokes: ["M66 16 L30 16 L30 84 L66 84", "M30 50 L58 50"] },
  { id: "Ё", strokes: ["M66 24 L30 24 L30 84 L66 84", "M30 54 L58 54", "M40 12 L40 18", "M60 12 L60 18"] },
  { id: "Ж", strokes: ["M50 14 L50 86", "M22 20 L78 80", "M78 20 L22 80"] },
  { id: "З", strokes: ["M28 24 C44 12 70 18 66 36 C64 48 48 50 48 50 C64 50 74 60 70 76 C64 92 34 90 28 74"] },
  { id: "И", strokes: ["M28 84 L28 16", "M72 84 L72 16", "M28 80 L72 20"] },
  { id: "Й", strokes: ["M28 84 L28 16", "M72 84 L72 16", "M28 80 L72 20", "M40 10 Q50 18 60 10"] },
  { id: "К", strokes: ["M30 16 L30 84", "M72 16 L34 50 L72 84"] },
  { id: "Л", strokes: ["M28 84 L46 16 L58 16 L74 84"] },
  { id: "М", strokes: ["M24 84 L24 16 L50 56 L76 16 L76 84"] },
  { id: "Н", strokes: ["M28 16 L28 84", "M72 16 L72 84", "M28 50 L72 50"] },
  { id: "Ң", strokes: ["M28 16 L28 84", "M72 16 L72 84", "M28 50 L72 50", "M72 84 L80 94"] },
  { id: "О", strokes: ["M50 15 C31 15 23 32 23 50 C23 68 31 85 50 85 C69 85 77 68 77 50 C77 32 69 15 50 15 Z"] },
  { id: "Ө", strokes: ["M50 15 C31 15 23 32 23 50 C23 68 31 85 50 85 C69 85 77 68 77 50 C77 32 69 15 50 15 Z", "M34 50 L66 50"] },
  { id: "П", strokes: ["M28 84 L28 16 L72 16 L72 84"] },
  { id: "Р", strokes: ["M32 84 L32 16 L60 16 C80 16 80 52 60 52 L32 52"] },
  { id: "С", strokes: ["M76 28 C62 14 26 18 24 50 C26 82 62 86 76 72"] },
  { id: "Т", strokes: ["M20 16 L80 16", "M50 16 L50 84"] },
  { id: "У", strokes: ["M26 16 L50 56 L74 16", "M50 56 L44 86 C42 94 30 92 28 84"] },
  { id: "Ү", strokes: ["M28 16 L50 52 L72 16", "M50 52 L50 86"] },
  { id: "Ф", strokes: ["M50 16 L50 84", "M50 26 C30 26 30 62 50 62 C70 62 70 26 50 26 Z"] },
  { id: "Х", strokes: ["M24 16 L76 84", "M76 16 L24 84"] },
  { id: "Ц", strokes: ["M28 16 L28 84 L72 84 L72 16", "M72 84 L78 94"] },
  { id: "Ч", strokes: ["M30 16 L30 42 L70 42", "M70 16 L70 84"] },
  { id: "Ш", strokes: ["M24 16 L24 84 L76 84 L76 16", "M50 16 L50 84"] },
  { id: "Щ", strokes: ["M24 16 L24 84 L76 84 L76 16", "M50 16 L50 84", "M76 84 L82 94"] },
  { id: "Ъ", strokes: ["M30 16 L44 16", "M44 16 L44 84 L64 84 C78 84 78 56 64 56 L44 56"] },
  { id: "Ы", strokes: ["M30 16 L30 84 L52 84 C64 84 64 56 52 56 L30 56", "M74 16 L74 84"] },
  { id: "Ь", strokes: ["M34 16 L34 84 L58 84 C72 84 72 54 58 54 L34 54"] },
  { id: "Э", strokes: ["M26 26 C40 14 72 18 74 50 C72 82 40 86 26 74", "M48 50 L74 50"] },
  { id: "Ю", strokes: ["M28 16 L28 84", "M28 50 L44 50", "M62 26 C44 26 44 74 62 74 C80 74 80 26 62 26 Z"] },
  { id: "Я", strokes: ["M64 84 L64 16 L40 16 C24 16 24 50 40 50 L64 50", "M40 50 L24 84"] },
];

const SETS = { shapes: SHAPES, digits: DIGITS, letters: LETTERS } as const;
type SetId = keyof typeof SETS;

const REACH = 14;
const SAMPLES = 40;

interface Pt {
  x: number;
  y: number;
}

export function TraceGame({
  labels,
  homeHref,
  locale,
}: {
  labels: TraceLabels;
  homeHref: string;
  locale: string;
}) {
  const [setId, setSetId] = useState<SetId>("shapes");
  const [glyphIdx, setGlyphIdx] = useState(0);
  const [strokeIdx, setStrokeIdx] = useState(0);
  const [progress, setProgress] = useState(0); // текущий штрих, 0..1
  const [done, setDone] = useState(false);
  const [drawing, setDrawing] = useState(false);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const strokeRefs = useRef<(SVGPathElement | null)[]>([]);
  const points = useRef<Pt[][]>([]);
  const reached = useRef(0);

  const glyphs = SETS[setId];
  const total = glyphs.length;
  const glyph = glyphs[glyphIdx];

  // Пересчёт контрольных точек для всех штрихов при смене глифа/набора.
  useEffect(() => {
    const arr: Pt[][] = [];
    glyph.strokes.forEach((_, i) => {
      const el = strokeRefs.current[i];
      if (!el) return;
      const len = el.getTotalLength();
      const pts: Pt[] = [];
      for (let k = 0; k <= SAMPLES; k++) {
        const p = el.getPointAtLength((len * k) / SAMPLES);
        pts.push({ x: p.x, y: p.y });
      }
      arr[i] = pts;
    });
    points.current = arr;
    reached.current = 0;
    setStrokeIdx(0);
    setProgress(0);
    setDone(false);
  }, [setId, glyphIdx, glyph.strokes]);

  // Озвучка буквы/цифры при показе — для тех, кто ещё не читает.
  useEffect(() => {
    if (setId === "shapes") return;
    const timer = setTimeout(() => speak(glyph.id, locale), 350);
    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setId, glyphIdx, locale]);

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
      const pts = points.current[strokeIdx];
      if (!pts || !pts.length) return;
      const p = toSvg(clientX, clientY);
      let i = reached.current;
      while (i < pts.length) {
        const d = Math.hypot(pts[i].x - p.x, pts[i].y - p.y);
        if (d <= REACH) i++;
        else break;
      }
      if (i > reached.current) {
        reached.current = i;
        const prog = i / (pts.length - 1);
        setProgress(prog);
        if (prog >= 0.9) {
          if (strokeIdx + 1 < glyph.strokes.length) {
            setStrokeIdx(strokeIdx + 1);
            reached.current = 0;
            setProgress(0);
          } else {
            setProgress(1);
            setDone(true);
            setDrawing(false);
          }
        }
      }
    },
    [done, toSvg, strokeIdx, glyph.strokes.length],
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

  function restartGlyph() {
    reached.current = 0;
    setStrokeIdx(0);
    setProgress(0);
    setDone(false);
  }
  function next() {
    setGlyphIdx((glyphIdx + 1) % total);
  }
  function chooseSet(s: SetId) {
    setSetId(s);
    setGlyphIdx(0);
  }

  const cur = points.current[strokeIdx];
  const start = cur?.[0];
  const end = cur?.[cur.length - 1];
  const multi = glyph.strokes.length > 1;

  const setBtn = (s: SetId, text: string) => (
    <button
      key={s}
      onClick={() => chooseSet(s)}
      className={
        "flex-1 rounded-full px-4 py-2 text-sm font-bold transition " +
        (setId === s
          ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow"
          : "text-zinc-500 hover:text-foreground dark:text-zinc-400")
      }
    >
      {text}
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Выбор набора */}
      <div className="mb-4 flex gap-1 rounded-full border border-black/[.06] bg-white p-1 dark:border-white/10 dark:bg-zinc-900">
        {setBtn("shapes", labels.setShapes)}
        {setBtn("digits", labels.setDigits)}
        {setBtn("letters", labels.setLetters)}
      </div>

      <div className="mb-3 flex items-center justify-between text-sm font-bold text-zinc-600 dark:text-zinc-400">
        <span className="rounded-full bg-black/[.05] px-3 py-1 dark:bg-white/10">
          {labels.count
            .replace("{n}", String(glyphIdx + 1))
            .replace("{total}", String(total))}
        </span>
        <div className="flex items-center gap-2">
          {setId !== "shapes" && speechSupported() && (
            <button
              type="button"
              onClick={() => speak(glyph.id, locale)}
              aria-label={locale === "ky" ? "Үнү менен угуу" : "Озвучить"}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-base transition hover:bg-indigo-200 active:scale-95 dark:bg-indigo-500/20"
            >
              🔊
            </button>
          )}
          <span className="rounded-full bg-black/[.05] px-3 py-1 dark:bg-white/10">
            {Math.round(progress * 100)}%
          </span>
        </div>
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
          <defs>
            <linearGradient id="traceGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#6366f1" />
              <stop offset="1" stopColor="#8b5cf6" />
            </linearGradient>
          </defs>

          {/* Дороги-направляющие для всех штрихов */}
          {glyph.strokes.map((d, i) => (
            <path
              key={`g${i}`}
              ref={(el) => {
                strokeRefs.current[i] = el;
              }}
              d={d}
              fill="none"
              stroke="currentColor"
              className="text-indigo-100 dark:text-indigo-500/20"
              strokeWidth={14}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          {/* Пунктир по центру */}
          {glyph.strokes.map((d, i) => (
            <path
              key={`d${i}`}
              d={d}
              fill="none"
              stroke="currentColor"
              className="text-indigo-300 dark:text-indigo-400/40"
              strokeWidth={2}
              strokeDasharray="1 7"
              strokeLinecap="round"
            />
          ))}
          {/* Обведённая часть: прошлые штрихи целиком, текущий — по прогрессу */}
          {glyph.strokes.map((d, i) => {
            if (i > strokeIdx) return null;
            const off = i < strokeIdx ? 0 : 100 - progress * 100;
            return (
              <path
                key={`t${i}`}
                d={d}
                fill="none"
                stroke="url(#traceGrad)"
                strokeWidth={14}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={100}
                style={{
                  strokeDasharray: 100,
                  strokeDashoffset: off,
                  transition: "stroke-dashoffset .1s linear",
                }}
              />
            );
          })}
          {/* Номера порядка штрихов (для много-штриховых) */}
          {multi &&
            !done &&
            glyph.strokes.map((_, i) => {
              const p = points.current[i]?.[0];
              if (!p) return null;
              return (
                <g key={`n${i}`}>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={7}
                    fill={i === strokeIdx ? "#22c55e" : "#c7d2fe"}
                    stroke="#fff"
                    strokeWidth={1.5}
                  />
                  <text
                    x={p.x}
                    y={p.y + 3.2}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight="700"
                    fill={i === strokeIdx ? "#fff" : "#4338ca"}
                  >
                    {i + 1}
                  </text>
                </g>
              );
            })}
          {/* Старт/финиш текущего штриха (для одно-штриховых) */}
          {!multi && start && !done && (
            <circle cx={start.x} cy={start.y} r={5} fill="#22c55e" stroke="#fff" strokeWidth={1.5} />
          )}
          {!multi && end && !done && (
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
            onClick={restartGlyph}
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
