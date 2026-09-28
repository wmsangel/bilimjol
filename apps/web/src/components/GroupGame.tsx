"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface GroupLabels {
  title: string;
  description: string;
  start: string; // «Играть»
  prompt: string; // «К какой группе?»
  score: string;
  best: string;
  timeUp: string;
  timeUpMsg: string; // «Верно: {score}»
  restart: string;
  back: string;
}

type Locale = "ru" | "ky";
const DURATION = 60;
const BEST_KEY = "izn.study:group-best:v1";

interface Category {
  label: { ru: string; ky: string };
  items: string[];
}
// Раунд = набор из 2–3 категорий; предмет из одной — угадай, из какой.
const GROUPS: Category[][] = [
  [
    { label: { ru: "Фрукты", ky: "Мөмө-жемиш" }, items: ["🍎", "🍌", "🍇", "🍊", "🍓", "🍑"] },
    { label: { ru: "Овощи", ky: "Жашылча" }, items: ["🥕", "🥔", "🍅", "🥒", "🌽", "🧅"] },
  ],
  [
    { label: { ru: "Дикие", ky: "Жапайы" }, items: ["🦁", "🐘", "🦊", "🐻", "🐺", "🦒"] },
    { label: { ru: "Домашние", ky: "Үй жаныбары" }, items: ["🐶", "🐱", "🐄", "🐔", "🐴", "🐑"] },
  ],
  [
    { label: { ru: "Живое", ky: "Тирүү" }, items: ["🐶", "🌳", "🐟", "🌸", "🦋", "🐝"] },
    { label: { ru: "Неживое", ky: "Жансыз" }, items: ["🚗", "🪑", "📕", "⚽", "🥄", "🔑"] },
  ],
  [
    { label: { ru: "Едет", ky: "Жүрөт" }, items: ["🚗", "🚌", "🚲", "🚛"] },
    { label: { ru: "Летит", ky: "Учат" }, items: ["✈️", "🚁", "🎈", "🚀"] },
    { label: { ru: "Плывёт", ky: "Сүзөт" }, items: ["🚢", "⛵", "🛶"] },
  ],
];

const rand = (n: number) => Math.floor(Math.random() * n);
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface Round {
  item: string;
  answer: number; // индекс правильной категории в cats
  cats: Category[]; // порядок для показа
}

function makeRound(): Round {
  const group = GROUPS[rand(GROUPS.length)];
  const cats = shuffle(group);
  const answer = rand(cats.length);
  const items = cats[answer].items;
  const item = items[rand(items.length)];
  return { item, answer, cats };
}

function loadBest(): number {
  if (typeof window === "undefined") return 0;
  try {
    return Number(window.localStorage.getItem(BEST_KEY) || "0");
  } catch {
    return 0;
  }
}

export function GroupGame({
  labels,
  locale,
  homeHref,
}: {
  labels: GroupLabels;
  locale: Locale;
  homeHref: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [round, setRound] = useState<Round | null>(null);
  const [score, setScore] = useState(0);
  const [left, setLeft] = useState(DURATION);
  const [over, setOver] = useState(false);
  const [flash, setFlash] = useState<"ok" | "err" | null>(null);
  const [best, setBest] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => setBest(loadBest()), []);
  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
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
    setScore(0);
    setLeft(DURATION);
    setOver(false);
    setFlash(null);
    setRound(makeRound());
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

  function pick(i: number) {
    if (!round || over || !playing) return;
    if (i === round.answer) {
      setScore((s) => s + 1);
      setFlash("ok");
      setRound(makeRound());
    } else {
      setFlash("err");
      setLeft((s) => Math.max(0, s - 3));
    }
    setTimeout(() => setFlash(null), 250);
  }

  // Стартовый экран
  if (!playing && !over) {
    return (
      <div className="mx-auto w-full max-w-md text-center">
        <p className="mb-6 text-lg font-bold text-[#5c5880]">{labels.description}</p>
        <button
          onClick={start}
          className="rounded-full bg-[#6d5cf7] px-8 py-4 text-lg font-extrabold text-white shadow-md transition hover:brightness-110"
        >
          ▶ {labels.start}
        </button>
        {best > 0 && (
          <p className="mt-4 text-sm font-bold text-amber-600">
            🥇 {labels.best}: {best}
          </p>
        )}
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

      {round && !over && (
        <>
          <p className="mb-3 text-center text-sm font-semibold text-[#5c5880]">
            {labels.prompt}
          </p>
          <div
            className={
              "mb-6 flex items-center justify-center rounded-3xl border py-10 text-[72px] leading-none shadow-sm transition " +
              (flash === "ok"
                ? "border-emerald-400 bg-emerald-50"
                : flash === "err"
                  ? "border-red-400 bg-red-50"
                  : "border-black/[.06] bg-white")
            }
          >
            {round.item}
          </div>
          <div
            className={
              "grid gap-3 " + (round.cats.length === 3 ? "grid-cols-1" : "grid-cols-2")
            }
          >
            {round.cats.map((cat, i) => (
              <button
                key={i}
                onClick={() => pick(i)}
                className="rounded-2xl border-2 border-black/10 bg-white py-5 font-display text-xl font-extrabold transition hover:-translate-y-0.5 hover:border-[#b9b3e6] active:scale-95"
              >
                {cat.label[locale]}
              </button>
            ))}
          </div>
        </>
      )}

      {over && (
        <div className="rounded-[2rem] border border-black/[.06] bg-white p-8 text-center shadow-xl">
          <div className="text-5xl">🧺</div>
          <h2 className="mt-3 font-display text-2xl font-extrabold">
            {labels.timeUp}
          </h2>
          <p className="mt-2 text-lg text-[#5c5880]">
            {labels.timeUpMsg.replace("{score}", String(score))}
          </p>
          {best > 0 && (
            <p className="mt-1 text-sm font-bold text-amber-600">
              🥇 {labels.best}: {best}
            </p>
          )}
          <div className="mt-6 flex justify-center">
            <button
              onClick={start}
              className="rounded-full bg-[#6d5cf7] px-6 py-3 font-bold text-white shadow-md transition hover:brightness-110"
            >
              🔄 {labels.restart}
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
