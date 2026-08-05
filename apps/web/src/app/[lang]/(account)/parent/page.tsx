import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "../../dictionaries";
import { ParentReport } from "@/components/ParentReport";

export default async function ParentPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <>
      <h1 className="mb-6 font-display text-3xl font-extrabold tracking-tight">
        {dict.parent.title}
      </h1>
      <ParentReport
        locale={lang}
        labels={dict.parent}
        loginHref={`/${lang}/login`}
      />
    </>
  );
}
