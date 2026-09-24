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
      <div className="relative w-full max-w-sm rounded-[32px] bg-white p-8 text-center font-sans text-[#191539] shadow-[0_0_0_4px_#e6c079,0_30px_60px_rgba(0,0,0,.3)]">
        <p className="text-sm font-extrabold uppercase tracking-[1.4px] text-[#b08a3e]">
          🎉 {t.title}
        </p>
        <div className="mx-auto my-5 flex h-32 w-32 items-center justify-center rounded-3xl bg-[#fbf3e3]">
          <div
            className="h-24 w-24 [&>svg]:h-full [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: wardrobeIcon(item.id) }}
          />
        </div>
        <h3 className="font-display text-2xl font-bold">
          {item.name}
        </h3>
        <p className="mt-1 text-[#5c5880]">{t.sub}</p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href={`/${locale}/wardrobe`}
            className="rounded-full bg-[#e6c079] px-6 py-3.5 text-lg font-extrabold text-[#191539] transition hover:-translate-y-0.5 active:scale-[.98]"
          >
            👕 {t.wardrobe}
          </Link>
          <button
            onClick={onClose}
            className="rounded-full border-2 border-black/10 px-6 py-3 font-bold transition hover:bg-black/[.04]"
          >
            {t.later}
          </button>
        </div>
      </div>
    </div>
  );
}
