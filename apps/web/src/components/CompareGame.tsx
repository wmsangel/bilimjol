"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface CompareLabels {
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
type Sign = ">" | "<" | "=";
const DURATION = 60;
const BEST_KEY = "izn.study:compare-best:v1";
const EMOJI = ["🟣", "🔵", "🟢", "🟡", "🔴", "⭐", "🍎", "🐱"];

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

interface Problem {
  left: string; // отображение
  right: string;
  emojiMode: boolean; // true → крупные эмодзи-группы, false → числа/примеры
  answer: Sign;
}

function hardSide(): { display: string; value: number } {
  const r = Math.random();
  if (r < 0.35) {
    const a = rand(2, 20);
    const b = rand(1, 15);
    return { display: `${a}+${b}`, value: a + b };
  }
  if (r < 0.55) {
    const x = rand(5, 30);
    const y = rand(1, x);
    return { display: `${x}−${y}`, value: x - y };
  }
  const n = rand(1, 99);
  return { display: String(n), value: n };
}

function compare(a: number, b: number): Sign {
  return a > b ? ">" : a < b ? "<" : "=";
}

function makeProblem(level: LevelId): Problem {
  if (level === "easy") {
    const emoji = EMOJI[rand(0, EMOJI.length - 1)];
    let a = rand(1, 6);
    let b = rand(1, 6);
    if (Math.random() < 0.25) b = a; // иногда «равно»
    return {
      left: emoji.repeat(a),
      right: emoji.repeat(b),
      emojiMode: true,
      answer: compare(a, b),
    };
  }
  if (level === "medium") {
    let a = rand(1, 30);
    let b = rand(1, 30);
    if (Math.random() < 0.25) b = a;
    return { left: String(a), right: String(b), emojiMode: false, answer: compare(a, b) };
  }
  // hard
  const l = hardSide();
  let r = hardSide();
  if (Math.random() < 0.2) r = { display: String(l.value), value: l.value };
  return { left: l.display, right: r.display, emojiMode: false, answer: compare(l.value, r.value) };
}

function loadBest(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(BEST_KEY) || "{}");
  } catch {
    return {};
  }
}

export function CompareGame({
  labels,
  homeHref,
}: {
  labels: CompareLabels;
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

  function answer(sign: Sign) {
    if (!problem || over || !level) return;
    if (sign === problem.answer) {
      setScore((s) => s + 1);
      setFlash("ok");
      setProblem(makeProblem(level));
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

      {problem && !over && (
        <>
          <p className="mb-3 text-center text-sm font-semibold text-[#5c5880]">
            {labels.prompt}
          </p>
          <div
            className={
              "mb-6 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-3xl border py-8 shadow-sm transition " +
              (flash === "ok"
                ? "border-emerald-400 bg-emerald-50"
                : flash === "err"
                  ? "border-red-400 bg-red-50"
                  : "border-black/[.06] bg-white")
            }
          >
            <div
              className={
                "flex flex-wrap items-center justify-center gap-1 px-2 text-center font-display font-extrabold text-[#191539] " +
                (problem.emojiMode ? "text-2xl" : "text-5xl")
              }
            >
              {problem.left}
            </div>
            <div className="font-display text-4xl font-extrabold text-[#6d5cf7]">?</div>
            <div
              className={
                "flex flex-wrap items-center justify-center gap-1 px-2 text-center font-display font-extrabold text-[#191539] " +
                (problem.emojiMode ? "text-2xl" : "text-5xl")
              }
            >
              {problem.right}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(["<", "=", ">"] as Sign[]).map((sign) => (
              <button
                key={sign}
                onClick={() => answer(sign)}
                className="rounded-2xl border-2 border-black/10 bg-white py-6 font-display text-4xl font-extrabold transition hover:-translate-y-0.5 hover:border-[#b9b3e6] active:scale-95"
              >
                {sign}
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
          <div className="text-5xl">⚖️</div>
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
