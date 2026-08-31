import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { legalDocs } from "@izn-study/shared";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "../dictionaries";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { DocContent } from "@/components/DocContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const doc = legalDocs.terms;
  return { title: `${doc.title[lang]} — Bilimjol`, description: doc.intro[lang] };
}

export default async function TermsPage({
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
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
        <DocContent slug="terms" locale={lang} />
      </main>
      <SiteFooter lang={lang} />
    </div>
  );
}
