"use client";

import {
  getHelper,
  helpers,
  tasks,
  type Locale,
} from "@izn-study/shared";
import { Character } from "./Character";
import { Mascot } from "./Mascot";

/** Превью экрана занятия (как в плеере). */
export function TaskPreview({
  locale,
  nextLabel,
}: {
  locale: Locale;
  nextLabel: string;
}) {
  const helper = getHelper("fox")!;
  const task = tasks.find((t) => t.id === "log-1-1");
  if (!task || task.type !== "single_choice") return null;

  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-3 flex justify-center">
        <Mascot helper={helper} mood="happy" message="Молодец!" />
      </div>
      <div className="rounded-[2rem] border border-black/[.06] bg-white p-6 shadow-xl">
        <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-black/[.06]">
          <div className="h-full w-1/2 rounded-full bg-[#6d5cf7]" />
        </div>
        <div className="mb-4 flex justify-end">
          <span className="rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 px-3 py-1 text-sm font-extrabold text-amber-900">
            ⭐ 3
          </span>
        </div>
        <div className="mb-4 rounded-2xl bg-[#efecff] py-6 text-center text-4xl">
          {task.illustration}
        </div>
        <p className="font-display text-xl font-bold">{task.prompt[locale]}</p>
        <div className="mt-4 space-y-2.5">
          {task.options.map((o, i) => (
            <div
              key={i}
              className={
                "rounded-2xl border-2 px-5 py-3 text-lg font-semibold " +
                (i === task.correctIndex
                  ? "border-green-500 bg-green-50"
                  : "border-black/10")
              }
            >
              {o[locale]}
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-full bg-[#6d5cf7] px-6 py-3 text-center text-lg font-bold text-white">
          {nextLabel}
        </div>
      </div>
    </div>
  );
}

/** Превью дашборда прогресса (как в кабинете). */
export function DashboardPreview({
  locale,
  labels,
}: {
  locale: Locale;
  labels: { level: string; stars: string; streak: string; completed: string };
}) {
  const helper = getHelper("panda")!;
  return (
    <div className="mx-auto w-full max-w-sm">
      <div className="mb-3 flex justify-center">
        <Mascot helper={helper} mood="idle" size="lg" />
      </div>
      <div className="rounded-[2rem] border border-black/[.06] bg-white p-6 shadow-xl">
        <h3 className="text-center font-display text-2xl font-extrabold">
          {helper.name[locale]}
        </h3>

        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-sm font-bold">
            <span>{labels.level} 3</span>
            <span className="text-[#5c5880]">4/5 ⭐</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-black/[.06]">
            <div className="h-full w-4/5 rounded-full bg-[#6d5cf7]" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { v: "⭐ 14", l: labels.stars, c: "from-amber-100 to-yellow-200 text-amber-700" },
            { v: "🔥 5", l: labels.streak, c: "from-orange-100 to-red-200 text-orange-700" },
            { v: "18", l: labels.completed, c: "from-[#efecff] to-violet-200 text-[#4b3cc9]" },
          ].map((t, i) => (
            <div key={i} className={"rounded-2xl bg-gradient-to-br p-3 text-center " + t.c}>
              <div className="font-display text-xl font-extrabold">{t.v}</div>
              <div className="mt-0.5 text-[11px] font-semibold opacity-80">{t.l}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-center gap-2 text-2xl">
          <span>👣</span>
          <span>⭐</span>
          <span>🔥</span>
          <span>🧠</span>
          <span className="opacity-30 grayscale">🎁</span>
        </div>
      </div>
    </div>
  );
}

/** Ряд всех персонажей (живые лица). */
export function CharactersShowcase({ locale }: { locale: Locale }) {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
      {helpers.map((h) => (
        <div key={h.id} className="flex flex-col items-center gap-1">
          <Character charId={h.id} sizePx={64} />
          <span className="font-display text-xs font-bold">{h.name[locale]}</span>
        </div>
      ))}
    </div>
  );
}
