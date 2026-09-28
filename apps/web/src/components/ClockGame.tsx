"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface ClockLabels {
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
const BEST_KEY = "izn.study:clock-best:v1";

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

function fmt(h: number, m: number) {
  return `${h}:${String(m).padStart(2, "0")}`;
}

interface Problem {
  hour: number; // 1..12
  minutes: number;
  answer: string;
  options: string[];
}

function minutesForLevel(level: LevelId): number[] {
  if (level === "easy") return [0];
  if (level === "medium") return [0, 30];
  return [0, 15, 30, 45];
}

function makeProblem(level: LevelId): Problem {
  const mins = minutesForLevel(level);
  const hour = rand(1, 12);
  const minutes = mins[rand(0, mins.length - 1)];
  const answer = fmt(hour, minutes);

  const set = new Set<string>([answer]);
  let guard = 0;
  while (set.size < 4 && guard++ < 40) {
    const dh =
      Math.random() < 0.5 ? hour : ((hour - 1 + rand(1, 3)) % 12) + 1;
    const dm =
      Math.random() < 0.5
        ? minutes
        : mins[rand(0, mins.length - 1)];
    set.add(fmt(dh, dm));
  }
  return { hour, minutes, answer, options: shuffle([...set]) };
}

function ClockFace({ hour, minutes }: { hour: number; minutes: number }) {
  const hourAngle = ((hour % 12) * 30 + minutes * 0.5) * (Math.PI / 180);
  const minAngle = minutes * 6 * (Math.PI / 180);
  const hx = 100 + 46 * Math.sin(hourAngle);
  const hy = 100 - 46 * Math.cos(hourAngle);
  const mx = 100 + 72 * Math.sin(minAngle);
  const my = 100 - 72 * Math.cos(minAngle);
  const nums = Array.from({ length: 12 }, (_, i) => i + 1);
  return (
    <svg viewBox="0 0 200 200" className="mx-auto h-48 w-48" role="img">
      <circle cx="100" cy="100" r="94" fill="#fff" stroke="#191539" strokeWidth="5" />
      {nums.map((n) => {
        const a = n * 30 * (Math.PI / 180);
        return (
          <text
            key={n}
            x={100 + 76 * Math.sin(a)}
            y={100 - 76 * Math.cos(a) + 7}
            textAnchor="middle"
            fontSize="16"
            fontWeight="800"
            fill="#191539"
          >
            {n}
          </text>
        );
      })}
      {nums.map((n) => {
        const a = n * 30 * (Math.PI / 180);
        return (
          <line
            key={"t" + n}
            x1={100 + 90 * Math.sin(a)}
            y1={100 - 90 * Math.cos(a)}
            x2={100 + 94 * Math.sin(a)}
            y2={100 - 94 * Math.cos(a)}
            stroke="#c9c4e0"
            strokeWidth="2"
          />
        );
      })}
      <line x1="100" y1="100" x2={hx} y2={hy} stroke="#191539" strokeWidth="6" strokeLinecap="round" />
      <line x1="100" y1="100" x2={mx} y2={my} stroke="#6d5cf7" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="100" r="6" fill="#191539" />
    </svg>
  );
}

function loadBest(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(BEST_KEY) || "{}");
  } catch {
    return {};
  }
}

export function ClockGame({
  labels,
  homeHref,
}: {
  labels: ClockLabels;
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

  function answer(opt: string) {
    if (!problem || over || !level) return;
    if (opt === problem.answer) {
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
              "mb-6 rounded-3xl border py-6 shadow-sm transition " +
              (flash === "ok"
                ? "border-emerald-400 bg-emerald-50"
                : flash === "err"
                  ? "border-red-400 bg-red-50"
                  : "border-black/[.06] bg-white")
            }
          >
            <ClockFace hour={problem.hour} minutes={problem.minutes} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {problem.options.map((opt) => (
              <button
                key={opt}
                onClick={() => answer(opt)}
                className="rounded-2xl border-2 border-black/10 bg-white py-6 font-display text-3xl font-extrabold transition hover:-translate-y-0.5 hover:border-[#b9b3e6] active:scale-95"
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
          <div className="text-5xl">🕐</div>
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
