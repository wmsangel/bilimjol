"use client";

import { helpers, type Helper, type Locale } from "@izn-study/shared";
import { helperBg } from "@/lib/helperTheme";

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
              "flex flex-col items-center gap-2 rounded-2xl border p-4 transition " +
              (active
                ? "border-indigo-500 ring-2 ring-indigo-400"
                : "border-black/10 hover:border-indigo-300 dark:border-white/15")
            }
          >
            <span
              className={
                "flex h-16 w-16 items-center justify-center rounded-full text-4xl " +
                helperBg[helper.color]
              }
            >
              {helper.emoji}
            </span>
            <span className="text-sm font-medium">{helper.name[locale]}</span>
          </button>
        );
      })}
    </div>
  );
}
