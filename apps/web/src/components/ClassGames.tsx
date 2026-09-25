"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { gamesForGrade } from "@/lib/classGames";
import { getEntitlement, isLoggedIn } from "@/lib/api";

/**
 * Две игры класса на странице класса: первая бесплатная, вторая — премиум.
 * Премиум-плитка для не-подписчика ведёт на /subscribe (с замком), для
 * подписчика — на саму игру. Клиентский, т.к. нужен entitlement.
 */
export function ClassGames({ grade, lang }: { grade: number; lang: "ru" | "ky" }) {
  const [premium, setPremium] = useState(false);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);
  const games = gamesForGrade(grade);

  useEffect(() => {
    if (isLoggedIn()) {
      getEntitlement()
        .then((e) => setPremium(e.premium))
        .catch(() => {});
    }
  }, []);

  return (
    <section className="px-5 pb-4 sm:px-16">
      <div className="mb-4 text-sm font-extrabold uppercase tracking-[1.5px] text-[#c9a04f]">
        {t("Игры для этого класса", "Ушул класс үчүн оюндар")}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {games.map((game, i) => {
          const locked = game.premium && !premium;
          const href = locked
            ? `/${lang}/subscribe`
            : `/${lang}${game.slug}`;
          return (
            <Link
              key={game.id}
              href={href}
              className="relative flex items-center gap-4 rounded-3xl bg-[#191539] p-5 text-white transition hover:brightness-125 sm:p-6"
            >
              <div className="flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-white/10 text-2xl sm:h-14 sm:w-14 sm:text-3xl">
                {locked ? "🔒" : game.icon}
              </div>
              <div className="min-w-0">
                <div className="font-display text-base font-bold leading-tight sm:text-lg">
                  {game.title[lang]}
                </div>
                {game.premium && (
                  <div className="mt-0.5 text-xs font-bold text-[#e6c079]">
                    {locked
                      ? t("⭐ Премиум — открыть", "⭐ Премиум — ачуу")
                      : t("⭐ Премиум", "⭐ Премиум")}
                  </div>
                )}
                {i === 0 && (
                  <div className="mt-0.5 text-xs text-[#b9b3e6]">
                    {t("Бесплатно", "Акысыз")}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
