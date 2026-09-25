"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface PatternLabels {
  title: string;
  description: string;
  chooseLevel: string;
  easy: string;
  medium: string;
  hard: string;
  prompt: string;
  score: string;
  time: string;
  best: string;
  timeUp: string;
  timeUpMsg: string; // «Верно: {score}»
  restart: string;
  change: string;
  back: string;
}

type LevelId = "easy" | "medium" | "hard";
const DURATION = 60;
const BEST_KEY = "izn.study:pattern-best:v1";

// Наборы визуально различимых элементов — из них строится узор.
const SETS: string[][] = [
  ["🍎", "🍌", "🍇", "🍊"],
  ["🔴", "🔵", "🟢", "🟡"],
  ["⭐", "❤️", "🔷", "🟣"],
  ["🐶", "🐱", "🐭", "🐰"],
  ["🌸", "🌻", "🌷", "🌵"],
  ["🚗", "🚕", "🚌", "🚛"],
  ["⚽", "🏀", "🎾", "🏐"],
  ["🟥", "🟦", "🟩", "🟨"],
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Puzzle {
  seq: string[]; // видимые элементы (перед «?»)
  answer: string;
  options: string[];
}

function makePuzzle(level: LevelId): Puzzle {
  const set = shuffle(SETS[Math.floor(Math.random() * SETS.length)]);
  const period =
    level === "easy" ? 2 : level === "medium" ? 3 : Math.random() < 0.5 ? 3 : 4;
  const items = set.slice(0, period);
  const shown = 5;
  const seq = Array.from({ length: shown }, (_, i) => items[i % period]);
  const answer = items[shown % period];

  const opts = new Set<string>(items);
  let k = period;
  while (opts.size < 4 && k < set.length) opts.add(set[k++]);
  const options = shuffle([...opts]).slice(0, 4);
  if (!options.includes(answer)) options[0] = answer;
  return { seq, answer, options: shuffle(options) };
}

function loadBest(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(BEST_KEY) || "{}");
  } catch {
    return {};
  }
}

export function PatternGame({
  labels,
  homeHref,
}: {
  labels: PatternLabels;
  homeHref: string;
}) {
  const [level, setLevel] = useState<LevelId | null>(null);
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [over, setOver] = useState(false);
  const [flash, setFlash] = useState<"ok" | "err" | null>(null);
  const [best, setBest] = useState<Record<string, number>>({});
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => setBest(loadBest()), []);
  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const finish = useCallback((finalScore: number, lvl: LevelId) => {
    setOver(true);
    if (timer.current) clearInterval(timer.current);
    setBest((prev) => {
      const b = { ...prev };
      if (b[lvl] === undefined || finalScore > b[lvl]) {
        b[lvl] = finalScore;
        try {
          window.localStorage.setItem(BEST_KEY, JSON.stringify(b));
        } catch {
          /* ignore */
        }
      }
      return b;
    });
  }, []);

  function start(l: LevelId) {
    setLevel(l);
    setScore(0);
    setLeft(DURATION);
    setOver(false);
    setFlash(null);
    setPuzzle(makePuzzle(l));
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          if (timer.current) clearInterval(timer.current);
          setScore((sc) => {
            finish(sc, l);
            return sc;
          });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function answer(opt: string) {
    if (!puzzle || over || !level) return;
    if (opt === puzzle.answer) {
      setScore((s) => s + 1);
      setFlash("ok");
      setPuzzle(makePuzzle(level));
    } else {
      setFlash("err");
      setLeft((s) => Math.max(0, s - 3));
    }
    setTimeout(() => setFlash(null), 250);
  }

  const levelName = (l: LevelId) =>
    l === "easy" ? labels.easy : l === "medium" ? labels.medium : labels.hard;

  if (!level) {
    return (
      <div className="mx-auto w-full max-w-md">
        <p className="mb-4 text-center text-lg font-bold text-[#5c5880]">
          {labels.chooseLevel}
        </p>
        <div className="flex flex-col gap-3">
          {(["easy", "medium", "hard"] as LevelId[]).map((l) => (
            <button
              key={l}
              onClick={() => start(l)}
              className="flex items-center justify-between rounded-2xl border-2 border-black/[.06] bg-white px-6 py-5 text-left text-lg font-bold shadow-sm transition hover:-translate-y-0.5 hover:border-[#b9b3e6] hover:shadow-md"
            >
              <span>{levelName(l)}</span>
              {best[l] !== undefined && (
                <span className="text-sm font-semibold text-amber-600">
                  🥇 {best[l]}
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
      <div className="mb-5 flex items-center justify-between text-sm font-bold text-[#5c5880]">
        <span className="rounded-full bg-black/[.05] px-3 py-1">
          {labels.score}: {score}
        </span>
        <span
          className={
            "rounded-full px-3 py-1 " +
            (left <= 10 ? "bg-red-100 text-red-600" : "bg-black/[.05]")
          }
        >
          ⏱️ {left}
        </span>
      </div>

      {puzzle && !over && (
        <>
          <p className="mb-3 text-center text-sm font-semibold text-[#5c5880]">
            {labels.prompt}
          </p>
          <div
            className={
              "mb-6 flex flex-wrap items-center justify-center gap-2 rounded-3xl border py-7 shadow-sm transition " +
              (flash === "ok"
                ? "border-emerald-400 bg-emerald-50"
                : flash === "err"
                  ? "border-red-400 bg-red-50"
                  : "border-black/[.06] bg-white")
            }
          >
            {puzzle.seq.map((s, i) => (
              <span key={i} className="text-4xl sm:text-[42px]">
                {s}
              </span>
            ))}
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#efecff] font-display text-3xl font-extrabold text-[#6d5cf7] sm:h-14 sm:w-14">
              ?
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {puzzle.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => answer(opt)}
                className="rounded-2xl border-2 border-black/10 bg-white py-6 text-4xl transition hover:-translate-y-0.5 hover:border-[#b9b3e6] active:scale-95"
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setLevel(null)}
              className="text-sm font-semibold text-[#6d5cf7] hover:underline"
            >
              {labels.change}
            </button>
          </div>
        </>
      )}

      {over && (
        <div className="rounded-[2rem] border border-black/[.06] bg-white p-8 text-center shadow-xl">
          <div className="text-5xl">🔁</div>
          <h2 className="mt-3 font-display text-2xl font-extrabold">
            {labels.timeUp}
          </h2>
          <p className="mt-2 text-lg text-[#5c5880]">
            {labels.timeUpMsg.replace("{score}", String(score))}
          </p>
          {best[level] !== undefined && (
            <p className="mt-1 text-sm font-bold text-amber-600">
              🥇 {labels.best}: {best[level]}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => start(level)}
              className="rounded-full bg-[#6d5cf7] px-6 py-3 font-bold text-white shadow-md transition hover:brightness-110"
            >
              🔄 {labels.restart}
            </button>
            <button
              onClick={() => setLevel(null)}
              className="rounded-full border-2 border-black/10 px-6 py-3 font-bold transition hover:bg-black/[.04]"
            >
              {labels.change}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link
          href={homeHref}
          className="text-sm font-semibold text-[#6d5cf7] hover:underline"
        >
          {labels.back}
        </Link>
      </div>
    </div>
  );
}
