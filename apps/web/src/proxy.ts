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
  const url = request.nextUrl;
  const host = (request.headers.get("host") ?? url.host).toLowerCase();

  // www → корневой домен, 301, с сохранением пути и query. На Vercel этот
  // редирект делала платформа; на Cloudflare www привязан к тому же воркеру,
  // поэтому канонизацию делаем здесь.
  if (host === "www.bilimjol.com") {
    const dest = url.clone();
    dest.host = "bilimjol.com";
    return NextResponse.redirect(dest, 301);
  }

  const { pathname } = url;

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return;

  const locale = getLocale(request);
  url.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Широкий матчер: редирект www→apex должен ловиться на всех «страничных» путях,
  // поэтому сюда попадают и уже локализованные ru/ky (локаль-редирект ниже сам их
  // пропускает — на воркере лишних расходов нет, в отличие от Edge Requests на
  // Vercel). Исключены внутренние пути Next, API, метадата-иконки, sitemap/robots
  // и файлы с расширением — им middleware не нужно.
  matcher: [
    "/((?!_next|api|icon|apple-icon|opengraph-image|sitemap|robots|.*\\.).*)",
  ],
};
