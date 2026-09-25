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
      <div className="mx-auto w-full max-w-xl text-center font-sans text-[#191539]">
        <p className="mb-6 text-lg leading-relaxed text-[#5c5880]">
          {labels.intro}
        </p>
        <button
          onClick={() => setStarted(true)}
          className="rounded-full bg-[#6d5cf7] px-10 py-4 text-lg font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5 active:scale-95"
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
      <div className="mx-auto w-full max-w-xl font-sans text-[#191539]">
        <div className="rounded-[32px] bg-white p-8 text-center shadow-[0_20px_50px_rgba(25,21,57,.08)]">
          <div className="text-6xl">{BAND_EMOJI[key]}</div>
          <p className="mt-3 text-xs font-extrabold uppercase tracking-[1.4px] text-[#5c5880]">
            {labels.resultTitle}
          </p>
          <h2 className="mt-1 font-display text-[28px] font-bold">
            {band.label}
          </h2>
          <div className="mt-3 inline-block rounded-full bg-[#efecff] px-4 py-1.5 text-sm font-extrabold text-[#4b3cc9]">
            {labels.yourScore
              .replace("{score}", String(score))
              .replace("{max}", String(max))}
          </div>
          <p className="mt-4 text-left text-[17px] leading-relaxed text-[#2d2950]">
            {band.text}
          </p>

          <div className="mt-6 rounded-2xl bg-[#f7f5ff] p-5 text-left">
            <p className="mb-3 font-display text-[15px] font-bold text-[#191539]">
              {labels.tipsTitle}
            </p>
            <ul className="space-y-2">
              {band.tips.map((tip, i) => (
                <li key={i} className="flex gap-2 text-[15px] leading-snug text-[#2d2950]">
                  <span className="font-bold text-[#6d5cf7]">•</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-4 rounded-[24px] bg-[#6d5cf7] px-6 py-7 text-center text-white shadow-[0_16px_40px_rgba(109,92,247,.3)]">
          <p className="font-display text-lg font-bold">{labels.ctaText}</p>
          <Link
            href={playHref}
            className="mt-4 inline-block rounded-full bg-white px-7 py-3 font-extrabold text-[#6d5cf7] shadow-md transition hover:-translate-y-0.5"
          >
            {labels.ctaButton}
          </Link>
        </div>

        <button
          onClick={restart}
          className="mt-4 block w-full text-center text-sm font-extrabold text-[#5c5880] transition hover:text-[#191539]"
        >
          🔄 {labels.restart}
        </button>
      </div>
    );
  }

  // Вопрос
  const pct = ((index + 1) / total) * 100;
  return (
    <div className="mx-auto w-full max-w-xl font-sans text-[#191539]">
      <div className="mb-2 flex items-center justify-between text-sm font-extrabold text-[#5c5880]">
        <span>
          {labels.question
            .replace("{n}", String(index + 1))
            .replace("{total}", String(total))}
        </span>
      </div>
      <div className="mb-7 h-3 overflow-hidden rounded-full bg-[#e6e1ff]">
        <div
          className="h-full rounded-full bg-[#6d5cf7] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="rounded-[32px] bg-white p-7 shadow-[0_20px_50px_rgba(25,21,57,.08)] sm:p-9">
        <p className="font-display text-[22px] font-bold leading-snug sm:text-[26px]">
          {labels.qs[index]}
        </p>
        <div className="mt-7 flex flex-col gap-3">
          {(
            [
              [2, labels.optYes, "yes"],
              [1, labels.optSometimes, "sometimes"],
              [0, labels.optNo, "no"],
            ] as const
          ).map(([value, text, tone]) => (
            <button
              key={value}
              onClick={() => answer(value)}
              className={
                "rounded-2xl border-2 px-6 py-4 text-left text-lg font-extrabold transition hover:-translate-y-0.5 active:scale-[.99] " +
                (tone === "yes"
                  ? "border-[#a7f3d0] hover:border-[#34d399]"
                  : tone === "sometimes"
                    ? "border-[#e6c079] bg-[#fbf3e3] hover:border-[#c9a04f]"
                    : "border-black/10 hover:border-[#b9b3e6]")
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
          className="mt-4 text-sm font-extrabold text-[#5c5880] transition hover:text-[#191539]"
        >
          ← {labels.back}
        </button>
      )}
    </div>
  );
}
