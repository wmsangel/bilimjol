"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { loadAuth, logout as apiLogout } from "@/lib/api";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

export function SideNav({
  items,
  account,
}: {
  items: NavItem[];
  account: {
    loginHref: string;
    loggedInAs: string;
    logout: string;
    login: string;
  };
}) {
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const auth = loadAuth();
    setEmail(auth?.user.email ?? null);
    setIsAdmin(auth?.user.role === "admin");
  }, []);

  const visible = items.filter((it) => !it.adminOnly || isAdmin);

  async function onLogout() {
    await apiLogout();
    setEmail(null);
    window.location.href = account.loginHref;
  }

  return (
    <div className="md:sticky md:top-6">
      <nav className="flex flex-wrap gap-1.5 md:flex-col md:flex-nowrap">
        {visible.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex items-center gap-2 whitespace-nowrap rounded-2xl px-3.5 py-2.5 text-sm font-bold transition md:px-4 " +
                (active
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/30"
                  : "text-zinc-600 hover:bg-black/[.04] dark:text-zinc-300 dark:hover:bg-white/5")
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Аккаунт (только на десктопе) */}
      <div className="mt-6 hidden border-t border-black/[.06] pt-4 md:block dark:border-white/10">
        {email ? (
          <>
            <p className="px-2 text-xs text-zinc-500 dark:text-zinc-400">
              {account.loggedInAs}
            </p>
            <p className="mb-2 truncate px-2 text-sm font-semibold">{email}</p>
            <button
              onClick={onLogout}
              className="px-2 text-sm font-semibold text-zinc-500 hover:text-foreground dark:text-zinc-400"
            >
              {account.logout}
            </button>
          </>
        ) : (
          <Link
            href={account.loginHref}
            className="px-2 text-sm font-bold text-indigo-600 hover:underline dark:text-indigo-400"
          >
            {account.login}
          </Link>
        )}
      </div>
    </div>
  );
}
