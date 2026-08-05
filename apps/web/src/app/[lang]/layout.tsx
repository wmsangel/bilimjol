import type { Metadata } from "next";
import { Nunito, Comfortaa } from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { locales, isLocale } from "@/i18n/config";
import { getDictionary } from "./dictionaries";

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
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      className={`${nunito.variable} ${comfortaa.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('izn.study:theme:v1');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();",
          }}
        />
        {children}
      </body>
    </html>
  );
}
