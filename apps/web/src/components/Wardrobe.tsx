"use client";

import { useEffect, useState } from "react";
import type { Locale } from "@izn-study/shared";
import { loadProgress } from "@/lib/progress";
import { loadHelperId, removeHelperId } from "@/lib/prefs";
import {
  WARDROBE,
  SETS,
  SLOT_LABELS,
  characterName,
  wardrobeIcon,
  type Outfit,
  type Slot,
  type WardrobeItem,
} from "@/lib/characterArt";
import { loadOutfit, saveOutfit } from "@/lib/wardrobe";
import { Character } from "./Character";

const SLOTS: Slot[] = ["head", "body", "face", "neck"];

export function Wardrobe({
  locale,
  changeHelperHref,
}: {
  locale: Locale;
  changeHelperHref: string;
}) {
  const [charId, setCharId] = useState("fox");
  const [outfit, setOutfit] = useState<Outfit>({});
  const [stars, setStars] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setCharId(loadHelperId() ?? "fox");
    setOutfit(loadOutfit());
    const progress = loadProgress();
    setStars(Object.values(progress).filter((r) => r.correct).length);
    setLoaded(true);
  }, []);

  function toggle(item: WardrobeItem) {
    if (stars < item.unlockAt) return;
    setOutfit((prev) => {
      const next: Outfit = { ...prev };
      if (next[item.slot] === item.id) delete next[item.slot];
      else next[item.slot] = item.id;
      saveOutfit(next);
      return next;
    });
  }

  const slotOf = (id: string) => WARDROBE.find((w) => w.id === id)?.slot;
  function equipSet(itemIds: string[]) {
    setOutfit(() => {
      const next: Outfit = {};
      for (const id of itemIds) {
        const slot = slotOf(id);
        if (slot) next[slot] = id;
      }
      saveOutfit(next);
      return next;
    });
  }

  const t = (ru: string, ky: string) => (locale === "ky" ? ky : ru);

  if (!loaded) {
    return (
      <div className="h-72 w-full animate-pulse rounded-[2rem] border border-black/[.06] bg-white dark:border-white/10 dark:bg-zinc-900" />
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
      {/* Превью персонажа */}
      <div className="lg:sticky lg:top-6">
        <div className="flex flex-col items-center rounded-[2rem] border border-black/[.06] bg-gradient-to-b from-indigo-50 to-sky-50 p-6 shadow-sm dark:border-white/10 dark:from-zinc-900 dark:to-zinc-950">
          <Character charId={charId} outfit={outfit} sizePx={190} />
          <div className="mt-2 font-display text-xl font-extrabold">
            {characterName(charId)}
          </div>
          <div className="mt-1 rounded-full bg-gradient-to-r from-amber-300 to-yellow-400 px-3 py-1 text-sm font-extrabold text-amber-900">
            ⭐ {stars}
          </div>
          <button
            onClick={() => {
              removeHelperId();
              window.location.href = changeHelperHref;
            }}
            className="mt-4 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {t("Сменить героя", "Каарманды алмаштыруу")}
          </button>
        </div>
      </div>

      {/* Гардероб по слотам */}
      <div>
        {/* Готовые наборы */}
        <div className="mb-6">
          <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wide text-zinc-400">
            {t("Наборы", "Топтомдор")}
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SETS.map((set) => {
              const locked = stars < set.unlockAt;
              const active = set.items.every(
                (id) => outfit[slotOf(id) as Slot] === id,
              );
              return (
                <button
                  key={set.id}
                  onClick={() => !locked && equipSet(set.items)}
                  disabled={locked}
                  className={
                    "relative flex items-center gap-3 rounded-2xl border-2 bg-white p-3 text-left shadow-sm transition dark:bg-zinc-900 " +
                    (active
                      ? "border-indigo-500 shadow-indigo-500/20"
                      : locked
                        ? "cursor-not-allowed border-black/[.06] dark:border-white/10"
                        : "border-black/[.06] hover:-translate-y-1 hover:border-indigo-300 dark:border-white/10")
                  }
                >
                  <span className={"text-3xl " + (locked ? "opacity-40 grayscale" : "")}>
                    {set.emoji}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={
                        "block truncate text-sm font-bold " +
                        (locked ? "text-zinc-400" : "text-zinc-700 dark:text-zinc-200")
                      }
                    >
                      {set.name[locale]}
                    </span>
                    <span className="text-xs font-semibold text-zinc-400">
                      {locked
                        ? `${set.unlockAt} ⭐`
                        : t("Надеть набор", "Топтомду кий")}
                    </span>
                  </span>
                  {active && (
                    <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white shadow">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {SLOTS.map((slot) => {
          const items = WARDROBE.filter((i) => i.slot === slot);
          return (
            <div key={slot} className="mb-6">
              <h3 className="mb-3 text-xs font-extrabold uppercase tracking-wide text-zinc-400">
                {SLOT_LABELS[slot][locale]}
              </h3>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {items.map((it) => {
                  const locked = stars < it.unlockAt;
                  const equipped = outfit[it.slot] === it.id;
                  return (
                    <button
                      key={it.id}
                      onClick={() => toggle(it)}
                      disabled={locked}
                      className={
                        "relative flex flex-col items-center gap-1 rounded-2xl border-2 bg-white p-3 shadow-sm transition dark:bg-zinc-900 " +
                        (equipped
                          ? "border-emerald-500 shadow-emerald-500/20 hover:shadow-md"
                          : locked
                            ? "cursor-not-allowed border-black/[.06] dark:border-white/10"
                            : "border-black/[.06] hover:-translate-y-1 hover:border-indigo-300 dark:border-white/10")
                      }
                    >
                      <span
                        className={"block h-10 w-11 " + (locked ? "opacity-30 grayscale" : "")}
                        dangerouslySetInnerHTML={{ __html: wardrobeIcon(it.id) }}
                      />
                      <span
                        className={
                          "truncate text-xs font-bold " +
                          (locked ? "text-zinc-400" : "text-zinc-700 dark:text-zinc-200")
                        }
                      >
                        {it.name}
                      </span>
                      {equipped && (
                        <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white shadow">
                          ✓
                        </span>
                      )}
                      {locked && (
                        <span className="absolute right-1.5 top-1.5 rounded-full bg-amber-100 px-1.5 text-[10px] font-bold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                          {it.unlockAt} ⭐
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {t(
            "Решай задания и получай звёзды — за них открываются новые вещи.",
            "Тапшырмаларды чечип, жылдыз жыйна — алар үчүн жаңы буюмдар ачылат.",
          )}
        </p>
      </div>
    </div>
  );
}
