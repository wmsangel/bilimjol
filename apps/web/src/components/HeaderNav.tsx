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
              "whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-bold transition " +
              (active
                ? "bg-[#efecff] text-[#6d5cf7]"
                : "text-[#5c5880] hover:bg-[#f7f5ff] hover:text-[#191539]")
            }
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
