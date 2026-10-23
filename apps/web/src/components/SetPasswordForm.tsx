"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ApiError, setPassword } from "@/lib/api";

// Форма установки пароля по ссылке из письма (гостевой аккаунт после оплаты).
// token приходит из query письма; успешная установка логинит и ведёт к занятиям.
export function SetPasswordForm({
  token,
  lang,
}: {
  token: string | null;
  lang: string;
}) {
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);
  const router = useRouter();
  const [password, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const card =
    "mx-auto w-full max-w-md rounded-[28px] bg-white p-8 shadow-[0_12px_40px_rgba(25,21,57,.08)]";

  if (!token) {
    return (
      <div className={card}>
        <h1 className="font-display text-2xl font-bold">
          {t("Ссылка некорректна", "Шилтеме туура эмес")}
        </h1>
        <p className="mt-3 text-[#5c5880]">
          {t(
            "Откройте ссылку из письма целиком — в ней не хватает кода. Если не получается, напишите нам.",
            "Каттагы шилтемени толук ачыңыз — анда код жетишпейт. Болбосо, бизге жазыңыз.",
          )}
        </p>
        <Link
          href={`/${lang}/login`}
          className="mt-5 inline-flex font-bold text-[#6d5cf7] hover:underline"
        >
          {t("Войти", "Кирүү")} →
        </Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError(t("Пароль не короче 8 символов", "Сырсөз 8 белгиден кем эмес"));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await setPassword(token!, password);
      router.push(`/${lang}/play`);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(
          t(
            "Ссылка недействительна или устарела. Оформите подписку заново или войдите.",
            "Шилтеме жараксыз же эскирген. Жазылууну кайра тариздеңиз же кириңиз.",
          ),
        );
      } else {
        setError(t("Не удалось сохранить пароль", "Сырсөздү сактоо мүмкүн болбоду"));
      }
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className={card}>
      <h1 className="font-display text-2xl font-bold">
        {t("Задайте пароль", "Сырсөз коюңуз")}
      </h1>
      <p className="mt-2 text-[#5c5880]">
        {t(
          "Придумайте пароль, чтобы входить в аккаунт на любом устройстве.",
          "Каалаган түзмөктөн кирүү үчүн сырсөз ойлоп табыңыз.",
        )}
      </p>
      <input
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => {
          setPwd(e.target.value);
          if (error) setError(null);
        }}
        placeholder={t("Новый пароль", "Жаңы сырсөз")}
        className="mt-5 w-full rounded-full border border-[#e6e1f5] bg-[#f7f5ff] px-5 py-3.5 text-base outline-none focus:border-[#6d5cf7]"
      />
      {error && (
        <p className="mt-2 text-sm font-semibold text-[#d64545]">{error}</p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="mt-5 flex w-full items-center justify-center rounded-full bg-[#6d5cf7] px-6 py-4 text-lg font-extrabold text-white shadow-[0_0_0_3px_#e6c079] transition hover:-translate-y-0.5 active:scale-[.99] disabled:cursor-wait disabled:opacity-60"
      >
        {busy
          ? t("Сохраняем…", "Сакталууда…")
          : t("Сохранить и войти", "Сактап, кирүү")}
      </button>
    </form>
  );
}
