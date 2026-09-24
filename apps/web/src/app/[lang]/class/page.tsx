import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tasks, GRADES, subjectsForGrade } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { localizedAlternates } from "@/lib/seo";
import { pluralRu } from "@/lib/plural";
import { getDictionary } from "../dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const title =
    lang === "ky"
      ? "Класстар боюнча тапшырмалар (0–11) | Bilimjol"
      : "Задания по классам (0–11) | Bilimjol";
  const description =
    lang === "ky"
      ? "Мектепке даярдыктан 11-класска чейин класс боюнча тапшырмаларды тандаңыз: логика, эсеп, окуу, айлана-чөйрө."
      : "Выберите класс — от подготовки к школе до 11: логика, счёт, чтение и окружающий мир. Бесплатные задания онлайн.";
  return { title, description, alternates: localizedAlternates(lang, "/class") };
}

export default async function ClassIndexPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const t = (ru: string, ky: string) => (lang === "ky" ? ky : ru);

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff]">
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
        <h1 className="font-display text-4xl font-extrabold tracking-tight">
          {t("Задания по классам", "Класстар боюнча тапшырмалар")}
        </h1>
        <p className="mt-3 text-lg text-[#5c5880]">
          {t(
            "Выберите класс — от подготовки к школе до 11. Логика, счёт, чтение и окружающий мир, с картинками и озвучкой.",
            "Классты тандаңыз — мектепке даярдыктан 11ге чейин. Логика, эсеп, окуу жана айлана-чөйрө, сүрөт жана үн менен.",
          )}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GRADES.map((g) => {
            const name = dict.grades[String(g) as keyof typeof dict.grades];
            const subjectCount = subjectsForGrade(g).length;
            const taskCount = tasks.filter((task) => task.grade === g).length;
            return (
              <Link
                key={g}
                href={`/${lang}/class/${g}`}
                className="flex items-center gap-4 rounded-3xl border border-black/[.06] bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#efecff] text-2xl">
                  {g === 0 ? "🎒" : g}
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-lg font-bold">
                    {name}
                  </span>
                  <span className="mt-0.5 block text-sm text-[#5c5880]">
                    {t(
                      `${subjectCount} ${pluralRu(subjectCount, "предмет", "предмета", "предметов")} · ${taskCount} ${pluralRu(taskCount, "задание", "задания", "заданий")}`,
                      `${subjectCount} предмет · ${taskCount} тапшырма`,
                    )}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
