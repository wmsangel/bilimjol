"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface BuildLabels {
  title: string;
  description: string;
  chooseLevel: string;
  easy: string;
  medium: string;
  hard: string;
  roundLabel: string;
  time: string;
  best: string;
  pick: string;
  win: string;
  winMsg: string; // «Собрано за {time}»
  restart: string;
  change: string;
  back: string;
}

type LevelId = "easy" | "medium" | "hard";
type Op = "+" | "−" | "×";
const ROUNDS = 8;
const BEST_KEY = "izn.study:build-best:v1";

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
  res: number;
  missing: "b" | "res" | "op";
  answer: string;
  options: string[];
}

function makeProblem(level: LevelId): Problem {
  let a: number, b: number, op: Op;
  if (level === "easy") {
    op = Math.random() < 0.5 ? "+" : "−";
    if (op === "+") {
      a = rand(2, 10);
      b = rand(1, 10);
    } else {
      a = rand(3, 12);
      b = rand(1, a);
    }
  } else if (level === "medium") {
    op = "×";
    a = rand(2, 9);
    b = rand(2, 9);
  } else {
    if (Math.random() < 0.5) {
      op = "+";
      a = rand(12, 60);
      b = rand(10, 50);
    } else {
      op = "×";
      a = rand(3, 12);
      b = rand(3, 12);
    }
  }
  const res = apply[op](a, b);

  const missChoices: Problem["missing"][] =
    op === "×" ? ["b", "res"] : ["b", "res", "op"];
  const missing = missChoices[rand(0, missChoices.length - 1)];

  let answer: string;
  let options: string[];
  if (missing === "op") {
    answer = op;
    options = shuffle(["+", "−", "×"]);
  } else {
    const correct = missing === "b" ? b : res;
    const set = new Set<number>([correct]);
    while (set.size < 3) {
      const delta = rand(1, Math.max(2, Math.round(correct * 0.2) + 2));
      const cand = Math.random() < 0.5 ? correct + delta : correct - delta;
      if (cand >= 0) set.add(cand);
    }
    answer = String(correct);
    options = shuffle([...set].map(String));
  }
  return { a, op, b, res, missing, answer, options };
}

function loadBest(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(BEST_KEY) || "{}");
  } catch {
    return {};
  }
}

const mmss = (s: number) =>
  `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function BuildGame({
  labels,
  homeHref,
}: {
  labels: BuildLabels;
  homeHref: string;
}) {
  const [level, setLevel] = useState<LevelId | null>(null);
  const [round, setRound] = useState(0);
  const [problem, setProblem] = useState<Problem | null>(null);
  const [wrong, setWrong] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [won, setWon] = useState(false);
  const [best, setBest] = useState<Record<string, number>>({});
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => setBest(loadBest()), []);
  useEffect(() => {
    if (level && !won) {
      timer.current = setInterval(() => setSeconds((s) => s + 1), 1000);
      return () => {
        if (timer.current) clearInterval(timer.current);
      };
    }
  }, [level, won]);

  function start(l: LevelId) {
    setLevel(l);
    setRound(0);
    setSeconds(0);
    setWon(false);
    setWrong(null);
    setProblem(makeProblem(l));
  }

  function answer(opt: string) {
    if (!problem || won) return;
    if (opt !== problem.answer) {
      setWrong(opt);
      setTimeout(() => setWrong(null), 500);
      return;
    }
    setWrong(null);
    const next = round + 1;
    if (next >= ROUNDS) {
      if (timer.current) clearInterval(timer.current);
      setWon(true);
      setBest((prev) => {
        const b = { ...prev };
        if (level && (b[level] === undefined || seconds < b[level])) {
          b[level] = seconds;
          try {
            window.localStorage.setItem(BEST_KEY, JSON.stringify(b));
          } catch {
            /* ignore */
          }
        }
        return b;
      });
    } else {
      setRound(next);
      setProblem(makeProblem(level!));
    }
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
                  🥇 {mmss(best[l])}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Собираем строку примера с пропуском
  const slot = (val: string, isBlank: boolean) => (
    <span
      className={
        "inline-flex min-w-[54px] items-center justify-center rounded-xl px-2 " +
        (isBlank
          ? "border-2 border-dashed border-indigo-400 bg-indigo-50 text-indigo-400 dark:bg-indigo-500/10"
          : "")
      }
    >
      {val}
    </span>
  );

  return (
    <div className="mx-auto w-full max-w-md">
      {/* Шапка со статистикой */}
      <div className="mb-5 flex items-center justify-between text-sm font-bold text-zinc-600 dark:text-zinc-400">
        <span className="rounded-full bg-black/[.05] px-3 py-1 dark:bg-white/10">
          {labels.roundLabel}: {Math.min(round + 1, ROUNDS)}/{ROUNDS}
        </span>
        <span className="rounded-full bg-black/[.05] px-3 py-1 dark:bg-white/10">
          ⏱️ {mmss(seconds)}
        </span>
      </div>

      {problem && !won && (
        <>
          <p className="mb-3 text-center text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            {labels.pick}
          </p>
          {/* Пример */}
          <div className="mb-6 flex items-center justify-center gap-2 rounded-3xl border border-black/[.06] bg-white py-8 font-display text-4xl font-extrabold shadow-sm dark:border-white/10 dark:bg-zinc-900">
            {slot(String(problem.a), false)}
            {slot(problem.missing === "op" ? "▢" : problem.op, problem.missing === "op")}
            {slot(problem.missing === "b" ? "▢" : String(problem.b), problem.missing === "b")}
            <span>=</span>
            {slot(problem.missing === "res" ? "▢" : String(problem.res), problem.missing === "res")}
          </div>
          {/* Плитки-ответы */}
          <div className="grid grid-cols-3 gap-3">
            {problem.options.map((opt) => {
              const isWrong = wrong === opt;
              return (
                <button
                  key={opt}
                  onClick={() => answer(opt)}
                  className={
                    "rounded-2xl border-2 py-7 font-display text-3xl font-extrabold transition active:scale-95 " +
                    (isWrong
                      ? "border-red-400 bg-red-50 dark:bg-red-500/10"
                      : "border-black/10 bg-white hover:-translate-y-0.5 hover:border-indigo-400 dark:border-white/15 dark:bg-zinc-900")
                  }
                >
                  {opt}
                </button>
              );
            })}
          </div>

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
        </>
      )}

      {won && (
        <div className="rounded-[2rem] border border-black/[.06] bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-zinc-900">
          <div className="text-5xl">🎉</div>
          <h2 className="mt-3 font-display text-2xl font-extrabold">{labels.win}</h2>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            {labels.winMsg.replace("{time}", mmss(seconds))}
          </p>
          {level && best[level] !== undefined && (
            <p className="mt-1 text-sm font-bold text-amber-600 dark:text-amber-400">
              🥇 {labels.best}: {mmss(best[level])}
            </p>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => start(level!)}
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
