"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ApiError,
  getAdminStats,
  getAdminUsers,
  isLoggedIn,
  type AdminStats,
  type AdminUser,
} from "@/lib/api";

export interface AdminLabels {
  loginPrompt: string;
  login: string;
  forbidden: string;
  users: string;
  children: string;
  subscriptions: string;
  premium: string;
  colEmail: string;
  colCountry: string;
  colChildren: string;
  colPremium: string;
  colRole: string;
}

export function AdminPanel({
  locale,
  labels,
  loginHref,
}: {
  locale: string;
  labels: AdminLabels;
  loginHref: string;
}) {
  const [loaded, setLoaded] = useState(false);
  const [logged, setLogged] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);

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
      <div className="mx-auto h-64 w-full max-w-3xl animate-pulse rounded-[2rem] border border-black/[.06] bg-white dark:border-white/10 dark:bg-zinc-900" />
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

  const tile = (value: number, label: string) => (
    <div className="rounded-2xl border border-black/[.06] bg-white p-4 text-center shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="font-display text-3xl font-extrabold">{value}</div>
      <div className="mt-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        {label}
      </div>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-3xl">
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tile(stats.users, labels.users)}
          {tile(stats.children, labels.children)}
          {tile(stats.activeSubscriptions, labels.subscriptions)}
          {tile(stats.premiumUsers, labels.premium)}
        </div>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl border border-black/[.06] dark:border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[.03] text-xs uppercase text-zinc-500 dark:bg-white/5 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">{labels.colEmail}</th>
              <th className="px-4 py-3">{labels.colCountry}</th>
              <th className="px-4 py-3 text-center">{labels.colChildren}</th>
              <th className="px-4 py-3 text-center">{labels.colPremium}</th>
              <th className="px-4 py-3">{labels.colRole}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.id}
                className="border-t border-black/[.06] dark:border-white/10"
              >
                <td className="px-4 py-2.5 font-medium">{u.email}</td>
                <td className="px-4 py-2.5 text-zinc-500">{u.country ?? "—"}</td>
                <td className="px-4 py-2.5 text-center">{u.children}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-center text-xs text-zinc-400">
        {new Date().toLocaleString(locale === "ky" ? "ky-KG" : "ru-RU")}
      </p>
    </div>
  );
}
