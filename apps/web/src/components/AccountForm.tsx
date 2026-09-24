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
        // ВАЖНО: НЕ чистим локальные данные — прогресс/помощник гостя должны
        // переехать в новый аккаунт (ensureChild+syncChild зальют их на сервер).
        // Очистка чужих данных происходит при выходе (logout), а не тут.
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

  const tabLogin = locale === "ky" ? "Кирүү" : "Вход";
  const tabRegister = locale === "ky" ? "Катталуу" : "Регистрация";

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-[420px] rounded-[28px] bg-white p-8 font-sans text-[#191539] shadow-[0_20px_50px_rgba(25,21,57,.08)]"
    >
      {/* Табы: вход / регистрация */}
      <div className="mb-7 grid grid-cols-2 rounded-full bg-[#f1eefc] p-1 text-center text-[15px] font-extrabold">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setError(null);
            }}
            className={
              "rounded-full py-2.5 transition " +
              (mode === m
                ? "bg-white text-[#191539] shadow-[0_2px_8px_rgba(25,21,57,.08)]"
                : "text-[#5c5880]")
            }
          >
            {m === "login" ? tabLogin : tabRegister}
          </button>
        ))}
      </div>

      <h2 className="mb-6 text-center font-display text-[26px] font-bold">
        {mode === "login" ? labels.loginTitle : labels.registerTitle}
      </h2>

      <label className="mb-1.5 block text-sm font-bold">{labels.email}</label>
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-4 w-full rounded-2xl border-2 border-black/10 bg-transparent px-4 py-3 outline-none transition focus:border-[#6d5cf7]"
      />

      <label className="mb-1.5 block text-sm font-bold">{labels.password}</label>
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-5 w-full rounded-2xl border-2 border-black/10 bg-transparent px-4 py-3 outline-none transition focus:border-[#6d5cf7]"
      />

      {error && (
        <p className="mb-4 rounded-2xl bg-[#fef2f2] p-3 text-sm font-semibold text-[#dc2626]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-[#6d5cf7] px-6 py-3.5 text-lg font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5 active:scale-[.98] disabled:opacity-50 disabled:hover:translate-y-0"
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
        className="mt-4 w-full text-center text-sm font-bold text-[#6d5cf7] hover:underline"
      >
        {mode === "login" ? labels.toRegister : labels.toLogin}
      </button>
    </form>
  );
}
