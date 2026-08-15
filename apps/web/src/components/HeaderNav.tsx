"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface NavItem {
  href: string;
  label: string;
}

/** Ссылки меню с подсветкой активного раздела. */
export function HeaderNav({
  items,
  className = "",
}: {
  items: NavItem[];
  className?: string;
}) {
  const pathname = usePathname();
  return (
    <nav className={className}>
      {items.map((it) => {
        const active =
          pathname === it.href || pathname.startsWith(it.href + "/");
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={
              "whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-semibold transition " +
              (active
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                : "text-zinc-600 hover:bg-black/[.04] hover:text-foreground dark:text-zinc-300 dark:hover:bg-white/5")
            }
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
