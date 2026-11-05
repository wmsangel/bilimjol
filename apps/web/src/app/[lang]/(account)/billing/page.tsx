import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { Billing } from "@/components/Billing";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <>
      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight text-[#191539]">
        {lang === "ky" ? "Жазылуу" : "Подписка"}
      </h1>
      <Billing
        locale={lang}
        subscribeHref={`/${lang}/subscribe`}
        loginHref={`/${lang}/login`}
      />
    </>
  );
}
