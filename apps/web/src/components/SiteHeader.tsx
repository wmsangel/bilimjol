import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { HeaderNav, type NavItem } from "./HeaderNav";
import { AccountMenu } from "./AccountMenu";
import { MobileMenu } from "./MobileMenu";

/** Только те поля словаря, что нужны шапке (структурно совместимо с Dictionary). */
interface HeaderDict {
  account: { play: string; progress: string; report: string };
  tests: { nav: string };
  games: { nav: string };
  articles: { nav: string };
  subscribe: { nav: string };
  admin: { title: string };
  nav: { cabinet: string; signIn: string; menu: string };
  auth: { logout: string };
}

/**
 * Единая шапка сайта: логотип слева, меню строго по центру, переключатели справа.
 * Одинакова на всех обычных страницах (игровой экран /play — свой полноэкранный режим).
 */
export function SiteHeader({ lang, dict }: { lang: Locale; dict: HeaderDict }) {
  // Разделы сайта (без «Кабинета» — он живёт в меню аккаунта справа).
  const items: NavItem[] = [
    { href: `/${lang}/play`, label: dict.account.play },
    { href: `/${lang}/games`, label: dict.games.nav },
    { href: `/${lang}/tests`, label: dict.tests.nav },
    { href: `/${lang}/articles`, label: dict.articles.nav },
    { href: `/${lang}/subscribe`, label: dict.subscribe.nav },
  ];

  const accountLabels = {
    signIn: dict.nav.signIn,
    cabinet: dict.nav.cabinet,
    progress: dict.account.progress,
    report: dict.account.report,
    admin: dict.admin.title,
    logout: dict.auth.logout,
  };

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
          <AccountMenu lang={lang} labels={accountLabels} />
          <MobileMenu
            lang={lang}
            items={items}
            labels={{ ...accountLabels, menu: dict.nav.menu }}
          />
        </div>
      </div>
    </header>
  );
}
