"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { tests, type Locale, type Task } from "@izn-study/shared";
import { sendGa4Event } from "@/lib/gtm";

// Генератор печатных рабочих листов по математике. Переиспользует генераторы
// примеров из общего пакета (tests[*].generate()) — к каждому листу новые
// примеры. Ответы складываем в «ключ» в конце. Печать → «Сохранить как PDF»
// средствами браузера (без тяжёлой PDF-библиотеки).

type Kind = {
  testId: string; // id в tests[] с нужным generate()
  icon: string;
  title: { ru: string; ky: string };
  grade: { ru: string; ky: string };
};

// Арифметические генераторы дают неограниченно свежие примеры — идеальны для листа.
const KINDS: Kind[] = [
  { testId: "add", icon: "➕", title: { ru: "Сложение", ky: "Кошуу" }, grade: { ru: "1–2 класс", ky: "1–2-класс" } },
  { testId: "sub", icon: "➖", title: { ru: "Вычитание", ky: "Кемитүү" }, grade: { ru: "1–2 класс", ky: "1–2-класс" } },
  { testId: "mult-table", icon: "✖️", title: { ru: "Таблица умножения", ky: "Көбөйтүү таблицасы" }, grade: { ru: "2–3 класс", ky: "2–3-класс" } },
  { testId: "division", icon: "➗", title: { ru: "Деление", ky: "Бөлүү" }, grade: { ru: "3–4 класс", ky: "3–4-класс" } },
  { testId: "mixed", icon: "🎲", title: { ru: "Вперемешку (+ − ×)", ky: "Аралаш (+ − ×)" }, grade: { ru: "2–4 класс", ky: "2–4-класс" } },
  { testId: "compare", icon: "⚖️", title: { ru: "Сравнение чисел", ky: "Сандарды салыштыруу" }, grade: { ru: "1–2 класс", ky: "1–2-класс" } },
  { testId: "squares", icon: "🔼", title: { ru: "Квадраты чисел", ky: "Сандардын квадраттары" }, grade: { ru: "5+ класс", ky: "5+ класс" } },
];

const COUNTS = [12, 20, 30] as const;

// Условие задачи → вид для листа: «a + b = ____» (ключ «= ?» заменяем пробелом).
function stem(prompt: string): string {
  if (/=\s*\?\s*$/.test(prompt)) return prompt.replace(/=\s*\?\s*$/, "=");
  return prompt.replace(/\s*\?\s*$/, "");
}

// Правильный ответ задачи для «ключа».
function answerOf(task: Task): string {
  if (task.type === "number_input") return String(task.answer);
  if (task.type === "single_choice") return task.options[task.correctIndex]?.ru ?? "";
  return "";
}

export function WorksheetMaker({ lang }: { lang: Locale }) {
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);
  const [kindId, setKindId] = useState<string>(KINDS[0].testId);
  const [count, setCount] = useState<number>(20);
  const [items, setItems] = useState<Task[]>([]);
  const [showKey, setShowKey] = useState(false);
  const opened = useRef(false);

  const kind = useMemo(() => KINDS.find((k) => k.testId === kindId) ?? KINDS[0], [kindId]);

  function build(id: string, n: number): Task[] {
    const def = tests.find((x) => x.id === id);
    if (!def) return [];
    const out: Task[] = [];
    // generate() выдаёт фиксированный набор — повторяем до нужного числа.
    let guard = 0;
    while (out.length < n && guard < 100) {
      out.push(...def.generate());
      guard += 1;
    }
    return out.slice(0, n);
  }

  function regenerate() {
    setItems(build(kindId, count));
    sendGa4Event("tool_used", { tool: "worksheet", item: kindId, count });
  }

  useEffect(() => {
    if (!opened.current) {
      opened.current = true;
      sendGa4Event("tool_opened", { tool: "worksheet", item: "worksheet" });
    }
    setItems(build(kindId, count));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function print() {
    sendGa4Event("print", { tool: "worksheet", item: kindId, format: "pdf" });
    if (typeof window !== "undefined") window.print();
  }

  const dateLine = t("Дата: ____________", "Күнү: ____________");
  const nameLine = t("Имя: ____________________", "Аты: ____________________");

  return (
    <div>
      {/* Печатаем только .ws-sheet: прячем всё остальное через visibility. */}
      <style>{`
        @media print {
          body { background: #fff !important; }
          body * { visibility: hidden !important; }
          .ws-sheet, .ws-sheet * { visibility: visible !important; }
          .ws-sheet { position: absolute; left: 0; top: 0; width: 100%; padding: 0 6mm; }
          .ws-key { break-before: page; }
          .ws-row { break-inside: avoid; }
        }
        @media screen {
          .ws-key.ws-screen-hide { display: none; }
        }
      `}</style>

      {/* ── Панель управления (не печатается) ───────────────────────── */}
      <div className="ws-noprint rounded-[28px] bg-white p-5 shadow-[0_10px_30px_rgba(25,21,57,.08)] sm:p-6">
        <p className="text-sm font-bold text-[#8f8aa8]">
          {t("1. Выберите тему", "1. Теманы тандаңыз")}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {KINDS.map((k) => {
            const active = k.testId === kindId;
            return (
              <button
                key={k.testId}
                type="button"
                onClick={() => setKindId(k.testId)}
                aria-pressed={active}
                className={`flex items-center gap-2 rounded-2xl border-2 p-3 text-left transition ${
                  active
                    ? "border-[#6d5cf7] bg-[#f2effe]"
                    : "border-transparent bg-[#f7f5ff] hover:border-[#d9d2fb]"
                }`}
              >
                <span className="flex-none text-xl">{k.icon}</span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold text-[#191539]">{k.title[lang]}</span>
                  <span className="block truncate text-xs text-[#8f8aa8]">{k.grade[lang]}</span>
                </span>
              </button>
            );
          })}
        </div>

        <p className="mt-5 text-sm font-bold text-[#8f8aa8]">
          {t("2. Сколько примеров", "2. Канча мисал")}
        </p>
        <div className="mt-2 flex gap-2">
          {COUNTS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setCount(n)}
              aria-pressed={n === count}
              className={`rounded-full px-5 py-2 text-sm font-extrabold transition ${
                n === count ? "bg-[#6d5cf7] text-white" : "bg-[#f7f5ff] text-[#5c5880] hover:bg-[#ece7fd]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={regenerate}
            className="inline-flex rounded-full bg-[#6d5cf7] px-7 py-3 font-extrabold text-white shadow-[0_12px_30px_rgba(109,92,247,.35)] transition hover:-translate-y-0.5"
          >
            {t("Новый лист ↻", "Жаңы барак ↻")}
          </button>
          <button
            type="button"
            onClick={print}
            className="inline-flex rounded-full bg-[#191539] px-7 py-3 font-extrabold text-white transition hover:-translate-y-0.5"
          >
            {t("Распечатать / PDF ⤓", "Басып чыгаруу / PDF ⤓")}
          </button>
          <button
            type="button"
            onClick={() => setShowKey((v) => !v)}
            className="inline-flex rounded-full bg-[#f7f5ff] px-6 py-3 font-bold text-[#5c5880] transition hover:bg-[#ece7fd]"
          >
            {showKey ? t("Скрыть ответы", "Жоопторду жашыруу") : t("Показать ответы", "Жоопторду көрсөтүү")}
          </button>
        </div>
        <p className="mt-3 text-xs text-[#8f8aa8]">
          {t(
            "Ответы печатаются на отдельном листе. При печати выберите «Сохранить как PDF».",
            "Жооптор өзүнчө баракка басылат. Басууда «PDF катары сактоо» тандаңыз.",
          )}
        </p>
      </div>

      {/* ── Сам лист (печатается) ───────────────────────────────────── */}
      <div className="ws-sheet mt-6 rounded-[20px] border border-[#ece7fd] bg-white p-6 text-[#191539] sm:p-8">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-[#191539] pb-3">
          <h2 className="font-display text-2xl font-extrabold">
            {kind.icon} {kind.title[lang]}
          </h2>
          <span className="text-sm font-bold text-[#5c5880]">{kind.grade[lang]} · Bilimjol.com</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-8 gap-y-1 text-sm text-[#5c5880]">
          <span>{nameLine}</span>
          <span>{dateLine}</span>
        </div>

        <ol className="mt-5 grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-2">
          {items.map((task, i) => (
            <li key={i} className="ws-row flex items-center gap-2 text-lg">
              <span className="w-6 flex-none text-right font-bold text-[#8f8aa8]">{i + 1}.</span>
              <span className="font-semibold">{stem(task.prompt[lang])}</span>
              <span className="min-w-[2.5rem] flex-1 border-b border-dashed border-[#b9b2d8]">&nbsp;</span>
            </li>
          ))}
        </ol>

        {/* Ключ ответов — всегда в печати (на новой странице), на экране — по кнопке. */}
        <div className={`ws-key mt-8 ${showKey ? "" : "ws-screen-hide"}`}>
          <h3 className="font-display text-lg font-bold text-[#5c5880]">
            {t("Ответы", "Жооптор")} — {kind.title[lang]}
          </h3>
          <div className="mt-3 grid grid-cols-3 gap-x-6 gap-y-1 text-sm sm:grid-cols-5">
            {items.map((task, i) => (
              <span key={i} className="text-[#5c5880]">
                <span className="font-bold text-[#8f8aa8]">{i + 1}.</span> {answerOf(task)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
