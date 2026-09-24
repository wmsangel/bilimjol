"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, isLocale, type Locale } from "@/i18n/config";

// Переключатель языка: ведёт на тот же путь, но с другой локалью.
export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname();

  function hrefFor(locale: Locale) {
    const segments = pathname.split("/");
    if (isLocale(segments[1])) {
      segments[1] = locale;
    } else {
      segments.splice(1, 0, locale);
    }
    return segments.join("/") || `/${locale}`;
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-[#e6e1ff] p-0.5 text-sm font-extrabold">
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={hrefFor(locale)}
            aria-current={active ? "true" : undefined}
            className={
              active
                ? "flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[#191539] px-3 py-1 text-white md:min-h-0 md:min-w-0"
                : "flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 py-1 text-[#5c5880] md:min-h-0 md:min-w-0 hover:text-[#191539]"
            }
          >
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
