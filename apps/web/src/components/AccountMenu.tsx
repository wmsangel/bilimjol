"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isLoggedIn, loadAuth, logout } from "@/lib/api";

export interface AccountMenuLabels {
  signIn: string;
  cabinet: string;
  progress: string;
  play: string;
  wardrobe: string;
  tests: string;
  report: string;
  admin: string;
  logout: string;
}

/**
 * Меню аккаунта в шапке (десктоп): «Войти» гостю, выпадашка с разделами
 * и «Выйти» — авторизованному. На мобиле скрыто (там гамбургер MobileMenu).
 */
export function AccountMenu({
  lang,
  labels,
}: {
  lang: string;
  labels: AccountMenuLabels;
}) {
  const [state, setState] = useState<"loading" | "guest" | "user">("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setState(isLoggedIn() ? "user" : "guest");
    const auth = loadAuth();
    setEmail(auth?.user.email ?? null);
    setIsAdmin(auth?.user.role === "admin");
  }, []);

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

  // До гидратации держим место, чтобы не мигать «Войти» у залогиненного.
  if (state === "loading") {
    return <span className="hidden sm:inline-block sm:w-[92px]" aria-hidden />;
  }

  if (state === "guest") {
    return (
      <Link
        href={`/${lang}/login`}
        className="hidden rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-indigo-500/30 transition hover:brightness-110 sm:inline-block"
      >
        {labels.signIn}
      </Link>
    );
  }

  const item =
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-semibold transition hover:bg-black/[.05] dark:hover:bg-white/10";

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 py-2 pl-4 pr-3 text-sm font-bold text-white shadow-md shadow-indigo-500/30 transition hover:brightness-110"
      >
        {labels.cabinet}
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path
            d="M5 7.5 10 12.5 15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-black/[.08] bg-white p-2 shadow-xl dark:border-white/10 dark:bg-zinc-900"
        >
          {email && (
            <div className="truncate px-3 py-1.5 text-xs text-zinc-400">
              {email}
            </div>
          )}
          <Link href={`/${lang}/me`} className={item} onClick={() => setOpen(false)}>
            📊 {labels.progress}
          </Link>
          <Link href={`/${lang}/play`} className={item} onClick={() => setOpen(false)}>
            🎮 {labels.play}
          </Link>
          <Link href={`/${lang}/wardrobe`} className={item} onClick={() => setOpen(false)}>
            👕 {labels.wardrobe}
          </Link>
          <Link href={`/${lang}/tests`} className={item} onClick={() => setOpen(false)}>
            🎯 {labels.tests}
          </Link>
          <Link
            href={`/${lang}/parent`}
            className={item}
            onClick={() => setOpen(false)}
          >
            👨‍👩‍👧 {labels.report}
          </Link>
          {isAdmin && (
            <Link
              href={`/${lang}/admin`}
              className={item}
              onClick={() => setOpen(false)}
            >
              🛠️ {labels.admin}
            </Link>
          )}
          <div className="my-1.5 h-px bg-black/[.06] dark:bg-white/10" />
          <button
            onClick={onLogout}
            className={item + " text-red-600 dark:text-red-400"}
          >
            🚪 {labels.logout}
          </button>
        </div>
      )}
    </div>
  );
}
