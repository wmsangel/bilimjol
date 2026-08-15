import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "../dictionaries";
import { SiteHeader } from "@/components/SiteHeader";
import { AdminPanel } from "@/components/AdminPanel";
import { ContentStats } from "@/components/ContentStats";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-zinc-950">
      <SiteHeader lang={lang} dict={dict} />

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="mb-8 text-center font-display text-3xl font-extrabold tracking-tight">
          {dict.admin.title}
        </h1>
        <AdminPanel locale={lang} labels={dict.admin} loginHref={`/${lang}/login`} />
        <ContentStats locale={lang} />
      </main>
    </div>
  );
}
