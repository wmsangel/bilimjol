import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "../dictionaries";
import { SideNav } from "@/components/SideNav";
import { SiteHeader } from "@/components/SiteHeader";

// Личный кабинет/отчёт/гардероб — не индексировать.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  const items = [
    { href: `/${lang}/me`, label: dict.account.progress, icon: "📊" },
    { href: `/${lang}/play`, label: dict.account.play, icon: "🎮" },
    { href: `/${lang}/wardrobe`, label: lang === "ky" ? "Гардероб" : "Гардероб", icon: "👕" },
    { href: `/${lang}/tests`, label: dict.tests.nav, icon: "🎯" },
    { href: `/${lang}/parent`, label: dict.account.report, icon: "👨‍👩‍👧" },
  ];

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <SiteHeader lang={lang} dict={dict} />

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-12 pt-6 md:flex-row">
        <aside className="md:w-56 md:flex-shrink-0">
          <SideNav
            items={items}
            account={{
              loginHref: `/${lang}/login`,
              loggedInAs: dict.auth.loggedInAs,
              logout: dict.auth.logout,
              login: dict.auth.login,
            }}
          />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
