import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

/** Видимый след и тот же BreadcrumbList JSON-LD. Первый пункт — главная. */
export function Breadcrumbs({
  lang,
  items,
}: {
  lang: "ru" | "ky";
  items: [name: string, pathWithoutLocale: string][];
}) {
  const trail: [string, string][] = [
    [lang === "ky" ? "Башкы бет" : "Главная", ""],
    ...items,
  ];

  return (
    <>
      <JsonLd data={breadcrumbJsonLd(lang, trail)} />
      <nav aria-label="breadcrumb" className="mb-4 mt-1 w-full font-sans text-sm">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {trail.map(([name, path], i) => {
            const current = i === trail.length - 1;
            return (
              <li key={`${path}:${i}`} className="flex items-center gap-x-2">
                {i > 0 && (
                  <span aria-hidden="true" className="text-[#5c5880]">
                    ›
                  </span>
                )}
                {current ? (
                  <span aria-current="page" className="text-[#5c5880]">
                    {name}
                  </span>
                ) : (
                  <Link
                    href={`/${lang}${path}`}
                    className="text-[#6d5cf7] hover:underline"
                  >
                    {name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
