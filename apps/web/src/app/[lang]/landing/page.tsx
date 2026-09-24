import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { Landing } from "@/components/Landing";
import { localizedAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const ky = lang === "ky";
  return {
    title: ky
      ? "Bilimjol — балдар үчүн өнүктүрүүчү тапшырмалар (0–11 класс)"
      : "Bilimjol — развивающие задания для детей 0–11 классов",
    description: ky
      ? "Логика, эсеп, окуу жана айлана-чөйрө балдар үчүн — кыска, оюн менен, орусча жана кыргызча. Акысыз баштаңыз."
      : "Логика, счёт, чтение и окружающий мир для детей от подготовки к школе до 11 класса — коротко, в игре, на русском и кыргызском. Начните бесплатно.",
    alternates: localizedAlternates(lang, "/landing"),
  };
}

export default async function LandingRoute({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <div className="flex flex-1 flex-col">
      <Landing lang={lang} />
    </div>
  );
}
