"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isLoggedIn, loadAuth, logout } from "@/lib/api";
import type { NavItem } from "./HeaderNav";

export interface MobileMenuLabels {
  signIn: string;
  progress: string;
  report: string;
  admin: string;
  logout: string;
  menu: string;
}

/** Гамбургер-меню для мобильных: все разделы + вход/выход в одной панели. */
export function MobileMenu({
  lang,
  items,
  labels,
}: {
  lang: string;
  items: NavItem[];
  labels: MobileMenuLabels;
}) {
  const [open, setOpen] = useState(false);
  const [logged, setLogged] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setLogged(isLoggedIn());
    const auth = loadAuth();
    setEmail(auth?.user.email ?? null);
    setIsAdmin(auth?.user.role === "admin");
  }, []);

  // Закрываем панель при переходе на другой маршрут.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function onLogout() {
    setOpen(false);
    await logout().catch(() => undefined);
    router.push(`/${lang}`);
    router.refresh();
  }

  const rowBase =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-base font-semibold transition";
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <div ref={ref} className="md:hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={labels.menu}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 transition hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/5"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M5 5 15 15M15 5 5 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M3 6h14M3 10h14M3 14h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full z-50 border-b border-black/[.06] bg-white p-3 shadow-xl dark:border-white/10 dark:bg-zinc-950">
          <nav className="flex flex-col gap-1">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                aria-current={isActive(it.href) ? "page" : undefined}
                className={
                  rowBase +
                  (isActive(it.href)
                    ? " bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                    : " text-zinc-700 hover:bg-black/[.04] dark:text-zinc-200 dark:hover:bg-white/5")
                }
              >
                {it.label}
              </Link>
            ))}
          </nav>

          <div className="my-2 h-px bg-black/[.06] dark:bg-white/10" />

          {logged ? (
            <div className="flex flex-col gap-1">
              {email && (
                <div className="truncate px-3 pb-1 text-xs text-zinc-400">
                  {email}
                </div>
              )}
              <Link
                href={`/${lang}/me`}
                className={rowBase + " text-zinc-700 hover:bg-black/[.04] dark:text-zinc-200 dark:hover:bg-white/5"}
              >
                📊 {labels.progress}
              </Link>
              <Link
                href={`/${lang}/parent`}
                className={rowBase + " text-zinc-700 hover:bg-black/[.04] dark:text-zinc-200 dark:hover:bg-white/5"}
              >
                👨‍👩‍👧 {labels.report}
              </Link>
              {isAdmin && (
                <Link
                  href={`/${lang}/admin`}
                  className={rowBase + " text-zinc-700 hover:bg-black/[.04] dark:text-zinc-200 dark:hover:bg-white/5"}
                >
                  🛠️ {labels.admin}
                </Link>
              )}
              <button
                onClick={onLogout}
                className={rowBase + " text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"}
              >
                🚪 {labels.logout}
              </button>
            </div>
          ) : (
            <Link
              href={`/${lang}/login`}
              className="flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-3 text-base font-bold text-white shadow-md shadow-indigo-500/30"
            >
              {labels.signIn}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
