import type { Metadata } from "next";
import { Nunito, Comfortaa } from "next/font/google";
import { notFound } from "next/navigation";
import Script from "next/script";
import "../globals.css";
import { locales, isLocale } from "@/i18n/config";
import { getDictionary } from "./dictionaries";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { JsonLd } from "@/components/JsonLd";
import { PwaSetup } from "@/components/PwaSetup";

// Google Analytics (gtag). ID можно переопределить через NEXT_PUBLIC_GA_ID.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "G-DMSQV35M09";
// Яндекс.Метрика. ID можно переопределить через NEXT_PUBLIC_YM_ID.
const YM_ID = process.env.NEXT_PUBLIC_YM_ID ?? "111711927";
// Google Tag Manager. Через него можно навешивать теги (в т.ч. Meta Pixel) без правок кода.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "GTM-5CBV3H4D";
// Meta Pixel (Facebook). Пусто = не грузится. Можно ставить и тегом внутри GTM.
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bilimjol.com";

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
    metadataBase: new URL(SITE),
    title: dict.meta.title,
    description: dict.meta.description,
    openGraph: {
      title: dict.meta.title,
      description: dict.meta.description,
      siteName: "Bilimjol",
      url: `${SITE}/${lang}`,
      locale: lang === "ky" ? "ky_KG" : "ru_RU",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.title,
      description: dict.meta.description,
    },
    verification: {
      google: "1_chDy09cV4--r2aq31gDHSLHTx5nEOc1yntu3lKXJo",
      yandex: "081d5db07ae6a1f2",
      other: { "msvalidate.01": "DD23F30879931F23A549B3235E3DB4AB" },
    },
    appleWebApp: {
      capable: true,
      title: "Bilimjol",
      statusBarStyle: "default",
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang}
      className={`${nunito.variable} ${comfortaa.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {/* Аналитика: грузится ТОЛЬКО на боевом хосте (зеркала *.vercel.app и
            локалка — без неё), с Consent Mode по регионам. В EEA/UK/CH GA4 без
            cookies (analytics_storage=denied), Яндекс.Метрика там не грузится.
            Рекламные сигналы (ad_*) выключены везде — рекламы на сайте нет. */}
        <Script id="analytics-init" strategy="afterInteractive">
          {`(function(){
  var host=location.hostname;
  if(host!=='bilimjol.com'&&host!=='www.bilimjol.com')return;

  // EEA/UK/CH — часовые пояса для гейта Метрики (серверного CF-заголовка нет: сайт идёт мимо прокси)
  var eeaTz=['Europe/Vienna','Europe/Brussels','Europe/Sofia','Europe/Zagreb','Europe/Prague','Europe/Copenhagen','Europe/Tallinn','Europe/Helsinki','Europe/Mariehamn','Europe/Paris','Europe/Berlin','Europe/Busingen','Europe/Athens','Europe/Budapest','Europe/Dublin','Europe/Rome','Europe/Riga','Europe/Vilnius','Europe/Luxembourg','Europe/Malta','Europe/Amsterdam','Europe/Warsaw','Europe/Lisbon','Europe/Bucharest','Europe/Bratislava','Europe/Ljubljana','Europe/Madrid','Europe/Stockholm','Europe/Oslo','Europe/London','Europe/Zurich','Europe/Vaduz','Europe/Nicosia','Asia/Nicosia','Atlantic/Reykjavik','Atlantic/Azores','Atlantic/Madeira','Atlantic/Canary','Africa/Ceuta','Europe/Gibraltar','Europe/Guernsey','Europe/Jersey','Europe/Isle_of_Man'];
  var tz='';try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||'';}catch(e){}
  var inEea=eeaTz.indexOf(tz)!==-1;

  window.dataLayer=window.dataLayer||[];
  function gtag(){dataLayer.push(arguments);}
  window.gtag=gtag;
  gtag('js',new Date());

  // Consent Mode v2 (до загрузки тегов). Google определяет регион сам по IP.
  gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'granted'});
  gtag('consent','default',{region:['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU','IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES','SE','IS','LI','NO','GB','CH'],ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});

  // GA4 (gtag) — для событий (grade_open/subject_open и т. п.). page_view
  // отправляет GTM, поэтому здесь send_page_view:false — без двойного подсчёта.
  var g=document.createElement('script');g.async=true;g.src='https://www.googletagmanager.com/gtag/js?id=${GA_ID}';document.head.appendChild(g);
  gtag('config','${GA_ID}',{send_page_view:false});

  // Google Tag Manager
  (function(w,d,s,l,i){w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');

  // Яндекс.Метрика — не грузим в EEA/UK/CH (баннера согласия нет)
  if(!inEea){
    (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<e.scripts.length;j++){if(e.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js?id=${YM_ID}','ym');
    ym(${YM_ID},'init',{ssr:true,webvisor:false,clickmap:true,ecommerce:"dataLayer",accurateTrackBounce:true,trackLinks:true});
  }
}());`}
        </Script>
        {META_PIXEL_ID ? (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
          </Script>
        ) : null}
        {/* Google Tag Manager (noscript) — сразу после <body> */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
            title="gtm"
          />
        </noscript>
        {META_PIXEL_ID ? (
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        ) : null}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "EducationalOrganization",
                "@id": `${SITE}/#org`,
                name: "Bilimjol",
                url: SITE,
                logo: `${SITE}/icon`,
                description: dict.meta.description,
                inLanguage: ["ru", "ky"],
                areaServed: "KG",
              },
              {
                "@type": "WebSite",
                "@id": `${SITE}/#website`,
                name: "Bilimjol",
                url: `${SITE}/${lang}`,
                inLanguage: lang === "ky" ? "ky-KG" : "ru-RU",
                publisher: { "@id": `${SITE}/#org` },
              },
            ],
          }}
        />
        {children}
        <PwaSetup
          installLabel={dict.pwa.install}
          laterLabel={dict.pwa.later}
        />
        <MobileBottomNav
          lang={lang}
          labels={{
            play: dict.account.play,
            games: dict.games.nav,
            tests: dict.tests.nav,
            cabinet: dict.nav.cabinet,
          }}
        />
        {/* Яндекс.Метрика (noscript) */}
        <noscript>
          <div>
            <img
              src={`https://mc.yandex.ru/watch/${YM_ID}`}
              style={{ position: "absolute", left: "-9999px" }}
              alt=""
            />
          </div>
        </noscript>
        {/* Cloudflare Web Analytics — маячок без кук и без согласия; сайт идёт мимо прокси, поэтому вставляется руками */}
        <Script
          id="cf-beacon"
          strategy="afterInteractive"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={'{"token": "b7369430f6c04d69a5910f34ac6e2395"}'}
        />
      </body>
    </html>
  );
}
