"use client";

import Link from "next/link";
import type { Locale } from "@izn-study/shared";
import { wardrobeIcon, type WardrobeItem } from "@/lib/characterArt";
import { Confetti } from "./Confetti";

const T = {
  ru: { title: "Новая награда!", sub: "Открыта вещь для героя", wardrobe: "В гардероб", later: "Круто!" },
  ky: { title: "Жаңы сыйлык!", sub: "Каарманга буюм ачылды", wardrobe: "Гардеробко", later: "Сонун!" },
};

/** Церемония награды: конфетти + открытая вещь гардероба. */
export function RewardModal({
  item,
  locale,
  onClose,
}: {
  item: WardrobeItem;
  locale: Locale;
  onClose: () => void;
}) {
  const t = T[locale] ?? T.ru;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <Confetti />
      <div className="relative w-full max-w-sm rounded-[2rem] border border-white/10 bg-white p-8 text-center shadow-2xl dark:bg-zinc-900">
        <p className="text-sm font-bold uppercase tracking-wide text-amber-500">
          🎉 {t.title}
        </p>
        <div className="mx-auto my-5 flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-100 to-yellow-200 shadow-inner dark:from-amber-500/15 dark:to-yellow-500/10">
          <div
            className="h-24 w-24 [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: wardrobeIcon(item.id) }}
          />
        </div>
        <h3 className="font-display text-2xl font-extrabold">
          {item.name}
        </h3>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">{t.sub}</p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/${locale}/wardrobe`}
            className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3.5 text-lg font-bold text-white shadow-lg shadow-amber-500/30 transition hover:brightness-110 active:scale-[.98]"
          >
            👕 {t.wardrobe}
          </Link>
          <button
            onClick={onClose}
            className="rounded-full border-2 border-black/10 px-6 py-3 font-bold transition hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/5"
          >
            {t.later}
          </button>
        </div>
      </div>
    </div>
  );
}
