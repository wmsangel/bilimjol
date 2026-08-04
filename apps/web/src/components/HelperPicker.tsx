"use client";

import { helpers, type Locale } from "@izn-study/shared";
import type { Helper } from "@izn-study/shared";
import { Face } from "./Face";

export function HelperPicker({
  locale,
  selectedId,
  onSelect,
}: {
  locale: Locale;
  selectedId?: string | null;
  onSelect: (helper: Helper) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:gap-4">
      {helpers.map((helper) => {
        const active = helper.id === selectedId;
        return (
          <button
            key={helper.id}
            onClick={() => onSelect(helper)}
            className={
              "flex flex-col items-center gap-1 rounded-3xl border-2 bg-white p-3 shadow-sm transition hover:-translate-y-1 dark:bg-zinc-900 " +
              (active
                ? "border-indigo-500 ring-2 ring-indigo-300"
                : "border-black/[.06] hover:border-indigo-300 dark:border-white/10")
            }
          >
            <Face helper={helper} mood={active ? "happy" : "idle"} sizePx={60} track={false} />
            <span className="font-display text-sm font-bold">
              {helper.name[locale]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
