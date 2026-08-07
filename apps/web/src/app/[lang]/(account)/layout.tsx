import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "../dictionaries";
import { SideNav } from "@/components/SideNav";
import { ThemeToggle } from "@/components/ThemeToggle";

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
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href={`/${lang}`} className="font-display text-xl font-extrabold">
          izn<span className="text-indigo-600 dark:text-indigo-400">.study</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href={`/${lang}`}
            className="text-sm font-semibold text-zinc-500 hover:text-foreground dark:text-zinc-400"
          >
            {dict.account.home}
          </Link>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-6 pb-12 md:flex-row">
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
