import Link from "next/link";
import type { Locale } from "@/i18n/config";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { HeaderNav, type NavItem } from "./HeaderNav";
import { AccountMenu } from "./AccountMenu";
import { MobileMenu } from "./MobileMenu";
import { BrandMark } from "./BrandMark";

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
    play: dict.account.play,
    wardrobe: "Гардероб",
    tests: dict.tests.nav,
    report: dict.account.report,
    admin: dict.admin.title,
    logout: dict.auth.logout,
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#e6e1ff] bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6 md:grid md:grid-cols-[1fr_auto_1fr] md:gap-4">
        <div className="flex min-w-0 justify-start">
          <Link
            href={`/${lang}`}
            className="flex min-h-11 min-w-11 items-center gap-2 font-display text-xl font-extrabold tracking-tight"
          >
            <BrandMark size={30} />
            {/* На самых узких экранах (<360px) остаётся только значок, имя — для скринридера. */}
            <span className="max-[359px]:sr-only text-[#191539]">
              Bilim
              <span className="text-[#c9a04f]">jol</span>
            </span>
          </Link>
        </div>

        <HeaderNav
          items={items}
          className="hidden items-center justify-center gap-1 md:flex"
        />

        <div className="flex shrink-0 items-center justify-end gap-2">
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
