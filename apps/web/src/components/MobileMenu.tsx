"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isLoggedIn, loadAuth, logout } from "@/lib/api";
import type { NavItem } from "./HeaderNav";

export interface MobileMenuLabels {
  signIn: string;
  cabinet: string;
  progress: string;
  play: string;
  wardrobe: string;
  tests: string;
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
        className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e6e1ff] text-[#191539] transition hover:bg-[#f7f5ff]"
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
        <div className="absolute inset-x-0 top-full z-50 border-b border-[#e6e1ff] bg-white p-3 shadow-[0_20px_50px_rgba(25,21,57,.12)]">
          <nav className="flex flex-col gap-1">
            {items.map((it) => (
              <Link
                key={it.href}
                href={it.href}
                aria-current={isActive(it.href) ? "page" : undefined}
                className={
                  rowBase +
                  (isActive(it.href)
                    ? " bg-[#efecff] text-[#6d5cf7]"
                    : " text-[#191539] hover:bg-[#f7f5ff]")
                }
              >
                {it.label}
              </Link>
            ))}
          </nav>

          <div className="my-2 h-px bg-[#efecff]" />

          {logged ? (
            <div className="flex flex-col gap-1">
              {email && (
                <div className="truncate px-3 pb-1 text-xs text-[#5c5880]">
                  {email}
                </div>
              )}
              <Link
                href={`/${lang}/me`}
                className={rowBase + " text-[#191539] hover:bg-[#f7f5ff]"}
              >
                📊 {labels.progress}
              </Link>
              <Link
                href={`/${lang}/wardrobe`}
                className={rowBase + " text-[#191539] hover:bg-[#f7f5ff]"}
              >
                👕 {labels.wardrobe}
              </Link>
              <Link
                href={`/${lang}/parent`}
                className={rowBase + " text-[#191539] hover:bg-[#f7f5ff]"}
              >
                👨‍👩‍👧 {labels.report}
              </Link>
              {isAdmin && (
                <Link
                  href={`/${lang}/admin`}
                  className={rowBase + " text-[#191539] hover:bg-[#f7f5ff]"}
                >
                  🛠️ {labels.admin}
                </Link>
              )}
              <button
                onClick={onLogout}
                className={rowBase + " text-[#b42318] hover:bg-[#fef2f2]"}
              >
                🚪 {labels.logout}
              </button>
            </div>
          ) : (
            <Link
              href={`/${lang}/login`}
              className="flex items-center justify-center rounded-full bg-[#6d5cf7] px-4 py-3 text-base font-extrabold text-white shadow-[0_8px_20px_rgba(109,92,247,.3)]"
            >
              {labels.signIn}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
