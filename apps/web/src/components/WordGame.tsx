"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export interface WordLabels {
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
  timeUpMsg: string; // «Собрано слов: {score}»
  restart: string;
  change: string;
  back: string;
  clear: string; // «Стереть»
}

type LevelId = "easy" | "medium" | "hard";
type Locale = "ru" | "ky";
const DURATION = 90;
const BEST_KEY = "izn.study:word-best:v1";

interface WordItem {
  emoji: string;
  syllables: string[];
}

// Слова разбиты на слоги (открытые слоги — деление однозначно).
// ⚠️ KY-список стоит вычитать носителю; loanword'ы (машина, ракета…) безопасны.
const WORDS: Record<Locale, WordItem[]> = {
  ru: [
    { emoji: "🐟", syllables: ["РЫ", "БА"] },
    { emoji: "🌙", syllables: ["ЛУ", "НА"] },
    { emoji: "🦊", syllables: ["ЛИ", "СА"] },
    { emoji: "✋", syllables: ["РУ", "КА"] },
    { emoji: "💧", syllables: ["ВО", "ДА"] },
    { emoji: "❄️", syllables: ["ЗИ", "МА"] },
    { emoji: "☀️", syllables: ["ЛЕ", "ТО"] },
    { emoji: "🐐", syllables: ["КО", "ЗА"] },
    { emoji: "🌹", syllables: ["РО", "ЗА"] },
    { emoji: "🐶", syllables: ["СО", "БА", "КА"] },
    { emoji: "🚗", syllables: ["МА", "ШИ", "НА"] },
    { emoji: "🐄", syllables: ["КО", "РО", "ВА"] },
    { emoji: "🥛", syllables: ["МО", "ЛО", "КО"] },
    { emoji: "🚀", syllables: ["РА", "КЕ", "ТА"] },
    { emoji: "🐦", syllables: ["СО", "РО", "КА"] },
    { emoji: "🌳", syllables: ["БЕ", "РЁ", "ЗА"] },
  ],
  ky: [
    { emoji: "🐰", syllables: ["КО", "ЁН"] },
    { emoji: "👶", syllables: ["БА", "ЛА"] },
    { emoji: "👩", syllables: ["А", "ПА"] },
    { emoji: "👨", syllables: ["А", "ТА"] },
    { emoji: "🍌", syllables: ["БА", "НАН"] },
    { emoji: "🍋", syllables: ["ЛИ", "МОН"] },
    { emoji: "🚗", syllables: ["МА", "ШИ", "НА"] },
    { emoji: "🚀", syllables: ["РА", "КЕ", "ТА"] },
    { emoji: "🎸", syllables: ["ГИ", "ТА", "РА"] },
    { emoji: "📞", syllables: ["ТЕ", "ЛЕ", "ФОН"] },
  ],
};

function syllableCount(w: WordItem) {
  return w.syllables.length;
}

function poolForLevel(locale: Locale, level: LevelId): WordItem[] {
  const all = WORDS[locale];
  if (level === "easy") return all.filter((w) => syllableCount(w) === 2);
  if (level === "medium") return all.filter((w) => syllableCount(w) === 3);
  return all.filter((w) => syllableCount(w) >= 3);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function loadBest(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(BEST_KEY) || "{}");
  } catch {
    return {};
  }
}

export function WordGame({
  labels,
  locale,
  homeHref,
}: {
  labels: WordLabels;
  locale: Locale;
  homeHref: string;
}) {
  const [level, setLevel] = useState<LevelId | null>(null);
  const [word, setWord] = useState<WordItem | null>(null);
  const [tiles, setTiles] = useState<string[]>([]); // перемешанные слоги
  const [picked, setPicked] = useState<number[]>([]); // индексы в tiles, по порядку
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
      const key = `${locale}:${lvl}`;
      if (b[key] === undefined || finalScore > b[key]) {
        b[key] = finalScore;
        try {
          window.localStorage.setItem(BEST_KEY, JSON.stringify(b));
        } catch {
          /* ignore */
        }
      }
      return b;
    });
  }, [locale]);

  const nextWord = useCallback((lvl: LevelId) => {
    const pool = poolForLevel(locale, lvl);
    const w = pool[Math.floor(Math.random() * pool.length)];
    setWord(w);
    setTiles(shuffle(w.syllables));
    setPicked([]);
  }, [locale]);

  function start(l: LevelId) {
    setLevel(l);
    setScore(0);
    setLeft(DURATION);
    setOver(false);
    setFlash(null);
    nextWord(l);
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

  function pickTile(i: number) {
    if (!word || over || picked.includes(i)) return;
    const nextPicked = [...picked, i];
    setPicked(nextPicked);
    if (nextPicked.length === word.syllables.length) {
      const built = nextPicked.map((idx) => tiles[idx]).join("");
      if (built === word.syllables.join("")) {
        setScore((s) => s + 1);
        setFlash("ok");
        setTimeout(() => {
          setFlash(null);
          if (level) nextWord(level);
        }, 500);
      } else {
        setFlash("err");
        setLeft((s) => Math.max(0, s - 3));
        setTimeout(() => {
          setFlash(null);
          setPicked([]);
        }, 550);
      }
    }
  }

  const levelName = (l: LevelId) =>
    l === "easy" ? labels.easy : l === "medium" ? labels.medium : labels.hard;

  const built = useMemo(
    () => picked.map((idx) => tiles[idx]).join(""),
    [picked, tiles],
  );

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
              {best[`${locale}:${l}`] !== undefined && (
                <span className="text-sm font-semibold text-amber-600">
                  🥇 {best[`${locale}:${l}`]}
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

      {word && !over && (
        <>
          <p className="mb-3 text-center text-sm font-semibold text-[#5c5880]">
            {labels.prompt}
          </p>
          <div
            className={
              "mb-5 rounded-3xl border py-7 text-center shadow-sm transition " +
              (flash === "ok"
                ? "border-emerald-400 bg-emerald-50"
                : flash === "err"
                  ? "border-red-400 bg-red-50"
                  : "border-black/[.06] bg-white")
            }
          >
            <div className="text-[64px] leading-none">{word.emoji}</div>
            <div className="mt-3 flex min-h-[38px] items-center justify-center gap-1 font-display text-3xl font-extrabold tracking-wide text-[#191539]">
              {built || <span className="text-[#c9c4e0]">···</span>}
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-2.5">
            {tiles.map((syl, i) => {
              const used = picked.includes(i);
              return (
                <button
                  key={i}
                  onClick={() => pickTile(i)}
                  disabled={used}
                  className={
                    "rounded-2xl border-2 px-5 py-4 font-display text-2xl font-extrabold transition active:scale-95 " +
                    (used
                      ? "border-transparent bg-black/[.05] text-[#c9c4e0]"
                      : "border-black/10 bg-white hover:-translate-y-0.5 hover:border-[#b9b3e6]")
                  }
                >
                  {syl}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-center gap-5">
            {picked.length > 0 && (
              <button
                onClick={() => setPicked([])}
                className="text-sm font-semibold text-[#5c5880] hover:text-[#191539]"
              >
                ⌫ {labels.clear}
              </button>
            )}
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
          <div className="text-5xl">📖</div>
          <h2 className="mt-3 font-display text-2xl font-extrabold">
            {labels.timeUp}
          </h2>
          <p className="mt-2 text-lg text-[#5c5880]">
            {labels.timeUpMsg.replace("{score}", String(score))}
          </p>
          {best[`${locale}:${level}`] !== undefined && (
            <p className="mt-1 text-sm font-bold text-amber-600">
              🥇 {labels.best}: {best[`${locale}:${level}`]}
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
