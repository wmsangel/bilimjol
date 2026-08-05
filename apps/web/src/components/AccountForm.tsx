"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getHelper, type Locale } from "@izn-study/shared";
import {
  ApiError,
  createChild,
  listChildren,
  loadChildId,
  login,
  register,
  saveChildId,
} from "@/lib/api";
import { syncChild } from "@/lib/sync";
import { loadHelperId, saveHelperId } from "@/lib/prefs";

export interface AuthLabels {
  loginTitle: string;
  registerTitle: string;
  email: string;
  password: string;
  loginCta: string;
  registerCta: string;
  toRegister: string;
  toLogin: string;
  syncing: string;
  errorGeneric: string;
  errorCredentials: string;
  errorEmailTaken: string;
  errorEmailInvalid: string;
}

export function AccountForm({
  locale,
  labels,
  meHref,
}: {
  locale: Locale;
  labels: AuthLabels;
  meHref: string;
}) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function mapError(e: unknown): string {
    if (e instanceof ApiError) {
      if (e.status === 401) return labels.errorCredentials;
      if (e.status === 409) return labels.errorEmailTaken;
      if (e.status === 400) return labels.errorEmailInvalid;
    }
    return labels.errorGeneric;
  }

  async function ensureChild(): Promise<string> {
    const children = await listChildren();
    const currentId = loadChildId();
    let chosen = children.find((c) => c.id === currentId) ?? children[0];
    if (!chosen) {
      const helperId = loadHelperId() ?? "fox";
      const helper = getHelper(helperId);
      const name = helper ? helper.name[locale] : "Ребёнок";
      chosen = await createChild(name, helperId, 1);
    }
    saveChildId(chosen.id);
    // Восстанавливаем аватар помощника из профиля ребёнка (для входа на новом устройстве).
    saveHelperId(chosen.avatarHelperId);
    return chosen.id;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "register") {
        await register(email, password, locale, locale === "ky" ? "KG" : "RU");
      } else {
        await login(email, password);
      }
      const childId = await ensureChild();
      await syncChild(childId);
      router.push(meHref);
    } catch (err) {
      setError(mapError(err));
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-sm rounded-[2rem] border border-black/[.06] bg-white p-8 shadow-xl dark:border-white/10 dark:bg-zinc-900"
    >
      <h2 className="mb-6 text-center font-display text-2xl font-extrabold">
        {mode === "login" ? labels.loginTitle : labels.registerTitle}
      </h2>

      <label className="mb-1 block text-sm font-semibold">{labels.email}</label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 w-full rounded-2xl border-2 border-black/10 bg-transparent px-4 py-3 outline-none focus:border-indigo-500 dark:border-white/15"
      />

      <label className="mb-1 block text-sm font-semibold">
        {labels.password}
      </label>
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 w-full rounded-2xl border-2 border-black/10 bg-transparent px-4 py-3 outline-none focus:border-indigo-500 dark:border-white/15"
      />

      {error && (
        <p className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-6 py-3.5 text-lg font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110 active:scale-[.98] disabled:opacity-50"
      >
        {loading
          ? labels.syncing
          : mode === "login"
            ? labels.loginCta
            : labels.registerCta}
      </button>

      <button
        type="button"
        onClick={() => {
          setMode(mode === "login" ? "register" : "login");
          setError(null);
        }}
        className="mt-4 w-full text-center text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
      >
        {mode === "login" ? labels.toRegister : labels.toLogin}
      </button>
    </form>
  );
}
