import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "../dictionaries";
import { SiteHeader } from "@/components/SiteHeader";
import { AccountForm } from "@/components/AccountForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-indigo-50 via-white to-amber-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto flex w-full max-w-5xl flex-1 items-start justify-center px-6 py-10">
        <AccountForm
          locale={lang}
          labels={dict.auth}
          meHref={`/${lang}/me`}
        />
      </main>
    </div>
  );
}
