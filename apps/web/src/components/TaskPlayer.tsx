"use client";

import { useState } from "react";
import Link from "next/link";
import { checkAnswer, type Locale, type Task } from "@izn-study/shared";

export interface PlayLabels {
  eyebrow: string;
  check: string;
  next: string;
  correct: string;
  wrong: string;
  numberPlaceholder: string;
  progress: string;
  finishTitle: string;
  finishScore: string;
  restart: string;
  lockedTitle: string;
  lockedText: string;
  backHome: string;
}

// Простая подстановка {переменных} в строку словаря.
function tpl(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

type Status = "answering" | "correct" | "wrong";

export function TaskPlayer({
  locale,
  tasks,
  labels,
  lockedCount,
  homeHref,
}: {
  locale: Locale;
  tasks: Task[];
  labels: PlayLabels;
  lockedCount: number;
  homeHref: string;
}) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [numberValue, setNumberValue] = useState("");
  const [status, setStatus] = useState<Status>("answering");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const task = tasks[index];
  const answered = status !== "answering";

  function reset() {
    setSelected(null);
    setNumberValue("");
    setStatus("answering");
  }

  function submit() {
    const response =
      task.type === "single_choice" ? selected : Number(numberValue);
    if (response === null || Number.isNaN(response)) return;

    const correct = checkAnswer(task, response);
    if (correct) setScore((s) => s + 1);
    setStatus(correct ? "correct" : "wrong");
  }

  function next() {
    if (index < tasks.length - 1) {
      setIndex((i) => i + 1);
      reset();
    } else {
      setFinished(true);
    }
  }

  function restart() {
    setIndex(0);
    setScore(0);
    setFinished(false);
    reset();
  }

  const canSubmit =
    task?.type === "single_choice" ? selected !== null : numberValue.trim() !== "";

  if (finished) {
    return (
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-black/[.06] bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="text-5xl">🎉</div>
        <h2 className="mt-4 text-2xl font-bold">{labels.finishTitle}</h2>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
          {tpl(labels.finishScore, { score, total: tasks.length })}
        </p>

        {lockedCount > 0 && (
          <div className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-500/30 dark:bg-indigo-500/10">
            <p className="font-semibold text-indigo-700 dark:text-indigo-300">
              {labels.lockedTitle}
            </p>
            <p className="mt-1 text-sm text-indigo-700/80 dark:text-indigo-300/80">
              {tpl(labels.lockedText, { count: lockedCount })}
            </p>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={restart}
            className="rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-500"
          >
            {labels.restart}
          </button>
          <Link
            href={homeHref}
            className="rounded-full border border-black/10 px-6 py-3 font-semibold transition-colors hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/5"
          >
            {labels.backHome}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      {/* Прогресс */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
          <span>{labels.eyebrow}</span>
          <span>{tpl(labels.progress, { current: index + 1, total: tasks.length })}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/10">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-300"
            style={{ width: `${((index + 1) / tasks.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Карточка задания */}
      <div className="rounded-3xl border border-black/[.06] bg-white p-6 shadow-sm sm:p-8 dark:border-white/10 dark:bg-zinc-900">
        <p className="text-xl font-semibold leading-8">{task.prompt[locale]}</p>

        <div className="mt-6 space-y-3">
          {task.type === "single_choice" &&
            task.options.map((opt, i) => {
              const isSelected = selected === i;
              const isCorrect = i === task.correctIndex;
              let cls =
                "w-full rounded-2xl border px-5 py-4 text-left text-lg transition-colors ";
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
                <button
                  key={i}
                  disabled={answered}
                  onClick={() => setSelected(i)}
                  className={cls}
                >
                  {opt[locale]}
                </button>
              );
            })}

          {task.type === "number_input" && (
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
              className="w-full rounded-2xl border border-black/10 bg-transparent px-5 py-4 text-lg outline-none focus:border-indigo-500 dark:border-white/15"
            />
          )}
        </div>

        {/* Обратная связь */}
        {answered && (
          <div
            className={
              status === "correct"
                ? "mt-6 rounded-2xl bg-green-50 p-4 dark:bg-green-500/10"
                : "mt-6 rounded-2xl bg-red-50 p-4 dark:bg-red-500/10"
            }
          >
            <p
              className={
                status === "correct"
                  ? "font-semibold text-green-700 dark:text-green-400"
                  : "font-semibold text-red-600 dark:text-red-400"
              }
            >
              {status === "correct" ? labels.correct : labels.wrong}
            </p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {task.explanation[locale]}
            </p>
          </div>
        )}

        {/* Кнопка действия */}
        <div className="mt-6">
          {!answered ? (
            <button
              onClick={submit}
              disabled={!canSubmit}
              className="w-full rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {labels.check}
            </button>
          ) : (
            <button
              onClick={next}
              className="w-full rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              {labels.next}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
