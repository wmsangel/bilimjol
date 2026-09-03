"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface BottomNavLabels {
  play: string;
  games: string;
  tests: string;
  cabinet: string;
}

/**
 * Нижняя панель-навигация для мобильных: постоянные вкладки, всегда видно
 * куда идти. Скрыта на десктопе (там шапка) и на игровом экране /play
 * (погружение + свои плавающие кнопки).
 */
export function MobileBottomNav({
  lang,
  labels,
}: {
  lang: string;
  labels: BottomNavLabels;
}) {
  const pathname = usePathname();

  if (pathname === `/${lang}/play` || pathname.startsWith(`/${lang}/play/`)) {
    return null;
  }

  const tabs = [
    { href: `/${lang}/play`, label: labels.play, icon: "🎮" },
    { href: `/${lang}/games`, label: labels.games, icon: "🧩" },
    { href: `/${lang}/tests`, label: labels.tests, icon: "🎯" },
    { href: `/${lang}/me`, label: labels.cabinet, icon: "👤" },
  ];
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      {/* Спейсер, чтобы контент не прятался под фиксированной панелью */}
      <div className="h-16 md:hidden" aria-hidden />
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[.08] bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden dark:border-white/10 dark:bg-zinc-950/95">
        <div className="mx-auto flex max-w-md items-stretch justify-around">
          {tabs.map((t) => {
            const active = isActive(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-semibold transition " +
                  (active
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-zinc-500 dark:text-zinc-400")
                }
              >
                <span className="text-xl leading-none">{t.icon}</span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
