import type { Metadata } from "next";
import { Nunito, Comfortaa } from "next/font/google";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import Script from "next/script";
import "../globals.css";
import { locales, isLocale } from "@/i18n/config";
import { getDictionary } from "./dictionaries";

// Google Analytics (gtag). ID можно переопределить через NEXT_PUBLIC_GA_ID.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-DMSQV35M09";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin", "cyrillic"],
});

const comfortaa = Comfortaa({
  variable: "--font-comfortaa",
  subsets: ["latin", "cyrillic"],
});

// Заранее генерируем страницы для всех локалей (статический рендер).
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    verification: {
      google: "1_chDy09cV4--r2aq31gDHSLHTx5nEOc1yntu3lKXJo",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  // Тема из cookie — сервер сразу ставит класс, без inline-скрипта и без мигания.
  const dark = (await cookies()).get("izn-theme")?.value === "dark";

  return (
    <html
      lang={lang}
      className={`${nunito.variable} ${comfortaa.variable} h-full antialiased${dark ? " dark" : ""}`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
