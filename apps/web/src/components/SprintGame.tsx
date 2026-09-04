"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface SprintLabels {
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
  timeUpMsg: string; // «Решено верно: {score}»
  restart: string;
  change: string;
  back: string;
}

type LevelId = "easy" | "medium" | "hard";
type Op = "+" | "−" | "×";
const DURATION = 60;
const BEST_KEY = "izn.study:sprint-best:v1";

const apply: Record<Op, (a: number, b: number) => number> = {
  "+": (a, b) => a + b,
  "−": (a, b) => a - b,
  "×": (a, b) => a * b,
};

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Problem {
  a: number;
  op: Op;
  b: number;
  answer: number;
  options: number[];
}

function makeProblem(level: LevelId): Problem {
  let a: number, b: number, op: Op;
  if (level === "easy") {
    op = Math.random() < 0.5 ? "+" : "−";
    if (op === "+") {
      a = rand(2, 12);
      b = rand(1, 12);
    } else {
      a = rand(4, 18);
      b = rand(1, a);
    }
  } else if (level === "medium") {
    op = "×";
    a = rand(2, 9);
    b = rand(2, 9);
  } else {
    const r = Math.random();
    if (r < 0.4) {
      op = "+";
      a = rand(15, 70);
      b = rand(10, 60);
    } else if (r < 0.7) {
      op = "−";
      a = rand(20, 90);
      b = rand(5, a);
    } else {
      op = "×";
      a = rand(4, 13);
      b = rand(4, 13);
    }
  }
  const answer = apply[op](a, b);

  const set = new Set<number>([answer]);
  while (set.size < 4) {
    const delta = rand(1, Math.max(3, Math.round(answer * 0.25) + 2));
    const cand = Math.random() < 0.5 ? answer + delta : answer - delta;
    if (cand >= 0) set.add(cand);
  }
  return { a, op, b, answer, options: shuffle([...set]) };
}

function loadBest(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(BEST_KEY) || "{}");
  } catch {
    return {};
  }
}

export function SprintGame({
  labels,
  homeHref,
}: {
  labels: SprintLabels;
  homeHref: string;
}) {
  const [level, setLevel] = useState<LevelId | null>(null);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [over, setOver] = useState(false);
  const [flash, setFlash] = useState<"ok" | "err" | null>(null);
  const [best, setBest] = useState<Record<string, number>>({});
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => setBest(loadBest()), []);

  const finish = useCallback(
    (finalScore: number, lvl: LevelId) => {
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
    },
    [],
  );

  function start(l: LevelId) {
    setLevel(l);
    setScore(0);
    setLeft(DURATION);
    setOver(false);
    setFlash(null);
    setProblem(makeProblem(l));
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

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  function answer(opt: number) {
    if (!problem || over || !level) return;
    if (opt === problem.answer) {
      setScore((s) => s + 1);
      setFlash("ok");
      setProblem(makeProblem(level));
    } else {
      setFlash("err");
      setLeft((s) => Math.max(0, s - 3)); // штраф 3 секунды
    }
    setTimeout(() => setFlash(null), 250);
  }

  const levelName = (l: LevelId) =>
    l === "easy" ? labels.easy : l === "medium" ? labels.medium : labels.hard;

  // Экран выбора уровня
  if (!level) {
    return (
      <div className="mx-auto w-full max-w-md">
        <p className="mb-4 text-center text-lg font-bold text-zinc-600 dark:text-zinc-400">
          {labels.chooseLevel}
        </p>
        <div className="flex flex-col gap-3">
          {(["easy", "medium", "hard"] as LevelId[]).map((l) => (
            <button
              key={l}
              onClick={() => start(l)}
              className="flex items-center justify-between rounded-2xl border-2 border-black/[.06] bg-white px-6 py-5 text-left text-lg font-bold shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-white/10 dark:bg-zinc-900"
            >
              <span>{levelName(l)}</span>
              {best[l] !== undefined && (
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
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
      {/* Шапка */}
      <div className="mb-5 flex items-center justify-between text-sm font-bold text-zinc-600 dark:text-zinc-400">
        <span className="rounded-full bg-black/[.05] px-3 py-1 dark:bg-white/10">
          {labels.score}: {score}
        </span>
        <span
          className={
            "rounded-full px-3 py-1 " +
            (left <= 10
              ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
              : "bg-black/[.05] dark:bg-white/10")
          }
        >
          ⏱️ {left}
        </span>
      </div>

      {problem && !over && (
        <>
          <p className="mb-3 text-center text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {labels.prompt}
          </p>
          <div
            className={
              "mb-6 flex items-center justify-center gap-3 rounded-3xl border py-8 font-display text-5xl font-extrabold shadow-sm transition " +
              (flash === "ok"
                ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10"
                : flash === "err"
                  ? "border-red-400 bg-red-50 dark:bg-red-500/10"
                  : "border-black/[.06] bg-white dark:border-white/10 dark:bg-zinc-900")
            }
          >
            <span>{problem.a}</span>
            <span className="text-indigo-500">{problem.op}</span>
            <span>{problem.b}</span>
            <span>=</span>
            <span className="text-indigo-400">?</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {problem.options.map((opt) => (
              <button
                key={opt}
                onClick={() => answer(opt)}
                className="rounded-2xl border-2 border-black/10 bg-white py-7 font-display text-3xl font-extrabold transition hover:-translate-y-0.5 hover:border-indigo-400 active:scale-95 dark:border-white/15 dark:bg-zinc-900"
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={() => setLevel(null)}
              className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              {labels.change}
            </button>
          </div>
        </>
      )}

      {over && (
        <div className="rounded-[2rem] border border-black/[.06] bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-zinc-900">
          <div className="text-5xl">⏱️</div>
          <h2 className="mt-3 font-display text-2xl font-extrabold">
            {labels.timeUp}
          </h2>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            {labels.timeUpMsg.replace("{score}", String(score))}
          </p>
          {best[level] !== undefined && (
            <p className="mt-1 text-sm font-bold text-amber-600 dark:text-amber-400">
              🥇 {labels.best}: {best[level]}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
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
          </div>
        </div>
      )}

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
