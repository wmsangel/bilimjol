import type { ReactNode } from "react";
import { legalDocs, type Locale } from "@izn-study/shared";

const CONTACT = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "wmsangel@gmail.com";

/** Подставляет реальный контактный email вместо токена EMAIL в тексте. */
function withEmail(text: string): ReactNode {
  const parts = text.split("EMAIL");
  if (parts.length === 1) return text;
  const out: ReactNode[] = [];
  parts.forEach((part, i) => {
    if (i > 0) {
      out.push(
        <a
          key={`m${i}`}
          href={`mailto:${CONTACT}`}
          className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
        >
          {CONTACT}
        </a>,
      );
    }
    out.push(part);
  });
  return out;
}

export function DocContent({
  slug,
  locale,
}: {
  slug: "about" | "privacy" | "terms";
  locale: Locale;
}) {
  const doc = legalDocs[slug];
  const date = new Date(doc.updated).toLocaleDateString(
    locale === "ky" ? "ky-KG" : "ru-RU",
    { year: "numeric", month: "long", day: "numeric" },
  );
  const updated = locale === "ky" ? "Жаңыртылды" : "Обновлено";

  return (
    <article>
      <div className="text-4xl">{doc.emoji}</div>
      <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight">
        {doc.title[locale]}
      </h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
        {updated}: {date}
      </p>
      <p className="mt-5 text-lg leading-8 text-zinc-700 dark:text-zinc-300">
        {doc.intro[locale]}
      </p>

      <div className="mt-9 space-y-8">
        {doc.sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-xl font-bold">{s.heading[locale]}</h2>
            {s.body.map((b, j) => (
              <p
                key={j}
                className="mt-3 leading-7 text-zinc-700 dark:text-zinc-300"
              >
                {withEmail(b[locale])}
              </p>
            ))}
          </section>
        ))}
      </div>
    </article>
  );
}
