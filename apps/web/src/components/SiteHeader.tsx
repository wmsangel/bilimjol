import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { HeaderNav, type NavItem } from "./HeaderNav";

/** Только те поля словаря, что нужны шапке (структурно совместимо с Dictionary). */
interface HeaderDict {
  account: { play: string };
  tests: { nav: string };
  articles: { nav: string };
  subscribe: { nav: string };
  nav: { cabinet: string; signIn: string };
}

/**
 * Единая шапка сайта: логотип слева, меню строго по центру, переключатели справа.
 * Одинакова на всех обычных страницах (игровой экран /play — свой полноэкранный режим).
 */
export function SiteHeader({ lang, dict }: { lang: Locale; dict: HeaderDict }) {
  const items: NavItem[] = [
    { href: `/${lang}/play`, label: dict.account.play },
    { href: `/${lang}/tests`, label: dict.tests.nav },
    { href: `/${lang}/articles`, label: dict.articles.nav },
    { href: `/${lang}/subscribe`, label: dict.subscribe.nav },
    { href: `/${lang}/me`, label: dict.nav.cabinet },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-black/[.06] bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/80">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 justify-start">
          <Link
            href={`/${lang}`}
            className="font-display text-xl font-extrabold tracking-tight"
          >
            Bilim<span className="text-indigo-600 dark:text-indigo-400">jol</span>
          </Link>
        </div>

        <HeaderNav
          items={items}
          className="hidden items-center justify-center gap-1 md:flex"
        />

        <div className="flex items-center justify-end gap-2">
          <ThemeToggle />
          <LanguageSwitcher current={lang} />
          <Link
            href={`/${lang}/login`}
            className="hidden rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-indigo-500/30 transition hover:brightness-110 sm:inline-block"
          >
            {dict.nav.signIn}
          </Link>
        </div>
      </div>

      {/* Мобильная строка меню — прокручиваемая, тоже по центру */}
      <HeaderNav
        items={items}
        className="flex items-center justify-start gap-1 overflow-x-auto px-4 pb-2 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      />
    </header>
  );
}
