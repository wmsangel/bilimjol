import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { Settings } from "@/components/Settings";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight text-[#191539]">
        {lang === "ky" ? "Жөндөөлөр" : "Настройки"}
      </h1>
      <Settings
        locale={lang}
        loginHref={`/${lang}/login`}
        playHref={`/${lang}/play`}
        subscribeHref={`/${lang}/subscribe`}
      />
    </>
  );
}
