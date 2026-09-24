"use client";

import { useEffect, useState, type ReactNode } from "react";
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
import { pluralRu } from "@/lib/plural";
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
      <div className="mx-auto w-full max-w-md rounded-[28px] bg-white p-8 text-center font-sans text-[#191539] shadow-[0_16px_40px_rgba(25,21,57,.08)]">
        <p className="text-[#5c5880]">{labels.loginPrompt}</p>
        <Link
          href={loginHref}
          className="mt-5 inline-block rounded-full bg-[#6d5cf7] px-6 py-3.5 font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5"
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
  const streak = state?.stats.streakCount ?? 0;
  const timeSpent = formatDuration(state?.stats.timeSpentSec ?? 0);

  const stat = (value: ReactNode, label: string) => (
    <div className="rounded-[22px] bg-white p-4 shadow-[0_8px_24px_rgba(25,21,57,.05)]">
      <div className="text-[13px] font-extrabold text-[#5c5880]">{label}</div>
      <div className="mt-1 font-display text-[26px] font-bold">{value}</div>
    </div>
  );

  // «Стоит помочь» — темы, где ребёнок ошибался.
  const needsHelp = getTopics()
    .map((topic) => ({
      topic,
      wrong: allTasks.filter(
        (t) => t.topic === topic.id && progress[t.id]?.correct === false,
      ).length,
    }))
    .filter((r) => r.wrong > 0)
    .sort((a, b) => b.wrong - a.wrong)
    .slice(0, 4);

  const errWord = (n: number) =>
    locale === "ky" ? `${n} ката` : `${n} ${pluralRu(n, "ошибка", "ошибки", "ошибок")}`;

  return (
    <div className="mx-auto w-full max-w-4xl font-sans text-[#191539]">
      {/* Переключатель детей */}
      {children.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-2">
          {children.map((c) => {
            const h = getHelper(c.avatarHelperId) ?? helper;
            const active = c.id === selected?.id;
            return (
              <button
                key={c.id}
                onClick={() => loadFor(c)}
                className={
                  "flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-4 text-sm font-extrabold transition " +
                  (active
                    ? "bg-[#191539] text-white"
                    : "bg-white text-[#5c5880] shadow-[0_6px_18px_rgba(25,21,57,.05)]")
                }
              >
                <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#efecff]">
                  <Face helper={h} mood="idle" sizePx={26} track={false} />
                </span>
                {c.name}
              </button>
            );
          })}
        </div>
      )}

      {answered === 0 ? (
        <div className="rounded-[28px] bg-white p-10 text-center text-[#5c5880] shadow-[0_16px_40px_rgba(25,21,57,.08)]">
          {labels.noData}
        </div>
      ) : (
        <>
          {/* Показатели */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {stat(answered, labels.solved)}
            {stat(<span className="text-[#059669]">{accuracy}%</span>, labels.accuracy)}
            {stat(timeSpent, labels.timeSpent)}
            {stat(`🔥 ${streak}`, labels.streak)}
            {stat(`${level} · ⭐ ${correct}`, labels.level)}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.1fr_1fr]">
            {/* По предметам */}
            <div className="rounded-[24px] bg-white p-6 shadow-[0_8px_24px_rgba(25,21,57,.06)]">
              <h3 className="mb-4 font-display text-lg font-bold">
                {labels.bySubject}
              </h3>
              <div className="space-y-4">
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
                      <div className="mb-1.5 flex justify-between text-[15px] font-extrabold">
                        <span>{subjectLabels[subj][locale]}</span>
                        <span className="text-[#5c5880]">
                          {done}/{subjTasks.length}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-[#efecff]">
                        <div
                          className="h-full rounded-full bg-[#6d5cf7]"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[13px] text-[#5c5880]">
                        {tpl(labels.correctOf, { correct: corr, done })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Правая колонка */}
            <div className="flex flex-col gap-4">
              {needsHelp.length > 0 && (
                <div className="rounded-[24px] bg-[#fbf3e3] p-6">
                  <h3 className="mb-3 font-display text-[17px] font-bold text-[#7a5a1e]">
                    💡 {locale === "ky" ? "Жардам берүү керек" : "Стоит помочь"}
                  </h3>
                  <div className="divide-y divide-[#7a5a1e]/15">
                    {needsHelp.map(({ topic, wrong }) => (
                      <div
                        key={topic.id}
                        className="flex items-center justify-between gap-3 py-2 text-sm font-extrabold"
                      >
                        <span className="truncate">
                          {topic.icon} {topic.title[locale]}
                        </span>
                        <span className="flex-none text-[#9a3412]">
                          {errWord(wrong)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* По темам */}
              <div className="rounded-[24px] bg-white p-6 shadow-[0_8px_24px_rgba(25,21,57,.06)]">
                <h3 className="mb-3 font-display text-lg font-bold">
                  {labels.byTopic}
                </h3>
                <div className="space-y-2">
                  {getTopics()
                    .map((topic) => {
                      const topicTasks = allTasks.filter(
                        (t) => t.topic === topic.id,
                      );
                      const done = topicTasks.filter(
                        (t) => progress[t.id],
                      ).length;
                      return { topic, topicTasks, done };
                    })
                    // Только начатые темы — иначе список из всех классов огромен.
                    .filter((r) => r.done > 0)
                    .sort((a, b) => b.done - a.done)
                    .map(({ topic, topicTasks, done }) => {
                      const complete = done === topicTasks.length;
                      return (
                        <div
                          key={topic.id}
                          className="flex items-center gap-3 rounded-2xl bg-[#f7f5ff] p-2.5"
                        >
                          <span className="text-xl">{topic.icon}</span>
                          <span className="flex-1 truncate text-sm font-extrabold">
                            {topic.title[locale]}
                          </span>
                          <span className="flex-none text-xs font-bold text-[#5c5880]">
                            {done}/{topicTasks.length}
                          </span>
                          {complete && done > 0 && <span>✅</span>}
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
