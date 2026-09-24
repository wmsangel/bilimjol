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
      <div className="h-72 w-full animate-pulse rounded-[28px] bg-white shadow-[0_16px_40px_rgba(25,21,57,.08)]" />
    );
  }

  return (
    <div className="grid gap-6 font-sans text-[#191539] lg:grid-cols-[300px_1fr] lg:items-start">
      {/* Превью персонажа */}
      <div className="lg:sticky lg:top-6">
        <div className="flex flex-col items-center rounded-[28px] bg-gradient-to-b from-[#efecff] to-white p-7 shadow-[0_16px_40px_rgba(25,21,57,.08)]">
          <div className="flex h-[220px] w-[220px] items-center justify-center rounded-full bg-white/60 shadow-[inset_0_0_0_1px_rgba(25,21,57,.05)]">
            <Character charId={charId} outfit={outfit} sizePx={190} />
          </div>
          <div className="mt-3 font-display text-2xl font-bold">
            {characterName(charId)}
          </div>
          <div className="mt-2 rounded-full bg-[#e6c079] px-4 py-1 text-sm font-extrabold text-[#191539]">
            ⭐ {stars}
          </div>
          <button
            onClick={() => {
              removeHelperId();
              window.location.href = changeHelperHref;
            }}
            className="mt-4 text-sm font-extrabold text-[#6d5cf7] transition hover:underline"
          >
            {t("Сменить героя", "Каарманды алмаштыруу")}
          </button>
        </div>
      </div>

      {/* Гардероб по слотам */}
      <div>
        {/* Готовые наборы */}
        <div className="mb-6">
          <h3 className="mb-3 text-[13px] font-extrabold uppercase tracking-[1.3px] text-[#5c5880]">
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
                    "relative flex items-center gap-3 rounded-2xl border-2 bg-white p-3 text-left shadow-[0_6px_18px_rgba(25,21,57,.05)] transition " +
                    (active
                      ? "border-[#6d5cf7]"
                      : locked
                        ? "cursor-not-allowed border-transparent"
                        : "border-transparent hover:-translate-y-1 hover:border-[#b9b3e6]")
                  }
                >
                  <span className={"text-3xl " + (locked ? "opacity-40 grayscale" : "")}>
                    {set.emoji}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={
                        "block truncate text-sm font-bold " +
                        (locked ? "text-[#8f8aa8]" : "text-[#191539]")
                      }
                    >
                      {set.name[locale]}
                    </span>
                    <span
                      className={
                        "text-xs font-extrabold " +
                        (locked ? "text-[#9a7430]" : "text-[#5c5880]")
                      }
                    >
                      {locked
                        ? `${set.unlockAt} ⭐`
                        : active
                          ? t("Надет", "Кийилген")
                          : t("Надеть набор", "Топтомду кий")}
                    </span>
                  </span>
                  {active && (
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#6d5cf7] text-xs font-bold text-white shadow">
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
              <h3 className="mb-3 text-[13px] font-extrabold uppercase tracking-[1.3px] text-[#5c5880]">
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
                        "relative flex flex-col items-center gap-1 rounded-2xl border-2 bg-white p-3 shadow-[0_6px_18px_rgba(25,21,57,.05)] transition " +
                        (equipped
                          ? "border-[#34d399]"
                          : locked
                            ? "cursor-not-allowed border-transparent"
                            : "border-transparent hover:-translate-y-1 hover:border-[#b9b3e6]")
                      }
                    >
                      <span
                        className={"block h-10 w-11 " + (locked ? "opacity-30 grayscale" : "")}
                        dangerouslySetInnerHTML={{ __html: wardrobeIcon(it.id) }}
                      />
                      <span
                        className={
                          "truncate text-xs font-bold " +
                          (locked ? "text-[#8f8aa8]" : "text-[#191539]")
                        }
                      >
                        {it.name}
                      </span>
                      {equipped && (
                        <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#10b981] text-xs font-bold text-white shadow">
                          ✓
                        </span>
                      )}
                      {locked && (
                        <span className="absolute right-1.5 top-1.5 rounded-full bg-[#fbf3e3] px-1.5 text-[10px] font-extrabold text-[#7a5a1e]">
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
        <p className="text-sm text-[#5c5880]">
          {t(
            "Решай задания и получай звёзды — за них открываются новые вещи.",
            "Тапшырмаларды чечип, жылдыз жыйна — алар үчүн жаңы буюмдар ачылат.",
          )}
        </p>
      </div>
    </div>
  );
}
