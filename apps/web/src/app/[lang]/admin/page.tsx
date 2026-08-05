import { notFound } from "next/navigation";
import Link from "next/link";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "../dictionaries";
import { AdminPanel } from "@/components/AdminPanel";

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
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
        <Link href={`/${lang}`} className="font-display text-xl font-extrabold">
          izn<span className="text-indigo-600 dark:text-indigo-400">.study</span>
        </Link>
        <Link
          href={`/${lang}`}
          className="text-sm font-semibold text-zinc-500 hover:text-foreground dark:text-zinc-400"
        >
          {dict.play.backHome}
        </Link>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        <h1 className="mb-8 text-center font-display text-3xl font-extrabold tracking-tight">
          {dict.admin.title}
        </h1>
        <AdminPanel locale={lang} labels={dict.admin} loginHref={`/${lang}/login`} />
      </main>
    </div>
  );
}
