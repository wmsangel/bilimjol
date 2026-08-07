import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { Wardrobe } from "@/components/Wardrobe";

export default async function WardrobePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <h1 className="mb-6 font-display text-3xl font-extrabold tracking-tight">
        {lang === "ky" ? "Гардероб" : "Гардероб"}
      </h1>
      <Wardrobe locale={lang} changeHelperHref={`/${lang}/play`} />
    </>
  );
}
