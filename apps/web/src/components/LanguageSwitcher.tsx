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
    <div className="flex items-center gap-1 rounded-full border border-black/10 p-0.5 text-sm dark:border-white/15">
      {locales.map((locale) => {
        const active = locale === current;
        return (
          <Link
            key={locale}
            href={hrefFor(locale)}
            aria-current={active ? "true" : undefined}
            className={
              active
                ? "flex min-h-11 min-w-11 items-center justify-center rounded-full bg-foreground px-3 py-1 font-medium text-background md:min-h-0 md:min-w-0"
                : "flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 py-1 text-zinc-600 md:min-h-0 md:min-w-0 hover:text-foreground dark:text-zinc-400"
            }
          >
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
