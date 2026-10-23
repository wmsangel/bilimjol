import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { SiteHeader } from "@/components/SiteHeader";
import { SetPasswordForm } from "@/components/SetPasswordForm";
import { getDictionary } from "../dictionaries";

// Страница по ссылке из письма — не индексируется (токен-гейт).
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function SetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const { token } = await searchParams;

  return (
    <div className="flex flex-1 flex-col bg-[#f7f5ff] font-sans text-[#191539]">
      <SiteHeader lang={lang} dict={dict} />
      <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-6 py-14">
        <SetPasswordForm token={token ?? null} lang={lang} />
      </main>
    </div>
  );
}
