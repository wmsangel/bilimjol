"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  checkAnswer,
  getHelper,
  getProgramTopics,
  getTopics,
  GRADES,
  helpers,
  subjectLabels,
  subjectsForGrade,
  type Locale,
  type Subject,
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
import { speak, speechSupported, stopSpeaking } from "@/lib/speech";
import { helperGradient } from "@/lib/helperTheme";

// Контакт администратора (пока оплата картой не подключена). Переопределяется env.
const ADMIN_TG =
  process.env.NEXT_PUBLIC_ADMIN_TELEGRAM ?? "https://t.me/izagorodnyi";

// Вариант ответа «как картинка» — эмодзи/символы без букв (показываем крупно).
function isImageLike(s: string): boolean {
  const t = s.trim();
  // Эмодзи занимают по 2 UTF-16 символа — до ~6 картинок в группе (напр. «🍎🍎🍎»).
  return t.length > 0 && t.length <= 12 && !/\p{L}/u.test(t);
}

// Сетка для крупных карточек-картинок: 4 варианта → 2×2 (без сироты в ряду),
// остальные — адаптивно (по 2 на телефоне, по 3 на широком экране).
function imageGridClass(n: number): string {
  return n === 4
    ? "grid grid-cols-2 gap-3"
    : "grid grid-cols-2 gap-3 sm:grid-cols-3";
}

// Текст для озвучки: вопрос + варианты, но эмодзи-варианты пропускаем
// (их не прочитать голосом — ребёнок и так видит и тапает картинку).
function speakText(task: Task, locale: Locale): string {
  const parts = [task.prompt[locale]];
  if (task.type === "single_choice" || task.type === "multi_select") {
    for (const o of task.options) {
      if (!isImageLike(o[locale])) parts.push(o[locale]);
    }
  }
  return parts.join(". ");
}

const SUBJECT_EMOJI: Record<Subject, string> = {
  logic: "🧩",
  math: "🔢",
  reading: "📖",
  world: "🌍",
  olympiad: "🏆",
};
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
  guestSaveTitle: string;
  guestSaveText: string;
  guestSaveCta: string;
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
  programCta: string;
  programDesc: string;
  starHint: string;
  unlockFor: string;
  notEnoughStars: string;
}

// Основная кнопка «Проверить/Далее» в режиме занятия (бренд-палитра).
const PRIMARY_PILL =
  "w-full rounded-full bg-[#6d5cf7] px-6 py-4 text-lg font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5 active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0";

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

// Индикатор шагов старта: Герой → Класс → Тема.
function StepIndicator({
  current,
  locale,
}: {
  current: 1 | 2 | 3;
  locale: Locale;
}) {
  const steps: [number, string][] = [
    [1, locale === "ky" ? "Каарман" : "Герой"],
    [2, locale === "ky" ? "Класс" : "Класс"],
    [3, locale === "ky" ? "Тема" : "Тема"],
  ];
  return (
    <div className="mb-7 flex items-center justify-center gap-2 text-[13px] font-extrabold text-[#5c5880]">
      {steps.map(([n, label], i) => (
        <div key={n} className="flex items-center gap-2">
          {i > 0 && <span className="h-0.5 w-5 bg-black/10 sm:w-8" />}
          <span
            className={
              "flex h-7 w-7 items-center justify-center rounded-full " +
              (n <= current ? "bg-[#6d5cf7] text-white" : "bg-[#e6e1ff] text-[#6d5cf7]")
            }
          >
            {n}
          </span>
          <span className={n === current ? "text-[#191539]" : ""}>{label}</span>
        </div>
      ))}
    </div>
  );
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
  // Выбор предмета: null — не выбран (экран выбора), "all" — общая программа.
  const [subject, setSubject] = useState<Subject | "all" | null>(null);
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

  const [isGuest, setIsGuest] = useState(false);
  useEffect(() => {
    setHelperId(loadHelperId());
    setResults(loadProgress());
    setLastGrade(loadLastGrade());
    setLoaded(true);
    if (isLoggedIn()) {
      getEntitlement()
        .then((e) => setPremium(e.premium))
        .catch(() => undefined);
    } else {
      setIsGuest(true);
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

  // Автоозвучка для 0 класса: читаем вопрос сразу при открытии (жест уже был —
  // выбор класса/темы, поэтому речь не блокируется браузером).
  useEffect(() => {
    if (grade !== 0 || topicId === null || finished || !task) return;
    const text = speakText(task, locale);
    const timer = setTimeout(() => speak(text, locale), 350);
    return () => {
      clearTimeout(timer);
      stopSpeaking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, topicId, finished, grade, locale]);
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
    setSubject(null); // сначала выбор предмета
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
      <div className="mx-auto h-72 w-full max-w-lg animate-pulse rounded-[28px] bg-white shadow-[0_8px_24px_rgba(25,21,57,.06)]" />
    );
  }

  // 1. Выбор помощника
  if (!helper) {
    const preview = pendingHelper
      ? helpers.find((h) => h.id === pendingHelper)
      : undefined;
    const previewGradient = preview
      ? helperGradient[preview.color] ?? "from-[#8577ff] to-violet-500"
      : "";
    return (
      <div className="mx-auto w-full max-w-4xl font-sans text-[#191539]">
        <StepIndicator current={1} locale={locale} />
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-start">
          <div>
            <h2 className="font-display text-3xl font-bold">{gameLabels.chooseTitle}</h2>
            <p className="mt-1.5 text-[#5c5880]">{gameLabels.chooseSubtitle}</p>
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
            <p className="mt-5 text-sm text-[#5c5880]">
              {locale === "ky"
                ? "Жаңы каармандарды тапшырмалар үчүн алган жылдыздарга ач."
                : "Новых героев открывай за звёзды, которые получаешь за задания."}
            </p>
          </div>

          {/* Превью выбранного помощника (десктоп) */}
          <div className="hidden rounded-[28px] bg-white p-8 text-center shadow-[0_16px_40px_rgba(25,21,57,.08)] lg:block">
            {preview ? (
              <>
                <div
                  className={
                    "mx-auto mb-5 flex h-[180px] w-[180px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br " +
                    previewGradient
                  }
                >
                  <Mascot helper={preview} mood="idle" size="lg" />
                </div>
                <div className="font-display text-2xl font-bold">{preview.name[locale]}</div>
                <p className="mt-3 rounded-2xl bg-[#f7f5ff] px-4 py-3 text-[15px] leading-snug text-[#2d2950]">
                  {locale === "ky"
                    ? "«Салам! Кел, чогуу тапшырмаларды чечип, жылдыз жыйнайлы!»"
                    : "«Привет! Давай вместе решать задачки и собирать звёзды!»"}
                </p>
                <button onClick={chooseHelper} className={"mt-6 " + PRIMARY_PILL}>
                  {gameLabels.chooseCta}
                </button>
              </>
            ) : (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-[#5c5880]">
                <div className="text-5xl">👆</div>
                <p className="mt-3 max-w-[200px] text-sm font-semibold">
                  {gameLabels.chooseSubtitle}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* CTA для мобилки */}
        <button
          onClick={chooseHelper}
          disabled={!pendingHelper}
          className={"mt-7 lg:hidden " + PRIMARY_PILL}
        >
          {preview ? `${gameLabels.chooseCta} — ${preview.name[locale]}` : gameLabels.chooseCta}
        </button>
      </div>
    );
  }

  // 2. Выбор класса
  if (grade === null) {
    return (
      <div className="mx-auto w-full max-w-2xl font-sans text-[#191539]">
        <StepIndicator current={2} locale={locale} />
        <div className="mb-5 flex justify-center">
          <div
            className={
              "flex h-[104px] w-[104px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br " +
              (helperGradient[helper.color] ?? "from-[#8577ff] to-violet-500")
            }
          >
            <Mascot helper={helper} mood="idle" size="md" />
          </div>
        </div>
        <h2 className="text-center font-display text-3xl font-bold">
          {gameLabels.gradeTitle}
        </h2>
        {lastGrade !== null && GRADES.includes(lastGrade) && (
          <div className="mt-5 text-center">
            <button
              onClick={() => chooseGrade(lastGrade)}
              className="inline-flex items-center gap-2 rounded-full bg-[#6d5cf7] px-6 py-3 font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5"
            >
              ▶ {locale === "ky" ? "Улантуу" : "Продолжить"} —{" "}
              {gradeLabels[String(lastGrade)] ?? lastGrade}
            </button>
          </div>
        )}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {GRADES.map((g) => (
            <button
              key={g}
              onClick={() => chooseGrade(g)}
              className="flex flex-col items-center gap-2 rounded-3xl bg-white p-5 shadow-[0_8px_24px_rgba(25,21,57,.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(25,21,57,.1)]"
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

  // 2b. Выбор предмета (или общая программа)
  if (subject === null) {
    const subjects = subjectsForGrade(grade);
    return (
      <div className="mx-auto w-full max-w-2xl font-sans text-[#191539]">
        <StepIndicator current={3} locale={locale} />
        <button
          onClick={() => setGrade(null)}
          className="text-sm font-extrabold text-[#5c5880] transition hover:text-[#191539]"
        >
          ← {gradeLabels[String(grade)] ?? gameLabels.gradeTitle}
        </button>
        <h2 className="mt-3 text-center font-display text-3xl font-bold">
          {gameLabels.subjectTitle}
        </h2>
        <p className="mt-1.5 text-center text-[#5c5880]">{gameLabels.programDesc}</p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {/* Общая программа (вперемешку по предметам) */}
          <button
            onClick={() => setSubject("all")}
            className="relative flex flex-col items-center justify-center gap-2 overflow-hidden rounded-3xl bg-[#191539] p-5 text-center text-white transition hover:-translate-y-1"
          >
            <span className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#6d5cf7] opacity-40 blur-2xl" />
            <span className="relative text-3xl">✨</span>
            <span className="relative font-display text-sm font-bold sm:text-base">
              {locale === "ky" ? "Баары чогуу" : "Всё вместе"}
            </span>
          </button>
          {subjects.map((s) => (
            <button
              key={s}
              onClick={() => setSubject(s)}
              className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-white p-5 text-center shadow-[0_8px_24px_rgba(25,21,57,.06)] transition hover:-translate-y-1 hover:shadow-[0_0_0_2px_#b9b3e6]"
            >
              <span className="text-3xl">{SUBJECT_EMOJI[s]}</span>
              <span className="font-display text-sm font-bold sm:text-base">
                {subjectLabels[s][locale]}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // 3. Карта класса + (при выборе темы) вопрос поверх размытой карты
  // "all" — общая программа (вперемешку); иначе — темы одного предмета.
  const pathTopics =
    subject === "all"
      ? getProgramTopics(grade)
      : getTopics({ grade, subject });
  const inLesson = topicId !== null;
  const closeLabel = locale === "ky" ? "Картага" : "К карте";
  const lessonTitle =
    subject === "all" ? gameLabels.programCta : subjectLabels[subject][locale];

  const mood: "idle" | "happy" | "sad" =
    status === "correct" ? "happy" : status === "wrong" ? "sad" : "idle";
  const mascotMessage = answered
    ? status === "correct"
      ? labels.cheerCorrect
      : labels.cheerWrong
    : undefined;
  // Реплика помощника в пузыре: похвала/поддержка после ответа, иначе — подбадривание.
  const bubbleText =
    mascotMessage ??
    (locale === "ky" ? "Кана, ойлонуп көрөлү 🤔" : "Давай подумаем вместе 🤔");
  const gradient = helperGradient[helper.color] ?? "from-[#8577ff] to-violet-500";

  return (
    <div className="mx-auto w-full max-w-[1480px]">
      {/* Карта класса. Во время занятия — размывается фоном. */}
      <div
        className={inLesson ? "pointer-events-none select-none blur-[7px] brightness-95" : ""}
        aria-hidden={inLesson}
      >
        <div className="mb-3 flex flex-col items-center gap-1 font-sans text-[#191539]">
          <button
            onClick={() => setSubject(null)}
            className="self-start text-sm font-extrabold text-[#5c5880] transition hover:text-[#191539]"
          >
            ←{" "}
            {subject === "all"
              ? gameLabels.programCta
              : subjectLabels[subject][locale]}
          </button>
          <h2 className="font-display text-3xl font-bold">
            {gameLabels.topicsTitle}
          </h2>
          <p className="text-center text-sm text-[#5c5880]">
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

      {/* Режим погружения: только прогресс и выход */}
      {inLesson && (
        <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-[#f7f5ff] font-sans text-[#191539]">
          {finished ? (
            <div className="relative flex flex-1 items-center justify-center overflow-hidden bg-[#191539] p-4 text-white">
              <Confetti />
              <div className="pointer-events-none absolute left-[10%] top-[8%] h-[380px] w-[380px] rounded-full bg-[#6d5cf7] opacity-30 blur-[100px]" />
              <div className="pointer-events-none absolute bottom-[6%] right-[8%] h-[280px] w-[280px] rounded-full bg-[#e6c079] opacity-20 blur-[90px]" />
              <div className="relative w-full max-w-md rounded-[32px] bg-white p-8 text-center text-[#191539] shadow-[0_30px_60px_rgba(0,0,0,.3)]">
                <div
                  className={
                    "mx-auto mb-5 flex h-[140px] w-[140px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br " +
                    gradient
                  }
                >
                  <Mascot helper={helper} mood="happy" size="md" />
                </div>
                <h2 className="font-display text-[30px] font-bold">
                  {labels.finishTitle}
                </h2>
                <p className="mt-1.5 text-[17px] text-[#5c5880]">
                  {tpl(labels.finishScore, {
                    score: stars,
                    total: activeTasks.length,
                  })}
                </p>
                {stars > 0 ? (
                  <div className="my-4 flex flex-wrap justify-center gap-1 text-3xl">
                    {Array.from({ length: stars }).map((_, i) => (
                      <span key={i}>⭐</span>
                    ))}
                  </div>
                ) : (
                  <p className="my-4 text-4xl">—</p>
                )}

                {isGuest && (
                  <div className="mt-6 rounded-2xl border-2 border-[#a7f3d0] bg-[#ecfdf5] p-5 text-left">
                    <p className="font-display font-bold text-[#047857]">
                      💾 {labels.guestSaveTitle}
                    </p>
                    <p className="mt-1 text-sm text-[#059669]">
                      {labels.guestSaveText}
                    </p>
                    <Link
                      href={`/${locale}/login`}
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#10b981] px-6 py-2.5 font-bold text-white shadow-md transition hover:brightness-110 active:scale-[.98]"
                    >
                      ✅ {labels.guestSaveCta}
                    </Link>
                  </div>
                )}

                {lockedCount > 0 && (
                  <div className="mt-6 rounded-2xl border-2 border-[#e6c079] bg-[#fbf3e3] p-5 text-left">
                    <p className="font-display font-bold text-[#7a5a1e]">
                      {labels.lockedTitle}
                    </p>
                    <p className="mt-1 text-sm text-[#7a5a1e]/80">
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
                      className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#191539] px-6 py-2.5 font-bold text-white shadow-md transition hover:brightness-125 active:scale-[.98]"
                    >
                      ✈️ {labels.subscribeCta}
                    </a>
                  </div>
                )}

                <div className="mt-7 flex flex-col gap-3">
                  <button onClick={restart} className={PRIMARY_PILL}>
                    🔄 {labels.restart}
                  </button>
                  <button
                    onClick={closeLesson}
                    className="rounded-full border-2 border-black/10 px-6 py-3.5 text-base font-bold transition hover:bg-black/[.04]"
                  >
                    {closeLabel}
                  </button>
                  <Link
                    href={homeHref}
                    className="rounded-full px-6 py-2 text-base font-bold text-[#5c5880] transition hover:text-[#191539]"
                  >
                    {labels.backHome}
                  </Link>
                </div>
              </div>
            </div>
          ) : task ? (
            <>
              {/* Верхняя панель: выход, прогресс, кошелёк, звук */}
              <header className="flex items-center gap-3 px-4 py-3 sm:gap-5 sm:px-8 sm:py-4">
                <button
                  onClick={closeLesson}
                  aria-label={closeLabel}
                  className="flex h-11 w-11 flex-none items-center justify-center rounded-2xl bg-white text-lg font-extrabold text-[#5c5880] shadow-[0_4px_14px_rgba(25,21,57,.08)] transition hover:text-[#191539]"
                >
                  ✕
                </button>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-[13px] font-extrabold text-[#5c5880] sm:text-sm">
                    <span className="truncate">{lessonTitle}</span>
                    <span className="flex-none">
                      {tpl(labels.progress, {
                        current: index + 1,
                        total: activeTasks.length,
                      })}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-[#e6e1ff] sm:h-3">
                    <div
                      className="h-full rounded-full bg-[#6d5cf7] transition-all duration-500"
                      style={{ width: `${((index + 1) / activeTasks.length) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="flex-none rounded-full bg-[#fbf3e3] px-3 py-2 text-sm font-extrabold text-[#7a5a1e] sm:px-4">
                  ⭐ {earnedStars}
                </span>
                {speechSupported() && (
                  <button
                    type="button"
                    onClick={() => speak(speakText(task, locale), locale)}
                    aria-label={locale === "ky" ? "Үнү менен угуу" : "Озвучить"}
                    className="hidden h-11 w-11 flex-none items-center justify-center rounded-2xl bg-white text-lg shadow-[0_4px_14px_rgba(25,21,57,.08)] transition hover:-translate-y-0.5 sm:flex"
                  >
                    🔈
                  </button>
                )}
              </header>

              {/* Тело: помощник + карточка задания */}
              <div className="mx-auto grid w-full max-w-[1200px] flex-1 items-center gap-6 px-4 pb-8 sm:gap-10 sm:px-8 lg:grid-cols-[280px_minmax(0,1fr)]">
                {/* Помощник — десктоп */}
                <div className="hidden flex-col items-center lg:flex">
                  <div className="relative mb-5 max-w-[240px] rounded-[22px] bg-white px-5 py-4 text-center text-[15px] font-bold leading-snug shadow-[0_10px_30px_rgba(25,21,57,.08)]">
                    {bubbleText}
                    <span className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-white" />
                  </div>
                  <div
                    className={
                      "flex h-[200px] w-[200px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br " +
                      gradient
                    }
                  >
                    <Mascot helper={helper} mood={mood} size="lg" />
                  </div>
                  <div className="mt-3 font-display text-xl font-bold">
                    {helper.name[locale]}
                  </div>
                </div>

                {/* Помощник — мобилка (компактно) */}
                <div className="flex items-end gap-3 lg:hidden">
                  <div
                    className={
                      "flex h-[72px] w-[72px] flex-none items-center justify-center overflow-hidden rounded-full bg-gradient-to-br " +
                      gradient
                    }
                  >
                    <Mascot helper={helper} mood={mood} size="md" />
                  </div>
                  <div className="rounded-[16px] rounded-bl-md bg-white px-3.5 py-2.5 text-sm font-bold leading-snug shadow-[0_8px_20px_rgba(25,21,57,.06)]">
                    {bubbleText}
                  </div>
                </div>

                {/* Карточка задания */}
                <div className="relative rounded-[28px] bg-white p-6 shadow-[0_20px_50px_rgba(25,21,57,.08)] sm:rounded-[32px] sm:p-8 lg:p-10">
                  {status === "correct" && <Confetti />}

                  <div className="mb-6 flex items-start gap-4">
                    {speechSupported() && (
                      <button
                        type="button"
                        onClick={() => speak(speakText(task, locale), locale)}
                        aria-label={locale === "ky" ? "Үнү менен угуу" : "Озвучить"}
                        className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-[#6d5cf7] text-2xl text-white shadow-[0_0_0_6px_#e6e1ff] transition active:scale-95"
                      >
                        🔊
                      </button>
                    )}
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-xl font-bold leading-snug sm:text-2xl">
                        {task.prompt[locale]}
                      </h2>
                      {speechSupported() && (
                        <p className="mt-1 text-sm font-bold text-[#5c5880]">
                          {locale === "ky"
                            ? "Угуу үчүн бас"
                            : "Нажми, чтобы послушать вопрос"}
                        </p>
                      )}
                    </div>
                    {task.star && (
                      <span className="flex-none rounded-full bg-[#fbf3e3] px-3 py-1.5 text-xs font-extrabold text-[#7a5a1e]">
                        ⭐ {labels.starBadge}
                      </span>
                    )}
                  </div>

                  {task.illustration && (
                    <div className="mb-6 rounded-2xl bg-[#efecff] py-7 text-center text-5xl">
                      {task.illustration}
                    </div>
                  )}

                  {/* Ответы по типу задания */}
                  <div className="mt-6">
                    {task.type === "single_choice" &&
                      (() => {
                        const asImages = task.options.every((o) => isImageLike(o[locale]));
                        return (
                          <div
                            className={
                              asImages
                                ? imageGridClass(task.options.length)
                                : "space-y-3"
                            }
                          >
                            {task.options.map((opt, i) => {
                              const isSelected = selected === i;
                              const isCorrect = i === task.correctIndex;
                              let cls = asImages
                                ? "flex items-center justify-center rounded-3xl border-[3px] py-8 text-6xl transition active:scale-95 "
                                : "w-full rounded-2xl border-2 px-5 py-4 text-left text-lg font-semibold transition ";
                              if (!answered) {
                                cls += isSelected
                                  ? "border-[#6d5cf7] bg-[#efecff]"
                                  : "border-black/10 hover:-translate-y-0.5 hover:border-[#b9b3e6]";
                              } else if (isCorrect) {
                                cls += "border-[#34d399] bg-[#ecfdf5]";
                              } else if (isSelected) {
                                cls += "border-[#fb7185] bg-[#fef2f2]";
                              } else {
                                cls += "border-black/10 opacity-60";
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
                        );
                      })()}

                    {task.type === "multi_select" &&
                      (() => {
                        const asImages = task.options.every((o) => isImageLike(o[locale]));
                        return (
                          <div>
                            <p className="mb-2 text-sm font-semibold text-[#5c5880]">
                              {locale === "ky"
                                ? "Бардык туура жоопторду белгиле"
                                : "Отметь все верные ответы"}
                            </p>
                            <div
                              className={
                                asImages
                                  ? imageGridClass(task.options.length)
                                  : "space-y-3"
                              }
                            >
                              {task.options.map((opt, i) => {
                                const isChecked = multiSelected.includes(i);
                                const isCorrect = task.correctIndexes.includes(i);
                                let cls = asImages
                                  ? "relative flex items-center justify-center rounded-3xl border-[3px] py-8 text-6xl transition active:scale-95 "
                                  : "flex w-full items-center gap-3 rounded-2xl border-2 px-5 py-4 text-left text-lg font-semibold transition ";
                                if (!answered) {
                                  cls += isChecked
                                    ? "border-[#6d5cf7] bg-[#efecff]"
                                    : "border-black/10 hover:-translate-y-0.5 hover:border-[#b9b3e6]";
                                } else if (isCorrect) {
                                  cls += "border-[#34d399] bg-[#ecfdf5]";
                                } else if (isChecked) {
                                  cls += "border-[#fb7185] bg-[#fef2f2]";
                                } else {
                                  cls += "border-black/10 opacity-60";
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
                                    {asImages ? (
                                      <>
                                        <span>{opt[locale]}</span>
                                        <span className="absolute right-2 top-2 text-lg">
                                          {box}
                                        </span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-xl">{box}</span>
                                        <span>{opt[locale]}</span>
                                      </>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })()}

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
                        className="w-full rounded-2xl border-2 border-black/10 bg-transparent px-5 py-4 text-center text-2xl font-bold outline-none focus:border-[#6d5cf7]"
                      />
                    )}

                    {task.type === "ordering" && (
                      <div>
                        <p className="mb-3 text-sm font-semibold text-[#5c5880]">
                          {labels.orderingHint}
                        </p>
                        <div className="mb-3 flex min-h-16 flex-wrap gap-2 rounded-2xl border-2 border-dashed border-black/15 p-3">
                          {orderPicked.map((origIdx, pos) => {
                            const stateCls = !answered
                              ? "border-[#6d5cf7] bg-[#efecff]"
                              : status === "correct"
                                ? "border-[#34d399] bg-[#ecfdf5]"
                                : "border-[#fb7185] bg-[#fef2f2]";
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
                                className="rounded-xl border-2 border-black/10 px-4 py-2 text-xl font-bold transition hover:-translate-y-0.5 hover:border-[#b9b3e6]"
                              >
                                {task.items[i][locale]}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}

                    {task.type === "match_pairs" && (
                      <div>
                        <p className="mb-3 text-sm font-semibold text-[#5c5880]">
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
                                    ? "border-[#34d399] bg-[#ecfdf5]"
                                    : "border-[#fb7185] bg-[#fef2f2]";
                              } else if (selectedLeft === i) {
                                cls += "border-[#6d5cf7] bg-[#efecff]";
                              } else if (isMatched) {
                                cls += "border-[#b9b3e6]";
                              } else {
                                cls += "border-black/10 hover:border-[#b9b3e6]";
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
                                    <span className="text-[#5c5880]">
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
                                      ? "border-black/10 opacity-40"
                                      : "border-black/10 hover:border-[#b9b3e6]")
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
                        "mt-6 rounded-2xl p-4 text-sm font-semibold " +
                        (status === "correct"
                          ? "bg-[#ecfdf5] text-[#065f46]"
                          : "bg-[#fef3e2] text-[#92400e]")
                      }
                    >
                      {task.explanation[locale]}
                    </div>
                  )}

                  {/* Кнопка действия */}
                  <div className="mt-7">
                    {!answered ? (
                      <button onClick={submit} disabled={!canSubmit} className={PRIMARY_PILL}>
                        {labels.check}
                      </button>
                    ) : (
                      <button onClick={next} className={PRIMARY_PILL}>
                        {labels.next} →
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : null}
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
