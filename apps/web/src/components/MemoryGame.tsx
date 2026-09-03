"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { playSound } from "@/lib/sound";

export interface MemoryLabels {
  title: string;
  chooseLevel: string;
  easy: string;
  medium: string;
  hard: string;
  moves: string;
  time: string;
  best: string;
  win: string;
  winMsg: string; // {moves}
  restart: string;
  back: string;
  change: string;
}

type LevelId = "easy" | "medium" | "hard";
const PAIRS = 8; // 16 карт, сетка 4×4
const BEST_KEY = "izn.study:memory:v1";

// Генерация пары «выражение → значение» по уровню.
function drawPair(level: LevelId): { label: string; value: number } {
  const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
  if (level === "easy") {
    const a = r(2, 9);
    const b = r(2, 9);
    return { label: `${a} + ${b}`, value: a + b };
  }
  if (level === "medium") {
    const a = r(2, 9);
    const b = r(2, 9);
    return { label: `${a} × ${b}`, value: a * b };
  }
  // hard: умножение 2-значного на 1-значное или процент от числа
  if (Math.random() < 0.5) {
    const a = r(11, 19);
    const b = r(3, 8);
    return { label: `${a} × ${b}`, value: a * b };
  }
  const p = [10, 20, 25, 50][Math.floor(Math.random() * 4)];
  const n = r(2, 12) * 20; // кратно 20 → целый ответ для всех p
  return { label: `${p}% от ${n}`, value: Math.round((p * n) / 100) };
}

interface Card {
  key: number;
  value: number;
  label: string;
}

function buildBoard(level: LevelId): Card[] {
  const values = new Set<number>();
  const pairs: { label: string; value: number }[] = [];
  let guard = 0;
  while (pairs.length < PAIRS && guard++ < 1000) {
    const p = drawPair(level);
    if (values.has(p.value)) continue; // значения уникальны — нет неоднозначных пар
    values.add(p.value);
    pairs.push(p);
  }
  const cards: Card[] = [];
  let k = 0;
  for (const p of pairs) {
    cards.push({ key: k++, value: p.value, label: p.label });
    cards.push({ key: k++, value: p.value, label: String(p.value) });
  }
  // Перемешиваем (Fisher–Yates).
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

function loadBest(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(BEST_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function MemoryGame({
  labels,
  homeHref,
}: {
  labels: MemoryLabels;
  homeHref: string;
}) {
  const [level, setLevel] = useState<LevelId | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]); // индексы открытых
  const [matched, setMatched] = useState<Set<number>>(new Set()); // значения
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [won, setWon] = useState(false);
  const [best, setBest] = useState<Record<string, number>>({});

  useEffect(() => setBest(loadBest()), []);

  // Таймер идёт, пока игра активна.
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!level || won) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    timer.current = id;
    return () => clearInterval(id);
  }, [level, won]);

  function start(l: LevelId) {
    setLevel(l);
    setCards(buildBoard(l));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setSeconds(0);
    setWon(false);
    setLocked(false);
  }

  function flip(i: number) {
    if (locked || won) return;
    if (flipped.includes(i) || matched.has(cards[i].value)) return;
    const next = [...flipped, i];
    setFlipped(next);
    playSound("click");
    if (next.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [a, b] = next;
      if (cards[a].value === cards[b].value) {
        // Совпадение.
        setTimeout(() => {
          const m2 = new Set(matched);
          m2.add(cards[a].value);
          setMatched(m2);
          setFlipped([]);
          setLocked(false);
          playSound("correct");
        }, 350);
      } else {
        setTimeout(() => {
          setFlipped([]);
          setLocked(false);
          playSound("wrong");
        }, 800);
      }
    }
  }

  // Победа: когда собраны все пары. moves здесь уже финальный (актуальный state).
  useEffect(() => {
    if (!level || won || matched.size !== PAIRS) return;
    setWon(true);
    playSound("unlock");
    const b = loadBest();
    const prev = b[level];
    if (prev == null || moves < prev) {
      b[level] = moves;
      try {
        window.localStorage.setItem(BEST_KEY, JSON.stringify(b));
      } catch {
        /* ignore */
      }
      setBest(b);
    }
  }, [matched, level, won, moves]);

  const mmss = useMemo(() => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }, [seconds]);

  const levelLabel = (l: LevelId) =>
    l === "easy" ? labels.easy : l === "medium" ? labels.medium : labels.hard;

  // Экран выбора уровня.
  if (!level) {
    return (
      <div className="mx-auto w-full max-w-md">
        <p className="mb-4 text-center font-semibold text-zinc-600 dark:text-zinc-400">
          {labels.chooseLevel}
        </p>
        <div className="flex flex-col gap-3">
          {(["easy", "medium", "hard"] as LevelId[]).map((l, i) => (
            <button
              key={l}
              onClick={() => start(l)}
              className={
                "flex items-center justify-between rounded-2xl px-6 py-4 text-left text-lg font-bold text-white shadow-md transition hover:brightness-110 active:scale-[.99] " +
                ["bg-gradient-to-r from-emerald-400 to-green-500", "bg-gradient-to-r from-sky-400 to-indigo-500", "bg-gradient-to-r from-fuchsia-500 to-purple-600"][i]
              }
            >
              <span>
                {["🌱", "⚡", "🔥"][i]} {levelLabel(l)}
              </span>
              {best[l] != null && (
                <span className="text-sm font-semibold opacity-90">
                  {labels.best}: {best[l]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Панель статуса */}
      <div className="mb-4 flex items-center justify-between text-sm font-bold">
        <span className="rounded-full bg-black/[.05] px-3 py-1 dark:bg-white/10">
          {labels.moves}: {moves}
        </span>
        <span className="rounded-full bg-black/[.05] px-3 py-1 dark:bg-white/10">
          ⏱️ {mmss}
        </span>
        <span className="rounded-full bg-black/[.05] px-3 py-1 dark:bg-white/10">
          {matched.size}/{PAIRS}
        </span>
      </div>

      {/* Поле */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
        {cards.map((c, i) => {
          const open = flipped.includes(i) || matched.has(c.value);
          const done = matched.has(c.value);
          return (
            <button
              key={c.key}
              onClick={() => flip(i)}
              disabled={open || locked}
              className={
                "flex aspect-square items-center justify-center rounded-2xl text-center text-base font-extrabold transition sm:text-lg " +
                (done
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                  : open
                    ? "bg-white text-zinc-900 shadow-md ring-2 ring-indigo-400 dark:bg-zinc-800 dark:text-white"
                    : "bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-sm hover:brightness-110")
              }
            >
              {open ? c.label : "?"}
            </button>
          );
        })}
      </div>

      {/* Кнопки */}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          onClick={() => start(level)}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 font-bold text-white shadow-md transition hover:brightness-110"
        >
          🔄 {labels.restart}
        </button>
        <button
          onClick={() => setLevel(null)}
          className="rounded-full border-2 border-black/10 px-6 py-3 font-bold transition hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/5"
        >
          {labels.change}
        </button>
        <Link
          href={homeHref}
          className="rounded-full px-6 py-3 font-semibold text-zinc-500 transition hover:text-foreground dark:text-zinc-400"
        >
          {labels.back}
        </Link>
      </div>

      {/* Победа */}
      {won && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-8 text-center shadow-2xl dark:bg-zinc-900">
            <div className="text-5xl">🏆</div>
            <h2 className="mt-3 font-display text-2xl font-extrabold">{labels.win}</h2>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              {labels.winMsg.replace("{moves}", String(moves))} · ⏱️ {mmss}
            </p>
            {level && best[level] != null && (
              <p className="mt-1 text-sm font-semibold text-amber-600 dark:text-amber-400">
                🥇 {labels.best}: {best[level]}
              </p>
            )}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={() => start(level)}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 font-bold text-white shadow-lg transition hover:brightness-110"
              >
                🔄 {labels.restart}
              </button>
              <button
                onClick={() => setLevel(null)}
                className="rounded-full border-2 border-black/10 px-6 py-3 font-bold transition hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/5"
              >
                {labels.change}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
