import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "../../dictionaries";
import { Cabinet } from "@/components/Cabinet";

export default async function MePage({
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
        {dict.cabinet.title}
      </h1>
      <Cabinet
        locale={lang}
        labels={dict.cabinet}
        achievementsLabels={dict.achievements}
        accountLabels={dict.auth}
        loginHref={`/${lang}/login`}
        parentHref={`/${lang}/parent`}
        playHref={`/${lang}/play`}
      />
    </>
  );
}
