"use client";

import { useState } from "react";
import Link from "next/link";

interface Band {
  label: string;
  text: string;
  tips: string[];
}

export interface ReadinessLabels {
  start: string;
  intro: string;
  optYes: string;
  optSometimes: string;
  optNo: string;
  question: string; // «Вопрос {n} из {total}»
  qs: string[];
  resultTitle: string;
  yourScore: string; // «{score} из {max}»
  bands: { high: Band; mid: Band; low: Band };
  ctaText: string;
  ctaButton: string;
  restart: string;
  tipsTitle: string;
  back: string;
}

const BAND_EMOJI = { high: "🎉", mid: "🌱", low: "💪" } as const;

export function ReadinessTest({
  labels,
  playHref,
}: {
  labels: ReadinessLabels;
  playHref: string;
}) {
  const total = labels.qs.length;
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  function answer(value: 0 | 1 | 2) {
    const next = [...answers, value];
    setAnswers(next);
    if (index + 1 >= total) {
      setDone(true);
    } else {
      setIndex(index + 1);
    }
  }

  function back() {
    if (index === 0) return;
    setAnswers(answers.slice(0, -1));
    setIndex(index - 1);
  }

  function restart() {
    setStarted(true);
    setIndex(0);
    setAnswers([]);
    setDone(false);
  }

  // Интро
  if (!started) {
    return (
      <div className="mx-auto w-full max-w-xl text-center">
        <p className="mb-6 text-lg text-zinc-600 dark:text-zinc-300">
          {labels.intro}
        </p>
        <button
          onClick={() => setStarted(true)}
          className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 active:scale-95"
        >
          {labels.start}
        </button>
      </div>
    );
  }

  // Результат
  if (done) {
    const score = answers.reduce((a, b) => a + b, 0);
    const max = total * 2;
    const key: keyof typeof BAND_EMOJI =
      score >= max * 0.83 ? "high" : score >= max * 0.55 ? "mid" : "low";
    const band = labels.bands[key];
    return (
      <div className="mx-auto w-full max-w-xl">
        <div className="rounded-[2rem] border border-black/[.06] bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-zinc-900">
          <div className="text-6xl">{BAND_EMOJI[key]}</div>
          <p className="mt-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            {labels.resultTitle}
          </p>
          <h2 className="mt-1 font-display text-3xl font-extrabold">
            {band.label}
          </h2>
          <div className="mt-3 inline-block rounded-full bg-indigo-50 px-4 py-1.5 text-sm font-bold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
            {labels.yourScore
              .replace("{score}", String(score))
              .replace("{max}", String(max))}
          </div>
          <p className="mt-4 text-left text-lg leading-8 text-zinc-700 dark:text-zinc-300">
            {band.text}
          </p>

          <div className="mt-6 rounded-2xl bg-black/[.03] p-5 text-left dark:bg-white/[.04]">
            <p className="mb-2 font-display text-sm font-bold text-zinc-500 dark:text-zinc-400">
              {labels.tipsTitle}
            </p>
            <ul className="space-y-2">
              {band.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-zinc-700 dark:text-zinc-300">
                  <span className="text-indigo-500">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-violet-600 px-6 py-8 text-center text-white shadow-xl">
          <p className="font-display text-xl font-bold">{labels.ctaText}</p>
          <Link
            href={playHref}
            className="mt-4 inline-block rounded-full bg-white px-6 py-3 font-bold text-indigo-600 shadow-lg transition hover:brightness-95"
          >
            {labels.ctaButton}
          </Link>
        </div>

        <button
          onClick={restart}
          className="mt-4 block w-full text-center text-sm font-semibold text-zinc-500 hover:text-foreground dark:text-zinc-400"
        >
          🔄 {labels.restart}
        </button>
      </div>
    );
  }

  // Вопрос
  const pct = (index / total) * 100;
  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-2 flex items-center justify-between text-sm font-bold text-zinc-500 dark:text-zinc-400">
        <span>
          {labels.question
            .replace("{n}", String(index + 1))
            .replace("{total}", String(total))}
        </span>
      </div>
      <div className="mb-6 h-2.5 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="rounded-[2rem] border border-black/[.06] bg-white p-8 shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <p className="font-display text-2xl font-bold leading-8">
          {labels.qs[index]}
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {(
            [
              [2, labels.optYes, "emerald"],
              [1, labels.optSometimes, "amber"],
              [0, labels.optNo, "zinc"],
            ] as const
          ).map(([value, text, tone]) => (
            <button
              key={value}
              onClick={() => answer(value)}
              className={
                "rounded-2xl border-2 px-6 py-4 text-left text-lg font-bold transition hover:-translate-y-0.5 active:scale-[.99] " +
                (tone === "emerald"
                  ? "border-emerald-200 hover:border-emerald-400 dark:border-emerald-500/30"
                  : tone === "amber"
                    ? "border-amber-200 hover:border-amber-400 dark:border-amber-500/30"
                    : "border-black/10 hover:border-zinc-400 dark:border-white/15")
              }
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {index > 0 && (
        <button
          onClick={back}
          className="mt-4 text-sm font-semibold text-zinc-500 hover:text-foreground dark:text-zinc-400"
        >
          ← {labels.back}
        </button>
      )}
    </div>
  );
}
