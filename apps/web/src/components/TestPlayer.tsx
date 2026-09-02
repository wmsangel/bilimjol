"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  checkAnswer,
  getHelper,
  getTest,
  type Locale,
  type Task,
} from "@izn-study/shared";
import { loadHelperId } from "@/lib/prefs";
import { recordActivity } from "@/lib/stats";
import { Mascot } from "./Mascot";
import { Confetti } from "./Confetti";

export interface TestLabels {
  check: string;
  next: string;
  cheerCorrect: string;
  cheerWrong: string;
  numberPlaceholder: string;
  progress: string;
  finishTitle: string;
  finishScore: string;
  restart: string;
  back: string;
}

function tpl(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

type Status = "answering" | "correct" | "wrong";

const PRIMARY =
  "w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 text-lg font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40";

export function TestPlayer({
  locale,
  testId,
  labels,
  backHref,
}: {
  locale: Locale;
  testId: string;
  labels: TestLabels;
  backHref: string;
}) {
  const test = getTest(testId);
  const [questions, setQuestions] = useState<Task[]>([]);
  const [helperId, setHelperId] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [numberValue, setNumberValue] = useState("");
  const [status, setStatus] = useState<Status>("answering");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const questionStart = useRef<number>(Date.now());
  useEffect(() => {
    questionStart.current = Date.now();
  }, [index]);

  useEffect(() => {
    setQuestions(test?.generate() ?? []);
    setHelperId(loadHelperId());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const helper = getHelper(helperId ?? "fox") ?? getHelper("fox")!;
  const question = questions[index];
  const answered = status !== "answering";

  function reset() {
    setSelected(null);
    setNumberValue("");
    setStatus("answering");
  }

  const canSubmit =
    question?.type === "single_choice"
      ? selected !== null
      : numberValue.trim() !== "";

  function submit() {
    const response =
      question.type === "single_choice" ? selected : Number(numberValue);
    if (response === null || Number.isNaN(response)) return;
    const correct = checkAnswer(question, response);
    if (correct) setScore((s) => s + 1);
    recordActivity({ correct, durationSec: (Date.now() - questionStart.current) / 1000 });
    setStatus(correct ? "correct" : "wrong");
  }

  function next() {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      reset();
    } else {
      setFinished(true);
    }
  }

  function restart() {
    setQuestions(test?.generate() ?? []);
    setIndex(0);
    setScore(0);
    setFinished(false);
    reset();
  }

  if (questions.length === 0) {
    return (
      <div className="mx-auto h-64 w-full max-w-lg animate-pulse rounded-[2rem] border border-black/[.06] bg-white dark:border-white/10 dark:bg-zinc-900" />
    );
  }

  if (finished) {
    const total = questions.length;
    const mood = score >= total / 2 ? "happy" : "sad";
    return (
      <div className="relative mx-auto w-full max-w-lg text-center">
        {score >= total / 2 && <Confetti />}
        <div className="mb-5 flex justify-center">
          <Mascot helper={helper} mood={mood} size="lg" />
        </div>
        <div className="rounded-[2rem] border border-black/[.06] bg-white p-8 shadow-xl dark:border-white/10 dark:bg-zinc-900">
          <h2 className="font-display text-3xl font-extrabold">
            {labels.finishTitle}
          </h2>
          <p className="mt-3 text-4xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {score} / {total}
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={restart} className={PRIMARY + " sm:w-auto sm:px-8"}>
              {labels.restart}
            </button>
            <Link
              href={backHref}
              className="rounded-full border-2 border-black/10 px-8 py-3.5 text-lg font-bold transition hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/5"
            >
              {labels.back}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-lg">
      {status === "correct" && <Confetti />}

      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          <span>⭐ {score}</span>
          <span>
            {tpl(labels.progress, { current: index + 1, total: questions.length })}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
            style={{ width: `${((index + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mb-4 flex justify-center">
        <Mascot
          helper={helper}
          mood={status === "correct" ? "happy" : status === "wrong" ? "sad" : "idle"}
          message={
            answered
              ? status === "correct"
                ? labels.cheerCorrect
                : labels.cheerWrong
              : undefined
          }
        />
      </div>

      <div className="rounded-[2rem] border border-black/[.06] bg-white p-6 shadow-xl sm:p-8 dark:border-white/10 dark:bg-zinc-900">
        <p className="text-center font-display text-3xl font-bold">
          {question.prompt[locale]}
        </p>

        <div className="mt-6">
          {question.type === "single_choice" && (
            <div className="space-y-3">
              {question.options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = i === question.correctIndex;
                let cls =
                  "w-full rounded-2xl border-2 px-5 py-4 text-center text-xl font-bold transition ";
                if (!answered) {
                  cls += isSelected
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                    : "border-black/10 hover:border-indigo-300 dark:border-white/15";
                } else if (isCorrect) {
                  cls += "border-green-500 bg-green-50 dark:bg-green-500/10";
                } else if (isSelected) {
                  cls += "border-red-400 bg-red-50 dark:bg-red-500/10";
                } else {
                  cls += "border-black/10 opacity-60 dark:border-white/15";
                }
                return (
                  <button key={i} disabled={answered} onClick={() => setSelected(i)} className={cls}>
                    {opt[locale]}
                  </button>
                );
              })}
            </div>
          )}

          {question.type === "number_input" && (
            <input
              type="number"
              inputMode="numeric"
              value={numberValue}
              disabled={answered}
              onChange={(e) => setNumberValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && canSubmit && !answered) submit();
              }}
              placeholder={labels.numberPlaceholder}
              className="w-full rounded-2xl border-2 border-black/10 bg-transparent px-5 py-4 text-center text-3xl font-bold outline-none focus:border-indigo-500 dark:border-white/15"
            />
          )}
        </div>

        <div className="mt-6">
          {!answered ? (
            <button onClick={submit} disabled={!canSubmit} className={PRIMARY}>
              {labels.check}
            </button>
          ) : (
            <button onClick={next} className={PRIMARY}>
              {labels.next}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
