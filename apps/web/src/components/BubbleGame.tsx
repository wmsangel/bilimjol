"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface BubbleLabels {
  title: string;
  description: string;
  start: string;
  score: string;
  time: string;
  best: string;
  rules: {
    even: string;
    odd: string;
    mult3: string;
    gt10: string;
    vowels: string;
  };
  timeUp: string;
  timeUpMsg: string; // «Поймано: {score}»
  restart: string;
  back: string;
}

type RuleId = keyof BubbleLabels["rules"];
const DURATION = 45;
const BEST_KEY = "izn.study:bubbles-best:v1";
const VOWELS = "АЕЁИОУЫЭЮЯ";
const CONSON = "БВГДЖЗКЛМНПРСТФХЦЧШЩ";

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

const NUMBER_RULES: RuleId[] = ["even", "odd", "mult3", "gt10"];
const ALL_RULES: RuleId[] = [...NUMBER_RULES, "vowels"];

function matches(rule: RuleId, v: string | number): boolean {
  if (rule === "vowels") return VOWELS.includes(String(v));
  const n = Number(v);
  if (rule === "even") return n % 2 === 0;
  if (rule === "odd") return n % 2 === 1;
  if (rule === "mult3") return n % 3 === 0;
  return n > 10; // gt10
}

interface Bubble {
  key: number;
  label: string;
}

let uid = 0;
function makeBoard(rule: RuleId): { rule: RuleId; bubbles: Bubble[] } {
  const values: (string | number)[] = [];
  if (rule === "vowels") {
    const good = shuffle(VOWELS.split("")).slice(0, rand(3, 4));
    const bad = shuffle(CONSON.split("")).slice(0, 9 - good.length);
    values.push(...good, ...bad);
  } else {
    // числовое правило: гарантируем 3–5 подходящих
    const pool = Array.from({ length: 20 }, (_, i) => i + 1);
    const good = shuffle(pool.filter((n) => matches(rule, n))).slice(
      0,
      rand(3, 5),
    );
    const bad = shuffle(pool.filter((n) => !matches(rule, n))).slice(
      0,
      9 - good.length,
    );
    values.push(...good, ...bad);
  }
  return {
    rule,
    bubbles: shuffle(values).map((v) => ({ key: uid++, label: String(v) })),
  };
}

function nextRule(prev: RuleId | null): RuleId {
  let r: RuleId;
  do {
    r = ALL_RULES[rand(0, ALL_RULES.length - 1)];
  } while (r === prev);
  return r;
}

function loadBest(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(window.localStorage.getItem(BEST_KEY) || "0");
  } catch {
    return 0;
  }
}

const HUES = [
  "from-rose-400 to-pink-500",
  "from-amber-400 to-orange-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-indigo-500",
  "from-violet-400 to-purple-500",
  "from-cyan-400 to-blue-500",
];

export function BubbleGame({
  labels,
  homeHref,
}: {
  labels: BubbleLabels;
  homeHref: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [board, setBoard] = useState<{ rule: RuleId; bubbles: Bubble[] } | null>(
    null,
  );
  const [popped, setPopped] = useState<Set<number>>(new Set());
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [over, setOver] = useState(false);
  const [wrongKey, setWrongKey] = useState<number | null>(null);
  const [best, setBest] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => setBest(loadBest()), []);
  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const finish = useCallback((finalScore: number) => {
    setOver(true);
    setPlaying(false);
    if (timer.current) clearInterval(timer.current);
    setBest((prev) => {
      if (finalScore > prev) {
        try {
          window.localStorage.setItem(BEST_KEY, String(finalScore));
        } catch {
          /* ignore */
        }
        return finalScore;
      }
      return prev;
    });
  }, []);

  function start() {
    setPlaying(true);
    setOver(false);
    setScore(0);
    setLeft(DURATION);
    setPopped(new Set());
    setBoard(makeBoard(nextRule(null)));
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          if (timer.current) clearInterval(timer.current);
          setScore((sc) => {
            finish(sc);
            return sc;
          });
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }

  function pop(b: Bubble) {
    if (!board || over || popped.has(b.key)) return;
    if (matches(board.rule, b.label)) {
      const nextPopped = new Set(popped).add(b.key);
      setPopped(nextPopped);
      setScore((s) => s + 1);
      const need = board.bubbles.filter((x) => matches(board.rule, x.label));
      if (need.every((x) => nextPopped.has(x.key))) {
        // доска пройдена — новая с новым правилом
        setTimeout(() => {
          setPopped(new Set());
          setBoard((prev) => makeBoard(nextRule(prev ? prev.rule : null)));
        }, 220);
      }
    } else {
      setWrongKey(b.key);
      setLeft((s) => Math.max(0, s - 2)); // штраф 2 секунды
      setTimeout(() => setWrongKey(null), 300);
    }
  }

  // Стартовый экран
  if (!playing && !over) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <p className="mb-6 text-lg font-semibold text-zinc-600 dark:text-zinc-400">
          {labels.description}
        </p>
        {best > 0 && (
          <p className="mb-4 text-sm font-bold text-amber-600 dark:text-amber-400">
            🥇 {labels.best}: {best}
          </p>
        )}
        <button
          onClick={start}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-10 py-4 text-lg font-bold text-white shadow-md transition hover:brightness-110 active:scale-95"
        >
          ▶ {labels.start}
        </button>
        <div className="mt-8">
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

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-4 flex items-center justify-between text-sm font-bold text-zinc-600 dark:text-zinc-400">
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

      {board && !over && (
        <>
          <p className="mb-4 rounded-2xl bg-indigo-50 py-3 text-center font-display text-lg font-extrabold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
            {labels.rules[board.rule]}
          </p>
          <div className="grid grid-cols-3 gap-3">
            {board.bubbles.map((b, i) => {
              const isPopped = popped.has(b.key);
              const isWrong = wrongKey === b.key;
              return (
                <button
                  key={b.key}
                  onClick={() => pop(b)}
                  disabled={isPopped}
                  className={
                    "flex aspect-square items-center justify-center rounded-full font-display text-3xl font-extrabold text-white shadow-md transition active:scale-90 " +
                    (isPopped
                      ? "scale-0 opacity-0"
                      : isWrong
                        ? "bg-red-500"
                        : "bg-gradient-to-br " + HUES[i % HUES.length])
                  }
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      {over && (
        <div className="rounded-[2rem] border border-black/[.06] bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-zinc-900">
          <div className="text-5xl">🎈</div>
          <h2 className="mt-3 font-display text-2xl font-extrabold">
            {labels.timeUp}
          </h2>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            {labels.timeUpMsg.replace("{score}", String(score))}
          </p>
          <p className="mt-1 text-sm font-bold text-amber-600 dark:text-amber-400">
            🥇 {labels.best}: {best}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={start}
              className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 font-bold text-white shadow-md transition hover:brightness-110"
            >
              🔄 {labels.restart}
            </button>
            <Link
              href={homeHref}
              className="rounded-full border-2 border-black/10 px-6 py-3 font-bold transition hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/5"
            >
              {labels.back}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
