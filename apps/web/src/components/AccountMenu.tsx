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
        className="hidden rounded-full bg-[#6d5cf7] px-4 py-2 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(109,92,247,.3)] transition hover:-translate-y-0.5 sm:inline-block"
      >
        {labels.signIn}
      </Link>
    );
  }

  const item =
    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-bold transition hover:bg-[#f7f5ff]";

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full bg-[#6d5cf7] py-2 pl-4 pr-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(109,92,247,.3)] transition hover:-translate-y-0.5"
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
          className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-[#e6e1ff] bg-white p-2 shadow-[0_20px_50px_rgba(25,21,57,.12)]"
        >
          {email && (
            <div className="truncate px-3 py-1.5 text-xs text-[#5c5880]">
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
          <div className="my-1.5 h-px bg-[#efecff]" />
          <button
            onClick={onLogout}
            className={item + " text-[#b42318]"}
          >
            🚪 {labels.logout}
          </button>
        </div>
      )}
    </div>
  );
}
