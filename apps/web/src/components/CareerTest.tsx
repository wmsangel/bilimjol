"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  careerQuestions,
  careerTypes,
  getCareerType,
  scoreCareer,
  topCareerTypes,
  CAREER_MAX_PER_TYPE,
} from "@izn-study/shared";
import type { Locale } from "@/i18n/config";
import { pushEvent } from "@/lib/gtm";

const KEY = "izn.study:career:v1";

export function CareerTest({
  locale,
  classHref,
  ortHref,
}: {
  locale: Locale;
  classHref: string;
  ortHref: string;
}) {
  const total = careerQuestions.length;
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const t = (ru: string, ky: string) => (locale === "ky" ? ky : ru);

  function start() {
    pushEvent("career_start", {});
    setStarted(true);
    setIndex(0);
    setAnswers([]);
    setDone(false);
  }

  function answer(value: 0 | 1 | 2) {
    const next = [...answers, value];
    setAnswers(next);
    if (index + 1 >= total) {
      const code = topCareerTypes(next).join("");
      pushEvent("career_finish", { code });
      try {
        window.localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
      } catch {}
      setDone(true);
    } else {
      setIndex(index + 1);
    }
  }

  function back() {
    if (index === 0) return;
    setAnswers(answers.slice(0, -1));
    setIndex(index - 1);
  }

  // ── Интро ──
  if (!started) {
    return (
      <div className="mx-auto w-full max-w-xl text-center font-sans text-[#191539]">
        <p className="mb-2 text-lg leading-relaxed text-[#5c5880]">
          {t(
            "30 коротких утверждений о том, что вам нравится. Отвечайте честно — правильных ответов нет. В конце получите профиль склонностей с профессиями и предметами.",
            "Сизге эмне жагаары жөнүндө 30 кыска айтым. Чынчыл жооп бериңиз — туура жооп жок. Аягында кесиптер жана предметтер менен жөндөм профилиңизди аласыз.",
          )}
        </p>
        <p className="mb-6 text-sm text-[#8f8aa8]">
          {t("Методика RIASEC · 2–3 минуты · без регистрации", "RIASEC методикасы · 2–3 мүнөт · катталуусуз")}
        </p>
        <button
          onClick={start}
          className="rounded-full bg-[#6d5cf7] px-10 py-4 text-lg font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5 active:scale-95"
        >
          {t("Пройти тест", "Тестти өтүү")}
        </button>
      </div>
    );
  }

  // ── Результат ──
  if (done) {
    const scores = scoreCareer(answers);
    const top = topCareerTypes(answers, 3);
    const code = top.join("");
    const sorted = [...careerTypes].sort((a, b) => scores[b.id] - scores[a.id]);

    return (
      <div className="mx-auto w-full max-w-2xl font-sans text-[#191539]">
        <div className="rounded-[32px] bg-white p-7 text-center shadow-[0_20px_50px_rgba(25,21,57,.08)] sm:p-9">
          <div className="text-5xl">{top.map((id) => getCareerType(id).emoji).join(" ")}</div>
          <p className="mt-3 text-xs font-extrabold uppercase tracking-[1.4px] text-[#5c5880]">
            {t("Ваш профиль склонностей", "Жөндөм профилиңиз")}
          </p>
          <h2 className="mt-1 font-display text-[26px] font-bold sm:text-[30px]">
            {top.map((id) => getCareerType(id).name[locale]).join(" · ")}
          </h2>
          <div className="mt-2 inline-block rounded-full bg-[#efecff] px-4 py-1.5 text-sm font-extrabold tracking-wider text-[#4b3cc9]">
            {t("Код", "Код")} {code}
          </div>

          {/* Диаграмма всех 6 типов */}
          <div className="mt-6 space-y-2.5 text-left">
            {sorted.map((ty) => {
              const pct = Math.round((scores[ty.id] / CAREER_MAX_PER_TYPE) * 100);
              const isTop = top.includes(ty.id);
              return (
                <div key={ty.id} className="flex items-center gap-3">
                  <span className="w-7 flex-none text-xl">{ty.emoji}</span>
                  <span className="w-28 flex-none truncate text-sm font-bold">{ty.name[locale]}</span>
                  <span className="h-3 flex-1 overflow-hidden rounded-full bg-[#eee9ff]">
                    <span
                      className={"block h-full rounded-full " + (isTop ? "bg-[#6d5cf7]" : "bg-[#c4bbf0]")}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="w-9 flex-none text-right text-xs font-extrabold text-[#5c5880]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Карточки топ-3 типов */}
        <div className="mt-4 space-y-4">
          {top.map((id) => {
            const ty = getCareerType(id);
            return (
              <div key={id} className="rounded-[26px] bg-white p-6 shadow-[0_12px_30px_rgba(25,21,57,.06)]">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{ty.emoji}</span>
                  <div>
                    <h3 className="font-display text-xl font-bold">{ty.name[locale]}</h3>
                    <p className="text-xs font-bold uppercase tracking-wide text-[#8f8aa8]">{ty.holland[locale]}</p>
                  </div>
                </div>
                <p className="mt-3 leading-relaxed text-[#2d2950]">{ty.description[locale]}</p>
                <dl className="mt-4 space-y-2 text-sm">
                  <div className="flex gap-2">
                    <dt className="w-28 flex-none font-bold text-[#6d5cf7]">{t("Профессии", "Кесиптер")}</dt>
                    <dd className="text-[#2d2950]">{ty.professions[locale]}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-28 flex-none font-bold text-[#6d5cf7]">{t("Направления", "Багыттар")}</dt>
                    <dd className="text-[#2d2950]">{ty.directions[locale]}</dd>
                  </div>
                  <div className="flex gap-2">
                    <dt className="w-28 flex-none font-bold text-[#6d5cf7]">{t("Предметы", "Предметтер")}</dt>
                    <dd className="text-[#2d2950]">{ty.subjects[locale]}</dd>
                  </div>
                </dl>
              </div>
            );
          })}
        </div>

        <p className="mt-4 px-2 text-sm leading-relaxed text-[#8f8aa8]">
          {t(
            "Это не приговор, а подсказка: профиль показывает склонности, а не единственный путь. Пробуйте разное — и усиливайте предметы, которые ведут к интересным вам профессиям.",
            "Бул өкүм эмес, кеңеш: профиль жөндөмдү көрсөтөт, бирок бирден-бир жол эмес. Ар кандайды сынап көрүңүз — жана сизди кызыктырган кесиптерге алып барган предметтерди чыңдаңыз.",
          )}
        </p>

        {/* CTA */}
        <div className="mt-4 rounded-[24px] bg-[#6d5cf7] px-6 py-7 text-center text-white shadow-[0_16px_40px_rgba(109,92,247,.3)]">
          <p className="font-display text-lg font-bold">
            {t("Усильте нужные предметы на Bilimjol", "Керектүү предметтерди Bilimjolдо чыңдаңыз")}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-white/85">
            {t(
              "Задания и тесты по школьной программе, а для 10–11 классов — подготовка к ОРТ.",
              "Мектеп программасы боюнча тапшырмалар жана тесттер, 10–11-класс үчүн — ЖРТга даярдык.",
            )}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <Link href={classHref} className="rounded-full bg-white px-6 py-3 font-extrabold text-[#6d5cf7] shadow-md transition hover:-translate-y-0.5">
              {t("К занятиям", "Сабактарга")}
            </Link>
            <Link href={ortHref} className="rounded-full bg-white/15 px-6 py-3 font-extrabold text-white ring-1 ring-white/40 transition hover:bg-white/25">
              {t("Подготовка к ОРТ", "ЖРТга даярдык")}
            </Link>
          </div>
        </div>

        <button
          onClick={start}
          className="mt-4 block w-full text-center text-sm font-extrabold text-[#5c5880] transition hover:text-[#191539]"
        >
          🔄 {t("Пройти заново", "Кайра өтүү")}
        </button>
      </div>
    );
  }

  // ── Вопрос ──
  const pct = ((index + 1) / total) * 100;
  const options: [0 | 1 | 2, string, "yes" | "sometimes" | "no"][] = [
    [2, t("Да, это про меня", "Ооба, бул мен жөнүндө"), "yes"],
    [1, t("Иногда / отчасти", "Кээде / жарым-жартылай"), "sometimes"],
    [0, t("Нет, не моё", "Жок, меники эмес"), "no"],
  ];
  return (
    <div className="mx-auto w-full max-w-xl font-sans text-[#191539]">
      <div className="mb-2 flex items-center justify-between text-sm font-extrabold text-[#5c5880]">
        <span>{t("Вопрос", "Суроо")} {index + 1} / {total}</span>
      </div>
      <div className="mb-7 h-3 overflow-hidden rounded-full bg-[#e6e1ff]">
        <div className="h-full rounded-full bg-[#6d5cf7] transition-all duration-300" style={{ width: `${pct}%` }} />
      </div>

      <div className="rounded-[32px] bg-white p-7 shadow-[0_20px_50px_rgba(25,21,57,.08)] sm:p-9">
        <p className="font-display text-[22px] font-bold leading-snug sm:text-[26px]">
          {careerQuestions[index].text[locale]}
        </p>
        <div className="mt-7 flex flex-col gap-3">
          {options.map(([value, text, tone]) => (
            <button
              key={value}
              onClick={() => answer(value)}
              className={
                "rounded-2xl border-2 px-6 py-4 text-left text-lg font-extrabold transition hover:-translate-y-0.5 active:scale-[.99] " +
                (tone === "yes"
                  ? "border-[#a7f3d0] hover:border-[#34d399]"
                  : tone === "sometimes"
                    ? "border-[#e6c079] bg-[#fbf3e3] hover:border-[#c9a04f]"
                    : "border-black/10 hover:border-[#b9b3e6]")
              }
            >
              {text}
            </button>
          ))}
        </div>
      </div>

      {index > 0 && (
        <button
          onClick={back}
          className="mt-4 text-sm font-extrabold text-[#5c5880] transition hover:text-[#191539]"
        >
          ← {t("Назад", "Артка")}
        </button>
      )}
    </div>
  );
}
