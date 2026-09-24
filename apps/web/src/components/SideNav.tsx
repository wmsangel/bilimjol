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
                  ? "bg-[#6d5cf7] text-white shadow-[0_8px_20px_rgba(109,92,247,.3)]"
                  : "text-[#5c5880] hover:bg-[#efecff]")
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Аккаунт (только на десктопе) */}
      <div className="mt-6 hidden border-t border-[#e6e1ff] pt-4 md:block">
        {email ? (
          <>
            <p className="px-2 text-xs text-[#5c5880]">
              {account.loggedInAs}
            </p>
            <p className="mb-2 truncate px-2 text-sm font-bold text-[#191539]">{email}</p>
            <button
              onClick={onLogout}
              className="px-2 text-sm font-bold text-[#5c5880] hover:text-[#191539]"
            >
              {account.logout}
            </button>
          </>
        ) : (
          <Link
            href={account.loginHref}
            className="px-2 text-sm font-extrabold text-[#6d5cf7] hover:underline"
          >
            {account.login}
          </Link>
        )}
      </div>
    </div>
  );
}
