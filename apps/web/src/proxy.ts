import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/i18n/config";

// Выбираем локаль по заголовку Accept-Language, с откатом на дефолтную.
function getLocale(request: NextRequest): string {
  const header = request.headers.get("accept-language");
  if (header) {
    const preferred = header
      .split(",")
      .map((part) => part.split(";")[0].trim().toLowerCase().split("-")[0]);
    const match = preferred.find((lang) =>
      (locales as readonly string[]).includes(lang),
    );
    if (match) return match;
  }
  return defaultLocale;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Пропускаем внутренние пути Next, API, метадата-иконки, файлы с расширением
  // И уже-локализованные пути (ru/ky) — им редирект не нужен, middleware не
  // вызывается (экономия Edge Requests). Срабатывает лишь на корне «/» и путях
  // без локали, где нужен редирект. При добавлении локали — обновить список ниже.
  matcher: [
    "/((?!_next|api|icon|apple-icon|opengraph-image|sitemap|robots|ru(?:/|$)|ky(?:/|$)|.*\\.).*)",
  ],
};
