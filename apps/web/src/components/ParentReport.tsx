"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getHelper,
  getTopics,
  subjectLabels,
  SUBJECTS,
  tasks as allTasks,
  type Locale,
} from "@izn-study/shared";
import {
  getState,
  isLoggedIn,
  listChildren,
  loadChildId,
  type Child,
  type ServerState,
} from "@/lib/api";
import { formatDuration, levelInfo } from "@/lib/stats";
import { Face } from "./Face";

export interface ParentLabels {
  title: string;
  loginPrompt: string;
  login: string;
  level: string;
  stars: string;
  streak: string;
  solved: string;
  accuracy: string;
  attempts: string;
  incorrect: string;
  timeSpent: string;
  bySubject: string;
  byTopic: string;
  noData: string;
  correctOf: string;
}

function tpl(str: string, vars: Record<string, string | number>) {
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

export function ParentReport({
  locale,
  labels,
  loginHref,
}: {
  locale: Locale;
  labels: ParentLabels;
  loginHref: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [logged, setLogged] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [selected, setSelected] = useState<Child | null>(null);
  const [state, setState] = useState<ServerState | null>(null);

  async function loadFor(child: Child) {
    setSelected(child);
    setState(await getState(child.id));
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      setLoaded(true);
      return;
    }
    setLogged(true);
    (async () => {
      try {
        const list = await listChildren();
        setChildren(list);
        const currentId = loadChildId();
        const child = list.find((c) => c.id === currentId) ?? list[0];
        if (child) await loadFor(child);
      } catch {
        // no-op
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  if (!loaded) {
    return (
      <div className="mx-auto h-64 w-full max-w-lg animate-pulse rounded-[2rem] border border-black/[.06] bg-white dark:border-white/10 dark:bg-zinc-900" />
    );
  }

  if (!logged) {
    return (
      <div className="mx-auto w-full max-w-md rounded-[2rem] border border-black/[.06] bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">{labels.loginPrompt}</p>
        <Link
          href={loginHref}
          className="mt-5 inline-block rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
        >
          {labels.login}
        </Link>
      </div>
    );
  }

  const progress = state?.progress ?? {};
  const answered = Object.keys(progress).length;
  const correct = Object.values(progress).filter((r) => r.correct).length;
  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const { level } = levelInfo(correct);
  const helper = getHelper(selected?.avatarHelperId) ?? getHelper("fox")!;

  const tile = (value: string | number, label: string) => (
    <div className="rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 p-3 text-center dark:from-indigo-500/15 dark:to-violet-500/10">
      <div className="font-display text-2xl font-extrabold text-indigo-700 dark:text-indigo-300">
        {value}
      </div>
      <div className="mt-0.5 text-[11px] font-semibold text-indigo-700/80 dark:text-indigo-300/80">
        {label}
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-lg">
      {/* Ребёнок + переключатель */}
      <div className="mb-5 flex flex-col items-center">
        <Face helper={helper} mood="idle" sizePx={72} track={false} />
        <h2 className="mt-2 font-display text-2xl font-extrabold">
          {selected?.name}
        </h2>
        {children.length > 1 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {children.map((c) => (
              <button
                key={c.id}
                onClick={() => loadFor(c)}
                className={
                  "rounded-full px-3 py-1 text-sm font-semibold transition " +
                  (c.id === selected?.id
                    ? "bg-indigo-600 text-white"
                    : "border border-black/10 dark:border-white/15")
                }
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-[2rem] border border-black/[.06] bg-white p-6 shadow-xl dark:border-white/10 dark:bg-zinc-900">
        {answered === 0 ? (
          <p className="py-8 text-center text-zinc-500 dark:text-zinc-400">
            {labels.noData}
          </p>
        ) : (
          <>
            {/* Сводка */}
            <div className="grid grid-cols-3 gap-3">
              {tile(level, labels.level)}
              {tile(`⭐ ${correct}`, labels.stars)}
              {tile(`🔥 ${state?.stats.streakCount ?? 0}`, labels.streak)}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              {tile(answered, labels.solved)}
              {tile(`${accuracy}%`, labels.accuracy)}
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              {tile(state?.stats.totalAnswered ?? 0, labels.attempts)}
              {tile(
                Math.max(
                  0,
                  (state?.stats.totalAnswered ?? 0) -
                    (state?.stats.totalCorrect ?? 0),
                ),
                labels.incorrect,
              )}
              {tile(
                formatDuration(state?.stats.timeSpentSec ?? 0),
                labels.timeSpent,
              )}
            </div>

            {/* По предметам */}
            <h3 className="mb-3 mt-6 font-display text-lg font-bold">
              {labels.bySubject}
            </h3>
            <div className="space-y-3">
              {SUBJECTS.map((subj) => {
                const subjTasks = allTasks.filter((t) => t.subject === subj);
                if (subjTasks.length === 0) return null;
                const done = subjTasks.filter((t) => progress[t.id]).length;
                const corr = subjTasks.filter(
                  (t) => progress[t.id]?.correct,
                ).length;
                const pct = (done / subjTasks.length) * 100;
                return (
                  <div key={subj}>
                    <div className="mb-1 flex justify-between text-sm font-semibold">
                      <span>{subjectLabels[subj][locale]}</span>
                      <span className="text-zinc-400">
                        {done}/{subjTasks.length}
                      </span>
                    </div>
                    <div className="h-2.5 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/10">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">
                      {tpl(labels.correctOf, { correct: corr, done })}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* По темам */}
            <h3 className="mb-3 mt-6 font-display text-lg font-bold">
              {labels.byTopic}
            </h3>
            <div className="space-y-2">
              {getTopics()
                .map((topic) => {
                  const topicTasks = allTasks.filter(
                    (t) => t.topic === topic.id,
                  );
                  const done = topicTasks.filter((t) => progress[t.id]).length;
                  return { topic, topicTasks, done };
                })
                // Показываем только начатые темы — иначе список из всех классов
                // огромен и почти весь по нулям.
                .filter((r) => r.done > 0)
                .sort((a, b) => b.done - a.done)
                .map(({ topic, topicTasks, done }) => {
                const complete = done === topicTasks.length;
                return (
                  <div
                    key={topic.id}
                    className="flex items-center gap-3 rounded-2xl border border-black/[.06] p-2.5 dark:border-white/10"
                  >
                    <span className="text-xl">{topic.icon}</span>
                    <span className="flex-1 text-sm font-semibold">
                      {topic.title[locale]}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {done}/{topicTasks.length}
                    </span>
                    {complete && done > 0 && <span>✅</span>}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
