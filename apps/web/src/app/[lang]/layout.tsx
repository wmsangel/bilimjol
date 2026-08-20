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
// Яндекс.Метрика. ID можно переопределить через NEXT_PUBLIC_YM_ID.
const YM_ID = process.env.NEXT_PUBLIC_YM_ID ?? "111711927";

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
    metadataBase: new URL(
      process.env.NEXT_PUBLIC_SITE_URL ?? "https://bilimjol.com",
    ),
    title: dict.meta.title,
    description: dict.meta.description,
    verification: {
      google: "1_chDy09cV4--r2aq31gDHSLHTx5nEOc1yntu3lKXJo",
      yandex: "081d5db07ae6a1f2",
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
        {/* Яндекс.Метрика */}
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<e.scripts.length;j++){if(e.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}','ym');ym(${YM_ID},'init',{ssr:true,webvisor:true,clickmap:true,ecommerce:"dataLayer",accurateTrackBounce:true,trackLinks:true});`}
        </Script>
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${YM_ID}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
      </body>
    </html>
  );
}
