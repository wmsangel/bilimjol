"use client";

import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import {
  adminDeleteUser,
  adminGrantPremium,
  adminResetPassword,
  ApiError,
  getAdminStats,
  getAdminUserDetail,
  getAdminUsers,
  isLoggedIn,
  type AdminChildDetail,
  type AdminStats,
  type AdminUser,
} from "@/lib/api";
import { accuracyPct, formatDuration } from "@/lib/stats";
import {
  subjectLabels,
  SUBJECTS,
  tasks as allTasks,
  type Locale,
} from "@izn-study/shared";

export interface AdminLabels {
  loginPrompt: string;
  login: string;
  forbidden: string;
  users: string;
  children: string;
  subscriptions: string;
  premium: string;
  totalAnswers: string;
  totalTime: string;
  colEmail: string;
  colCountry: string;
  colChildren: string;
  colActivity: string;
  colPremium: string;
  colRole: string;
  colActions: string;
  grant: string;
  reset: string;
  delete: string;
  confirmGrant: string;
  confirmReset: string;
  confirmDelete: string;
  deleteError: string;
  granted: string;
  newPasswordLabel: string;
  dismiss: string;
  search: string;
  filterPremium: string;
  showing: string;
}

function tpl(str: string, vars: Record<string, string>) {
  return str.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
}

export function AdminPanel({
  locale,
  labels,
  loginHref,
  children,
}: {
  locale: string;
  labels: AdminLabels;
  loginHref: string;
  children?: React.ReactNode;
}) {
  const [loaded, setLoaded] = useState(false);
  const [logged, setLogged] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [onlyPremium, setOnlyPremium] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<
    Record<string, AdminChildDetail[] | "loading">
  >({});

  async function toggleDetail(id: string) {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!detail[id]) {
      setDetail((d) => ({ ...d, [id]: "loading" }));
      try {
        const res = await getAdminUserDetail(id);
        setDetail((d) => ({ ...d, [id]: res.children }));
      } catch {
        setDetail((d) => ({ ...d, [id]: [] }));
      }
    }
  }

  async function onGrant(u: AdminUser) {
    if (!window.confirm(tpl(labels.confirmGrant, { email: u.email }))) return;
    setBusyId(u.id);
    try {
      await adminGrantPremium(u.id);
      setUsers((prev) =>
        prev.map((x) => (x.id === u.id ? { ...x, premium: true } : x)),
      );
      setNotice(labels.granted);
    } catch {
      // no-op
    } finally {
      setBusyId(null);
    }
  }

  async function onDelete(u: AdminUser) {
    if (!window.confirm(tpl(labels.confirmDelete, { email: u.email }))) return;
    setBusyId(u.id);
    try {
      await adminDeleteUser(u.id);
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch {
      setNotice(labels.deleteError);
    } finally {
      setBusyId(null);
    }
  }

  async function onReset(u: AdminUser) {
    if (!window.confirm(tpl(labels.confirmReset, { email: u.email }))) return;
    setBusyId(u.id);
    try {
      const r = await adminResetPassword(u.id);
      setNotice(`${labels.newPasswordLabel}: ${r.password}`);
    } catch {
      // no-op
    } finally {
      setBusyId(null);
    }
  }

  useEffect(() => {
    if (!isLoggedIn()) {
      setLoaded(true);
      return;
    }
    setLogged(true);
    (async () => {
      try {
        const [s, u] = await Promise.all([getAdminStats(), getAdminUsers()]);
        setStats(s);
        setUsers(u);
      } catch (e) {
        if (e instanceof ApiError && e.status === 403) setForbidden(true);
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  if (!loaded) {
    return (
      <div className="mx-auto h-64 w-full max-w-5xl animate-pulse rounded-[2rem] border border-black/[.06] bg-white dark:border-white/10 dark:bg-zinc-900" />
    );
  }

  if (!logged || forbidden) {
    return (
      <div className="mx-auto w-full max-w-md rounded-[2rem] border border-black/[.06] bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-400">
          {forbidden ? labels.forbidden : labels.loginPrompt}
        </p>
        {!logged && (
          <Link
            href={loginHref}
            className="mt-5 inline-block rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
          >
            {labels.login}
          </Link>
        )}
      </div>
    );
  }

  const filtered = users.filter((u) => {
    if (onlyPremium && !u.premium) return false;
    const q = query.trim().toLowerCase();
    if (q && !u.email.toLowerCase().includes(q)) return false;
    return true;
  });

  const tile = (value: number | string, label: string) => (
    <div className="rounded-2xl border border-black/[.06] bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="font-display text-3xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
    </div>
  );

  const miniTile = (value: number | string, label: string) => (
    <div className="rounded-xl bg-black/[.03] p-2.5 text-center dark:bg-white/[.05]">
      <div className="font-display text-lg font-extrabold">{value}</div>
      <div className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
    </div>
  );

  // Детализация пользователя (админ-панель — для владельца, подписи по-русски).
  function renderDetail(id: string) {
    const d = detail[id];
    if (d === undefined || d === "loading")
      return <p className="text-sm text-zinc-500">Загружаем…</p>;
    if (d.length === 0)
      return <p className="text-sm text-zinc-500">Пока нет данных занятий.</p>;
    return (
      <div className="space-y-4">
        {d.map((c) => {
          const prog = new Map(c.progress.map((p) => [p.taskId, p.correct]));
          const acc = accuracyPct(c.stats.totalAnswered, c.stats.totalCorrect);
          return (
            <div
              key={c.id}
              className="rounded-2xl border border-black/[.06] bg-white p-4 dark:border-white/10 dark:bg-zinc-900"
            >
              <div className="mb-3 flex items-center gap-2 font-bold">
                {c.name}
                <span className="text-xs font-semibold text-zinc-400">
                  {c.grade === 0 ? "подгот." : `${c.grade} класс`}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {miniTile(c.stats.totalAnswered, "Ответов")}
                {miniTile(`${acc}%`, "Точность")}
                {miniTile(formatDuration(c.stats.timeSpentSec), "Время")}
                {miniTile(`🔥 ${c.stats.streakCount}`, "Серия")}
              </div>
              <div className="mt-4 space-y-2">
                {SUBJECTS.map((subj) => {
                  const subjTasks = allTasks.filter((t) => t.subject === subj);
                  if (!subjTasks.length) return null;
                  const done = subjTasks.filter((t) => prog.has(t.id)).length;
                  if (done === 0) return null; // только начатые предметы
                  const corr = subjTasks.filter((t) => prog.get(t.id)).length;
                  const pct = (done / subjTasks.length) * 100;
                  return (
                    <div key={subj}>
                      <div className="mb-0.5 flex justify-between text-xs font-semibold">
                        <span>{subjectLabels[subj][locale as Locale]}</span>
                        <span className="text-zinc-400">
                          верно {corr} · пройдено {done}/{subjTasks.length}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-black/[.06] dark:bg-white/10">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      {notice && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-500/40 dark:bg-amber-500/10">
          <span className="font-mono text-sm font-bold text-amber-800 dark:text-amber-200">
            {notice}
          </span>
          <button
            onClick={() => setNotice(null)}
            className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white"
          >
            {labels.dismiss}
          </button>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {tile(stats.users, labels.users)}
          {tile(stats.children, labels.children)}
          {tile(stats.activeSubscriptions, labels.subscriptions)}
          {tile(stats.premiumUsers, labels.premium)}
          {tile(stats.totalAnswered, labels.totalAnswers)}
          {tile(formatDuration(stats.timeSpentSec), labels.totalTime)}
        </div>
      )}

      {/* Поиск и фильтр */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.search}
          className="min-w-0 flex-1 rounded-full border border-black/[.08] bg-white px-4 py-2 text-sm outline-none focus:border-indigo-400 dark:border-white/10 dark:bg-zinc-900"
        />
        <button
          onClick={() => setOnlyPremium((v) => !v)}
          className={
            "rounded-full px-4 py-2 text-sm font-bold transition " +
            (onlyPremium
              ? "bg-amber-400 text-white shadow-md"
              : "bg-black/[.05] text-zinc-600 hover:bg-black/10 dark:bg-white/10 dark:text-zinc-300")
          }
        >
          ⭐ {labels.filterPremium}
        </button>
        <span className="text-xs font-semibold text-zinc-400">
          {tpl(labels.showing, { count: String(filtered.length) })}
        </span>
      </div>

      <div className="mt-3 overflow-x-auto rounded-2xl border border-black/[.06] dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[.03] text-xs uppercase text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">{labels.colEmail}</th>
              <th className="px-4 py-3">{labels.colCountry}</th>
              <th className="px-4 py-3 text-center">{labels.colChildren}</th>
              <th className="px-4 py-3 text-center">{labels.colActivity}</th>
              <th className="px-4 py-3 text-center">{labels.colPremium}</th>
              <th className="px-4 py-3">{labels.colRole}</th>
              <th className="px-4 py-3">{labels.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <Fragment key={u.id}>
              <tr className="border-t border-black/[.06] dark:border-white/10">
                <td className="px-4 py-2.5 font-medium">
                  <button
                    onClick={() => toggleDetail(u.id)}
                    className="flex items-center gap-1.5 text-left transition hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    <span
                      className={
                        "text-xs text-zinc-400 transition-transform " +
                        (expandedId === u.id ? "rotate-90" : "")
                      }
                    >
                      ▶
                    </span>
                    {u.email}
                  </button>
                </td>
                <td className="px-4 py-2.5 text-zinc-500">{u.country ?? "—"}</td>
                <td className="px-4 py-2.5 text-center">{u.children}</td>
                <td className="px-4 py-2.5 text-center text-xs text-zinc-500 dark:text-zinc-400">
                  {u.totalAnswered > 0
                    ? `${u.totalAnswered} · ${formatDuration(u.timeSpentSec)}`
                    : "—"}
                </td>
                <td className="px-4 py-2.5 text-center">
                  {u.premium ? "⭐" : "—"}
                </td>
                <td className="px-4 py-2.5">
                  {u.role === "admin" ? (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                      admin
                    </span>
                  ) : (
                    <span className="text-zinc-400">{u.role}</span>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => onGrant(u)}
                      disabled={busyId === u.id}
                      className="whitespace-nowrap rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-200 disabled:opacity-40 dark:bg-amber-500/15 dark:text-amber-300"
                    >
                      {labels.grant}
                    </button>
                    <button
                      onClick={() => onReset(u)}
                      disabled={busyId === u.id}
                      className="whitespace-nowrap rounded-lg bg-black/[.05] px-3 py-1.5 text-xs font-bold text-zinc-600 transition hover:bg-black/10 disabled:opacity-40 dark:bg-white/10 dark:text-zinc-300"
                    >
                      {labels.reset}
                    </button>
                    <button
                      onClick={() => onDelete(u)}
                      disabled={busyId === u.id}
                      className="whitespace-nowrap rounded-lg bg-red-100 px-3 py-1.5 text-xs font-bold text-red-700 transition hover:bg-red-200 disabled:opacity-40 dark:bg-red-500/15 dark:text-red-300"
                    >
                      {labels.delete}
                    </button>
                  </div>
                </td>
              </tr>
              {expandedId === u.id && (
                <tr className="bg-black/[.02] dark:bg-white/[.02]">
                  <td colSpan={7} className="px-4 py-4">
                    {renderDetail(u.id)}
                  </td>
                </tr>
              )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-center text-xs text-zinc-400">
        {new Date().toLocaleString(locale === "ky" ? "ky-KG" : "ru-RU")}
      </p>

      {/* Доп. содержимое (напр. статистика контента) — только для админа. */}
      {children}
    </div>
  );
}
