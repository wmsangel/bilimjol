import Link from "next/link";
import { tests, type Locale } from "@izn-study/shared";
import { SiteFooter } from "./SiteFooter";

// Низ страницы теста: сиблинг-ссылки на другие тесты-тренажёры (уплотняет
// внутренний граф, помогает discovery KY-тестов) + общий футер.
export function TestOutro({
  lang,
  currentId,
}: {
  lang: Locale;
  currentId: string;
}) {
  const others = tests.filter((t) => t.id !== currentId);
  const title = lang === "ky" ? "Башка тесттер" : "Другие тесты";

  return (
    <>
      <section className="mx-auto w-full max-w-4xl px-6 pb-12">
        <h2 className="mb-4 font-display text-xl font-bold text-[#191539]">{title}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {others.map((t) => (
            <Link
              key={t.id}
              href={`/${lang}/tests/${t.id}`}
              className="flex items-center gap-2.5 rounded-2xl bg-white p-3 shadow-[0_6px_18px_rgba(25,21,57,.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(25,21,57,.1)]"
            >
              <span className="flex-none text-2xl">{t.icon}</span>
              <span className="min-w-0 truncate text-sm font-bold text-[#191539]">
                {t.title[lang]}
              </span>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter lang={lang} />
    </>
  );
}
