"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  checkAnswer,
  getHelper,
  type Helper,
  type Locale,
  type Task,
} from "@izn-study/shared";
import { loadProgress, saveProgress, type ProgressMap } from "@/lib/progress";
import { loadHelperId, saveHelperId } from "@/lib/prefs";
import { helperBg } from "@/lib/helperTheme";
import { HelperPicker } from "./HelperPicker";

export interface PlayLabels {
  eyebrow: string;
  check: string;
  next: string;
  correct: string;
  wrong: string;
  cheerCorrect: string;
  cheerWrong: string;
  starsLabel: string;
  numberPlaceholder: string;
  progress: string;
  finishTitle: string;
  finishScore: string;
  restart: string;
  lockedTitle: string;
  lockedText: string;
  backHome: string;
}

export interface GameLabels {
  chooseTitle: string;
  chooseSubtitle: string;
  chooseCta: string;
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
  gameLabels,
  lockedCount,
  homeHref,
}: {
  locale: Locale;
  tasks: Task[];
  labels: PlayLabels;
  gameLabels: GameLabels;
  lockedCount: number;
  homeHref: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [helperId, setHelperId] = useState<string | null>(null);
  const [pendingHelper, setPendingHelper] = useState<string | null>(null);
  const [results, setResults] = useState<ProgressMap>({});
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [numberValue, setNumberValue] = useState("");
  const [status, setStatus] = useState<Status>("answering");
  const [finished, setFinished] = useState(false);

  // При монтировании восстанавливаем помощника и прогресс.
  useEffect(() => {
    setHelperId(loadHelperId());
    const saved = loadProgress();
    setResults(saved);
    const firstUndone = tasks.findIndex((t) => !(t.id in saved));
    if (firstUndone === -1) setFinished(true);
    else setIndex(firstUndone);
    setLoaded(true);
  }, [tasks]);

  const helper = getHelper(helperId);
  const task = tasks[index];
  const answered = status !== "answering";
  const stars = tasks.filter((t) => results[t.id]?.correct).length;

  function reset() {
    setSelected(null);
    setNumberValue("");
    setStatus("answering");
  }

  function confirmHelper() {
    if (!pendingHelper) return;
    saveHelperId(pendingHelper);
    setHelperId(pendingHelper);
  }

  function submit() {
    const response =
      task.type === "single_choice" ? selected : Number(numberValue);
    if (response === null || Number.isNaN(response)) return;

    const correct = checkAnswer(task, response);
    const nextResults = { ...results, [task.id]: { correct } };
    setResults(nextResults);
    saveProgress(nextResults);
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
    const cleared = { ...results };
    for (const t of tasks) delete cleared[t.id];
    setResults(cleared);
    saveProgress(cleared);
    setIndex(0);
    setFinished(false);
    reset();
  }

  const canSubmit =
    task?.type === "single_choice"
      ? selected !== null
      : numberValue.trim() !== "";

  // До восстановления состояния — лёгкий плейсхолдер.
  if (!loaded) {
    return (
      <div className="mx-auto h-64 w-full max-w-lg animate-pulse rounded-3xl border border-black/[.06] bg-white dark:border-white/10 dark:bg-zinc-900" />
    );
  }

  // Экран выбора помощника (если ещё не выбран).
  if (!helper) {
    return (
      <div className="mx-auto w-full max-w-lg text-center">
        <h2 className="text-2xl font-bold">{gameLabels.chooseTitle}</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {gameLabels.chooseSubtitle}
        </p>
        <div className="mt-6">
          <HelperPicker
            locale={locale}
            selectedId={pendingHelper}
            onSelect={(h) => setPendingHelper(h.id)}
          />
        </div>
        <button
          onClick={confirmHelper}
          disabled={!pendingHelper}
          className="mt-6 w-full rounded-full bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {gameLabels.chooseCta}
        </button>
      </div>
    );
  }

  if (finished) {
    return (
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-black/[.06] bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
        <div className="text-5xl">🎉</div>
        <h2 className="mt-4 text-2xl font-bold">{labels.finishTitle}</h2>
        <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
          {tpl(labels.finishScore, { score: stars, total: tasks.length })}
        </p>
        <p className="mt-3 text-2xl">
          {"⭐".repeat(Math.max(stars, 0)) || "—"}
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
          <span>
            {tpl(labels.progress, { current: index + 1, total: tasks.length })}
          </span>
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
        {/* Помощник + звёзды */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={
                "flex h-11 w-11 items-center justify-center rounded-full text-2xl " +
                helperBg[helper.color]
              }
            >
              {helper.emoji}
            </span>
            <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              {helper.name[locale]}
            </span>
          </div>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
            ⭐ {stars}
          </span>
        </div>

        {task.illustration && (
          <div className="mb-4 rounded-2xl bg-zinc-50 py-6 text-center text-4xl dark:bg-white/5">
            {task.illustration}
          </div>
        )}

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

        {/* Реакция помощника + разбор */}
        {answered && (
          <div
            className={
              status === "correct"
                ? "mt-6 flex gap-3 rounded-2xl bg-green-50 p-4 dark:bg-green-500/10"
                : "mt-6 flex gap-3 rounded-2xl bg-red-50 p-4 dark:bg-red-500/10"
            }
          >
            <span className="text-3xl">
              {status === "correct" ? "🎉" : helper.emoji}
            </span>
            <div>
              <p
                className={
                  status === "correct"
                    ? "font-semibold text-green-700 dark:text-green-400"
                    : "font-semibold text-red-600 dark:text-red-400"
                }
              >
                {status === "correct" ? labels.cheerCorrect : labels.cheerWrong}
              </p>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {task.explanation[locale]}
              </p>
            </div>
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
