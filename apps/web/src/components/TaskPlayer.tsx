"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  checkAnswer,
  getHelper,
  getTopics,
  subjectLabels,
  SUBJECTS,
  type Locale,
  type Task,
} from "@izn-study/shared";
import { loadProgress, saveProgress, type ProgressMap } from "@/lib/progress";
import { loadHelperId, saveHelperId } from "@/lib/prefs";
import { recordActivity } from "@/lib/stats";
import { HelperPicker } from "./HelperPicker";
import { Mascot } from "./Mascot";
import { Confetti } from "./Confetti";

export interface PlayLabels {
  eyebrow: string;
  check: string;
  next: string;
  correct: string;
  wrong: string;
  cheerCorrect: string;
  cheerWrong: string;
  starsLabel: string;
  orderingHint: string;
  matchHint: string;
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
  subjectTitle: string;
  subjectAll: string;
  topicsTitle: string;
  unlockFor: string;
  notEnoughStars: string;
}

const PRIMARY_BTN =
  "w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 text-lg font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none";

function tpl(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ""));
}

function range(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

function shuffle(arr: number[]): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Status = "answering" | "correct" | "wrong";

export function TaskPlayer({
  locale,
  allTasks,
  labels,
  gameLabels,
  homeHref,
}: {
  locale: Locale;
  allTasks: Task[];
  labels: PlayLabels;
  gameLabels: GameLabels;
  homeHref: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [helperId, setHelperId] = useState<string | null>(null);
  const [pendingHelper, setPendingHelper] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [results, setResults] = useState<ProgressMap>({});
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [status, setStatus] = useState<Status>("answering");

  const [selected, setSelected] = useState<number | null>(null);
  const [numberValue, setNumberValue] = useState("");
  const [orderShuffled, setOrderShuffled] = useState<number[]>([]);
  const [orderPicked, setOrderPicked] = useState<number[]>([]);
  const [rightShuffled, setRightShuffled] = useState<number[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [pairs, setPairs] = useState<Record<number, number>>({});

  useEffect(() => {
    setHelperId(loadHelperId());
    setResults(loadProgress());
    setLoaded(true);
  }, []);

  const helper = getHelper(helperId);

  const activeTasks = useMemo(
    () => (topicId ? allTasks.filter((t) => t.topic === topicId && t.free) : []),
    [topicId, allTasks],
  );

  const lockedCount = useMemo(
    () =>
      topicId
        ? allTasks.filter((t) => t.topic === topicId && !t.free).length
        : 0,
    [topicId, allTasks],
  );

  const task = activeTasks[index];
  const answered = status !== "answering";
  const stars = activeTasks.filter((t) => results[t.id]?.correct).length;
  const earnedStars = Object.values(results).filter((r) => r.correct).length;

  useEffect(() => {
    if (!task) return;
    setStatus("answering");
    setSelected(null);
    setNumberValue("");
    setOrderPicked([]);
    setPairs({});
    setSelectedLeft(null);
    if (task.type === "ordering") {
      setOrderShuffled(shuffle(range(task.items.length)));
    }
    if (task.type === "match_pairs") {
      setRightShuffled(shuffle(range(task.right.length)));
    }
  }, [task]);

  function chooseHelper() {
    if (!pendingHelper) return;
    saveHelperId(pendingHelper);
    setHelperId(pendingHelper);
  }

  function chooseTopic(id: string) {
    const list = allTasks.filter((t) => t.topic === id && t.free);
    const firstUndone = list.findIndex((t) => !(t.id in results));
    setTopicId(id);
    if (firstUndone === -1) setFinished(true);
    else {
      setIndex(firstUndone);
      setFinished(false);
    }
  }

  function currentResponse(): number | number[] | null {
    switch (task.type) {
      case "single_choice":
        return selected;
      case "number_input":
        return numberValue.trim() === "" ? null : Number(numberValue);
      case "ordering":
        return orderPicked;
      case "match_pairs":
        return task.left.map((_, i) => pairs[i]);
    }
  }

  const canSubmit = (() => {
    if (!task) return false;
    switch (task.type) {
      case "single_choice":
        return selected !== null;
      case "number_input":
        return numberValue.trim() !== "";
      case "ordering":
        return orderPicked.length === task.items.length;
      case "match_pairs":
        return Object.keys(pairs).length === task.left.length;
    }
  })();

  function submit() {
    const response = currentResponse();
    if (
      response === null ||
      (typeof response === "number" && Number.isNaN(response))
    )
      return;
    const correct = checkAnswer(task, response);
    const nextResults = { ...results, [task.id]: { correct } };
    setResults(nextResults);
    saveProgress(nextResults);
    recordActivity();
    setStatus(correct ? "correct" : "wrong");
  }

  function next() {
    if (index < activeTasks.length - 1) setIndex((i) => i + 1);
    else setFinished(true);
  }

  function restart() {
    const cleared = { ...results };
    for (const t of activeTasks) delete cleared[t.id];
    setResults(cleared);
    saveProgress(cleared);
    setFinished(false);
    setIndex(0);
  }

  if (!loaded) {
    return (
      <div className="mx-auto h-72 w-full max-w-lg animate-pulse rounded-[2rem] border border-black/[.06] bg-white dark:border-white/10 dark:bg-zinc-900" />
    );
  }

  // 1. Выбор помощника
  if (!helper) {
    return (
      <div className="mx-auto w-full max-w-lg text-center">
        <h2 className="font-display text-3xl font-extrabold">
          {gameLabels.chooseTitle}
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {gameLabels.chooseSubtitle}
        </p>
        <div className="mt-6">
          <HelperPicker
            locale={locale}
            selectedId={pendingHelper}
            onSelect={(h) => setPendingHelper(h.id)}
            earnedStars={earnedStars}
            unlockForLabel={gameLabels.unlockFor}
            notEnoughLabel={gameLabels.notEnoughStars}
          />
        </div>
        <button onClick={chooseHelper} disabled={!pendingHelper} className={"mt-6 " + PRIMARY_BTN}>
          {gameLabels.chooseCta}
        </button>
      </div>
    );
  }

  // 2. Карта тем
  if (!topicId) {
    return (
      <div className="mx-auto w-full max-w-lg">
        <div className="mb-5 flex justify-center">
          <Mascot helper={helper} mood="idle" />
        </div>
        <h2 className="text-center font-display text-3xl font-extrabold">
          {gameLabels.topicsTitle}
        </h2>

        {SUBJECTS.map((subj) => {
          const subjTopics = getTopics(subj);
          if (subjTopics.length === 0) return null;
          return (
            <div key={subj} className="mt-6">
              <h3 className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-zinc-400">
                {subjectLabels[subj][locale]}
              </h3>
              <div className="space-y-2.5">
                {subjTopics.map((topic) => {
                  const free = allTasks.filter(
                    (t) => t.topic === topic.id && t.free,
                  );
                  const done = free.filter((t) => t.id in results).length;
                  const complete = free.length > 0 && done === free.length;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => chooseTopic(topic.id)}
                      className="flex w-full items-center gap-3 rounded-2xl border-2 border-black/[.06] bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-white/10 dark:bg-zinc-900"
                    >
                      <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 text-2xl dark:from-indigo-500/15 dark:to-violet-500/15">
                        {topic.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="font-display font-bold">
                          {topic.title[locale]}
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-400">
                          <span className="text-amber-500">
                            {"●".repeat(topic.difficulty)}
                            {"○".repeat(3 - topic.difficulty)}
                          </span>
                          <span>
                            {done}/{free.length}
                          </span>
                        </div>
                      </div>
                      {complete && <span className="text-lg">✅</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // 3. Финальный экран
  if (finished) {
    return (
      <div className="relative mx-auto w-full max-w-lg text-center">
        <Confetti />
        <div className="mb-5 flex justify-center">
          <Mascot helper={helper} mood="happy" size="lg" />
        </div>
        <div className="rounded-[2rem] border border-black/[.06] bg-white p-8 shadow-xl dark:border-white/10 dark:bg-zinc-900">
          <h2 className="font-display text-3xl font-extrabold">
            {labels.finishTitle}
          </h2>
          <p className="mt-2 text-lg text-zinc-600 dark:text-zinc-400">
            {tpl(labels.finishScore, {
              score: stars,
              total: activeTasks.length,
            })}
          </p>
          <p className="mt-3 text-3xl">{"⭐".repeat(Math.max(stars, 0)) || "—"}</p>

          {lockedCount > 0 && (
            <div className="mt-6 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-500/30 dark:bg-indigo-500/10">
              <p className="font-display font-bold text-indigo-700 dark:text-indigo-300">
                {labels.lockedTitle}
              </p>
              <p className="mt-1 text-sm text-indigo-700/80 dark:text-indigo-300/80">
                {tpl(labels.lockedText, { count: lockedCount })}
              </p>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button onClick={restart} className={PRIMARY_BTN + " sm:w-auto sm:px-8"}>
              {labels.restart}
            </button>
            <Link
              href={homeHref}
              className="rounded-full border-2 border-black/10 px-8 py-3.5 text-lg font-bold transition hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/5"
            >
              {labels.backHome}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const mood: "idle" | "happy" | "sad" =
    status === "correct" ? "happy" : status === "wrong" ? "sad" : "idle";
  const mascotMessage = answered
    ? status === "correct"
      ? labels.cheerCorrect
      : labels.cheerWrong
    : undefined;

  return (
    <div className="relative mx-auto w-full max-w-lg">
      {status === "correct" && <Confetti />}

      {/* Прогресс */}
      <div className="mb-5">
        <div className="mb-2 flex items-center justify-between text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          <span>{labels.eyebrow}</span>
          <span>
            {tpl(labels.progress, {
              current: index + 1,
              total: activeTasks.length,
            })}
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
            style={{ width: `${((index + 1) / activeTasks.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Большой помощник */}
      <div className="mb-4 flex justify-center">
        <Mascot helper={helper} mood={mood} message={mascotMessage} />
      </div>

      {/* Карточка задания */}
      <div className="rounded-[2rem] border border-black/[.06] bg-white p-6 shadow-xl sm:p-8 dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-end">
          <span className="rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 px-4 py-1.5 text-sm font-extrabold text-amber-900 shadow-sm">
            ⭐ {stars}
          </span>
        </div>

        {task.illustration && (
          <div className="mb-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 py-7 text-center text-5xl dark:from-indigo-500/10 dark:to-violet-500/10">
            {task.illustration}
          </div>
        )}

        <p className="font-display text-2xl font-bold leading-8">
          {task.prompt[locale]}
        </p>

        {/* Ответы по типу задания */}
        <div className="mt-6">
          {task.type === "single_choice" && (
            <div className="space-y-3">
              {task.options.map((opt, i) => {
                const isSelected = selected === i;
                const isCorrect = i === task.correctIndex;
                let cls =
                  "w-full rounded-2xl border-2 px-5 py-4 text-left text-lg font-semibold transition ";
                if (!answered) {
                  cls += isSelected
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                    : "border-black/10 hover:-translate-y-0.5 hover:border-indigo-300 dark:border-white/15";
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
            </div>
          )}

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
              className="w-full rounded-2xl border-2 border-black/10 bg-transparent px-5 py-4 text-center text-2xl font-bold outline-none focus:border-indigo-500 dark:border-white/15"
            />
          )}

          {task.type === "ordering" && (
            <div>
              <p className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {labels.orderingHint}
              </p>
              <div className="mb-3 flex min-h-16 flex-wrap gap-2 rounded-2xl border-2 border-dashed border-black/15 p-3 dark:border-white/15">
                {orderPicked.map((origIdx, pos) => {
                  const stateCls = !answered
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                    : status === "correct"
                      ? "border-green-500 bg-green-50 dark:bg-green-500/10"
                      : "border-red-400 bg-red-50 dark:bg-red-500/10";
                  return (
                    <button
                      key={origIdx}
                      disabled={answered}
                      onClick={() =>
                        setOrderPicked(orderPicked.filter((_, p) => p !== pos))
                      }
                      className={`rounded-xl border-2 px-4 py-2 text-xl font-bold ${stateCls}`}
                    >
                      {task.items[origIdx][locale]}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                {orderShuffled
                  .filter((i) => !orderPicked.includes(i))
                  .map((i) => (
                    <button
                      key={i}
                      disabled={answered}
                      onClick={() => setOrderPicked([...orderPicked, i])}
                      className="rounded-xl border-2 border-black/10 px-4 py-2 text-xl font-bold transition hover:-translate-y-0.5 hover:border-indigo-300 dark:border-white/15"
                    >
                      {task.items[i][locale]}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {task.type === "match_pairs" && (
            <div>
              <p className="mb-3 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {labels.matchHint}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-3">
                  {task.left.map((l, i) => {
                    const matchedRight = pairs[i];
                    const isMatched = matchedRight !== undefined;
                    let cls =
                      "w-full rounded-2xl border-2 px-4 py-3 text-left text-lg font-semibold transition ";
                    if (answered && isMatched) {
                      cls +=
                        matchedRight === i
                          ? "border-green-500 bg-green-50 dark:bg-green-500/10"
                          : "border-red-400 bg-red-50 dark:bg-red-500/10";
                    } else if (selectedLeft === i) {
                      cls +=
                        "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10";
                    } else if (isMatched) {
                      cls += "border-indigo-300 dark:border-indigo-500/40";
                    } else {
                      cls +=
                        "border-black/10 hover:border-indigo-300 dark:border-white/15";
                    }
                    return (
                      <button
                        key={i}
                        disabled={answered}
                        onClick={() => {
                          if (isMatched) {
                            const p = { ...pairs };
                            delete p[i];
                            setPairs(p);
                            setSelectedLeft(null);
                          } else {
                            setSelectedLeft(i);
                          }
                        }}
                        className={cls}
                      >
                        {l[locale]}
                        {isMatched && (
                          <span className="text-zinc-500 dark:text-zinc-400">
                            {" → "}
                            {task.right[matchedRight][locale]}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  {rightShuffled.map((j) => {
                    const used = Object.values(pairs).includes(j);
                    return (
                      <button
                        key={j}
                        disabled={answered || used}
                        onClick={() => {
                          if (selectedLeft !== null && !used) {
                            setPairs({ ...pairs, [selectedLeft]: j });
                            setSelectedLeft(null);
                          }
                        }}
                        className={
                          "w-full rounded-2xl border-2 px-4 py-3 text-left text-lg font-semibold transition " +
                          (used
                            ? "border-black/10 opacity-40 dark:border-white/15"
                            : "border-black/10 hover:border-indigo-300 dark:border-white/15")
                        }
                      >
                        {task.right[j][locale]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Разбор */}
        {answered && (
          <div
            className={
              "mt-6 rounded-2xl p-4 text-sm " +
              (status === "correct"
                ? "bg-green-50 text-green-800 dark:bg-green-500/10 dark:text-green-300"
                : "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200")
            }
          >
            {task.explanation[locale]}
          </div>
        )}

        {/* Кнопка действия */}
        <div className="mt-6">
          {!answered ? (
            <button onClick={submit} disabled={!canSubmit} className={PRIMARY_BTN}>
              {labels.check}
            </button>
          ) : (
            <button onClick={next} className={PRIMARY_BTN}>
              {labels.next}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
