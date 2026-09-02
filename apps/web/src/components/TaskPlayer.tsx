"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  checkAnswer,
  getHelper,
  getTopics,
  GRADES,
  type Locale,
  type Task,
} from "@izn-study/shared";
import { loadProgress, saveProgress, type ProgressMap } from "@/lib/progress";
import {
  loadHelperId,
  saveHelperId,
  loadLastGrade,
  saveLastGrade,
} from "@/lib/prefs";
import { recordActivity } from "@/lib/stats";
import { getEntitlement, isLoggedIn, loadChildId } from "@/lib/api";
import { syncChild } from "@/lib/sync";
import { pushEvent, currencyIso } from "@/lib/gtm";
import { countryForLocale, priceForCountry } from "@/lib/pricing";

// Контакт администратора (пока оплата картой не подключена). Переопределяется env.
const ADMIN_TG =
  process.env.NEXT_PUBLIC_ADMIN_TELEGRAM ?? "https://t.me/izagorodnyi";
import { WARDROBE, type WardrobeItem } from "@/lib/characterArt";
import { playSound } from "@/lib/sound";
import { HelperPicker } from "./HelperPicker";
import { Mascot } from "./Mascot";
import { Confetti } from "./Confetti";
import { LearningPath } from "./LearningPath";
import { RewardModal } from "./RewardModal";

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
  subscribeCta: string;
  backHome: string;
  starBadge: string;
}

export interface GameLabels {
  chooseTitle: string;
  chooseSubtitle: string;
  chooseCta: string;
  subjectTitle: string;
  subjectAll: string;
  gradeTitle: string;
  topicsTitle: string;
  starHint: string;
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
  gradeLabels,
  homeHref,
}: {
  locale: Locale;
  allTasks: Task[];
  labels: PlayLabels;
  gameLabels: GameLabels;
  gradeLabels: Record<string, string>;
  homeHref: string;
}) {
  const [premium, setPremium] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [helperId, setHelperId] = useState<string | null>(null);
  const [pendingHelper, setPendingHelper] = useState<string | null>(null);
  const [grade, setGrade] = useState<number | null>(null);
  const [lastGrade, setLastGrade] = useState<number | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [results, setResults] = useState<ProgressMap>({});
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const [status, setStatus] = useState<Status>("answering");
  // Момент показа текущего вопроса — для учёта времени на ответ.
  const questionStart = useRef<number>(Date.now());
  useEffect(() => {
    questionStart.current = Date.now();
  }, [index, topicId]);

  // По завершении занятия отправляем прогресс и статистику на сервер
  // (иначе счётчики видны только локально до открытия кабинета).
  useEffect(() => {
    if (!finished) return;
    const childId = loadChildId();
    if (isLoggedIn() && childId) syncChild(childId).catch(() => undefined);
  }, [finished]);
  const [reward, setReward] = useState<WardrobeItem | null>(null);

  const [selected, setSelected] = useState<number | null>(null);
  const [multiSelected, setMultiSelected] = useState<number[]>([]);
  const [numberValue, setNumberValue] = useState("");
  const [orderShuffled, setOrderShuffled] = useState<number[]>([]);
  const [orderPicked, setOrderPicked] = useState<number[]>([]);
  const [rightShuffled, setRightShuffled] = useState<number[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<number | null>(null);
  const [pairs, setPairs] = useState<Record<number, number>>({});

  useEffect(() => {
    setHelperId(loadHelperId());
    setResults(loadProgress());
    setLastGrade(loadLastGrade());
    setLoaded(true);
    if (isLoggedIn()) {
      getEntitlement()
        .then((e) => setPremium(e.premium))
        .catch(() => undefined);
    }
  }, []);

  const helper = getHelper(helperId);

  const activeTasks = useMemo(
    () =>
      topicId
        ? allTasks.filter((t) => t.topic === topicId && (premium || t.free))
        : [],
    [topicId, allTasks, premium],
  );

  const lockedCount = useMemo(
    () =>
      topicId && !premium
        ? allTasks.filter((t) => t.topic === topicId && !t.free).length
        : 0,
    [topicId, allTasks, premium],
  );

  const task = activeTasks[index];
  const answered = status !== "answering";
  const stars = activeTasks.filter((t) => results[t.id]?.correct).length;
  const earnedStars = Object.values(results).filter((r) => r.correct).length;

  useEffect(() => {
    if (!task) return;
    setStatus("answering");
    setSelected(null);
    setMultiSelected([]);
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

  function chooseGrade(g: number) {
    saveLastGrade(g);
    setLastGrade(g);
    setGrade(g);
    setTopicId(null);
  }

  function chooseTopic(id: string) {
    const list = allTasks.filter((t) => t.topic === id && (premium || t.free));
    const firstUndone = list.findIndex((t) => !(t.id in results));
    setTopicId(id);
    if (firstUndone === -1) setFinished(true);
    else {
      setIndex(firstUndone);
      setFinished(false);
    }
  }

  function closeLesson() {
    setTopicId(null);
    setFinished(false);
    setStatus("answering");
  }

  function currentResponse(): number | number[] | null {
    switch (task.type) {
      case "single_choice":
        return selected;
      case "multi_select":
        return multiSelected;
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
      case "multi_select":
        return multiSelected.length > 0;
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
    const alreadyCorrect = results[task.id]?.correct === true;
    const nextResults = { ...results, [task.id]: { correct } };
    setResults(nextResults);
    saveProgress(nextResults);
    const durationSec = (Date.now() - questionStart.current) / 1000;
    recordActivity({ correct, durationSec });
    setStatus(correct ? "correct" : "wrong");

    if (correct) {
      playSound("correct");
      // Новая звезда → проверяем, не открылась ли вещь гардероба.
      if (!alreadyCorrect) {
        const newEarned = earnedStars + 1;
        const unlocked = WARDROBE.find(
          (w) => w.unlockAt > 0 && w.unlockAt === newEarned,
        );
        if (unlocked) {
          setReward(unlocked);
          playSound("unlock");
        }
      }
    } else {
      playSound("wrong");
    }
  }

  function next() {
    playSound("click");
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

  // 2. Выбор класса
  if (grade === null) {
    return (
      <div className="mx-auto w-full max-w-lg text-center">
        <div className="mb-5 flex justify-center">
          <Mascot helper={helper} mood="idle" />
        </div>
        <h2 className="font-display text-3xl font-extrabold">
          {gameLabels.gradeTitle}
        </h2>
        {lastGrade !== null && GRADES.includes(lastGrade) && (
          <button
            onClick={() => chooseGrade(lastGrade)}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 active:scale-[.98]"
          >
            ▶ {locale === "ky" ? "Улантуу" : "Продолжить"} —{" "}
            {gradeLabels[String(lastGrade)] ?? lastGrade}
          </button>
        )}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => chooseGrade(g)}
              className="flex flex-col items-center gap-2 rounded-3xl border-2 border-black/[.06] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-md dark:border-white/10 dark:bg-zinc-900"
            >
              <span className="text-4xl">{g === 0 ? "🎒" : "🏫"}</span>
              <span className="font-display font-bold">
                {gradeLabels[String(g)] ?? String(g)}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 3. Карта класса + (при выборе темы) вопрос поверх размытой карты
  // Все темы класса по порядку (олимпиада — последней, order 90).
  const pathTopics = getTopics({ grade });
  const inLesson = topicId !== null;
  const closeLabel = locale === "ky" ? "Картага" : "К карте";

  const mood: "idle" | "happy" | "sad" =
    status === "correct" ? "happy" : status === "wrong" ? "sad" : "idle";
  const mascotMessage = answered
    ? status === "correct"
      ? labels.cheerCorrect
      : labels.cheerWrong
    : undefined;

  return (
    <div className="mx-auto w-full max-w-[1480px]">
      {/* Карта класса. Во время занятия — размывается фоном. */}
      <div
        className={inLesson ? "pointer-events-none select-none blur-[7px] brightness-95" : ""}
        aria-hidden={inLesson}
      >
        <div className="mb-3 flex flex-col items-center gap-1">
          <button
            onClick={() => setGrade(null)}
            className="self-start text-sm font-semibold text-zinc-500 hover:text-foreground dark:text-zinc-400"
          >
            ← {gradeLabels[String(grade)] ?? gameLabels.gradeTitle}
          </button>
          <h2 className="font-display text-3xl font-extrabold">
            {gameLabels.topicsTitle}
          </h2>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            {gameLabels.starHint}
          </p>
        </div>

        {helper && (
          <LearningPath
            grade={grade}
            topics={pathTopics}
            allTasks={allTasks}
            results={results}
            premium={premium}
            locale={locale}
            helper={helper}
            onPick={chooseTopic}
            masteredLabel={locale === "ky" ? "Өтүлдү" : "Пройдено"}
          />
        )}
      </div>

      {/* Оверлей поверх размытой карты: вопрос по центру или финал */}
      {inLesson && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 backdrop-blur-[2px]">
          {/* Помощник поверх размытия */}
          <div className="pointer-events-none fixed bottom-4 left-4 z-10 hidden lg:block">
            <Mascot helper={helper} mood={mood} message={mascotMessage} size="lg" />
          </div>

          <div className="flex min-h-full items-start justify-center p-4 sm:items-center">
            <div className="w-full max-w-lg">
              <div className="mb-3 flex justify-end">
                <button
                  onClick={closeLesson}
                  className="rounded-full bg-white/90 px-4 py-1.5 text-sm font-bold text-zinc-700 shadow-md transition hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  ✕ {closeLabel}
                </button>
              </div>

              {finished ? (
                <div className="relative text-center">
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
                    <p className="mt-3 text-3xl">
                      {"⭐".repeat(Math.max(stars, 0)) || "—"}
                    </p>

                    {lockedCount > 0 && (
                      <div className="mt-6 rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-500/30 dark:bg-indigo-500/10">
                        <p className="font-display font-bold text-indigo-700 dark:text-indigo-300">
                          {labels.lockedTitle}
                        </p>
                        <p className="mt-1 text-sm text-indigo-700/80 dark:text-indigo-300/80">
                          {tpl(labels.lockedText, { count: lockedCount })}
                        </p>
                        <a
                          href={ADMIN_TG}
                          target="_blank"
                          rel="noopener"
                          onClick={() =>
                            pushEvent("subscribe_click", {
                              grade,
                              plan: "premium",
                              price: priceForCountry(countryForLocale(locale)).amount,
                              currency: currencyIso(countryForLocale(locale)),
                              source: "play_paywall",
                            })
                          }
                          className="mt-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 px-6 py-2.5 font-bold text-white shadow-md transition hover:brightness-110 active:scale-[.98]"
                        >
                          ✈️ {labels.subscribeCta}
                        </a>
                      </div>
                    )}

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <button onClick={restart} className={PRIMARY_BTN + " sm:w-auto sm:px-8"}>
                        {labels.restart}
                      </button>
                      <button
                        onClick={closeLesson}
                        className="rounded-full border-2 border-black/10 px-8 py-3.5 text-lg font-bold transition hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/5"
                      >
                        {closeLabel}
                      </button>
                      <Link
                        href={homeHref}
                        className="rounded-full px-6 py-3.5 text-lg font-bold text-zinc-500 transition hover:text-foreground dark:text-zinc-400"
                      >
                        {labels.backHome}
                      </Link>
                    </div>
                  </div>
                </div>
              ) : task ? (
                <div className="relative">
                  {status === "correct" && <Confetti />}

                  {/* Прогресс */}
                  <div className="mb-5">
                    <div className="mb-2 flex items-center justify-between text-sm font-semibold text-white/80">
                      <span>{labels.eyebrow}</span>
                      <span>
                        {tpl(labels.progress, {
                          current: index + 1,
                          total: activeTasks.length,
                        })}
                      </span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/25">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-500"
                        style={{ width: `${((index + 1) / activeTasks.length) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Карточка задания */}
                  <div className="rounded-[2rem] border border-black/[.06] bg-white p-6 shadow-2xl sm:p-8 dark:border-white/10 dark:bg-zinc-900">
        <div className="mb-4 flex items-center justify-between">
          {task.star ? (
            <span className="rounded-full border-2 border-amber-300 bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300">
              ⭐ {labels.starBadge}
            </span>
          ) : (
            <span />
          )}
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

          {task.type === "multi_select" && (
            <div className="space-y-3">
              <p className="mb-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
                {locale === "ky"
                  ? "Бардык туура жоопторду белгиле"
                  : "Отметь все верные ответы"}
              </p>
              {task.options.map((opt, i) => {
                const isChecked = multiSelected.includes(i);
                const isCorrect = task.correctIndexes.includes(i);
                let cls =
                  "flex w-full items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left text-lg font-semibold transition ";
                if (!answered) {
                  cls += isChecked
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10"
                    : "border-black/10 hover:-translate-y-0.5 hover:border-indigo-300 dark:border-white/15";
                } else if (isCorrect) {
                  cls += "border-green-500 bg-green-50 dark:bg-green-500/10";
                } else if (isChecked) {
                  cls += "border-red-400 bg-red-50 dark:bg-red-500/10";
                } else {
                  cls += "border-black/10 opacity-60 dark:border-white/15";
                }
                const box = answered
                  ? isCorrect
                    ? "✅"
                    : isChecked
                      ? "❌"
                      : "⬜"
                  : isChecked
                    ? "☑️"
                    : "⬜";
                return (
                  <button
                    key={i}
                    disabled={answered}
                    onClick={() =>
                      setMultiSelected((prev) =>
                        prev.includes(i)
                          ? prev.filter((x) => x !== i)
                          : [...prev, i],
                      )
                    }
                    className={cls}
                  >
                    <span className="text-xl">{box}</span>
                    <span>{opt[locale]}</span>
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
              ) : null}
            </div>
          </div>
        </div>
      )}

      {reward && (
        <RewardModal
          item={reward}
          locale={locale}
          onClose={() => setReward(null)}
        />
      )}
    </div>
  );
}
