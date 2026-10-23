#!/usr/bin/env node
// Подача URL в IndexNow (Bing, Yandex, Seznam и др. — Google НЕ участвует).
// Мгновенное уведомление о новых/изменённых страницах, без суточной квоты GSC.
// Для сети Bing — основной поисковый источник, поэтому это главный рычаг индексации.
//
// Ключ размещён в apps/web/public/<KEY>.txt и отдаётся в корне сайта:
//   https://bilimjol.com/<KEY>.txt
//
// Использование:
//   node scripts/indexnow-submit.mjs                 # подать ВСЕ URL из live-sitemap
//   node scripts/indexnow-submit.mjs <url> [url...]  # подать только указанные URL
//   node scripts/indexnow-submit.mjs --dry           # показать, что подалось бы, без отправки
//
// Ключ/хост можно переопределить через env: INDEXNOW_KEY, INDEXNOW_HOST, SITE_URL.

const HOST = process.env.INDEXNOW_HOST ?? "bilimjol.com";
const SITE = (process.env.SITE_URL ?? `https://${HOST}`).replace(/\/$/, "");
const KEY = process.env.INDEXNOW_KEY ?? "bf3e25a5493d93a152d3f9beb4aa39be";
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";
const MAX_PER_REQUEST = 10000;

const args = process.argv.slice(2);
const dry = args.includes("--dry");
const explicit = args.filter((a) => a.startsWith("http"));

async function urlsFromSitemap() {
  const res = await fetch(`${SITE}/sitemap.xml`, {
    headers: { "user-agent": "indexnow-submit/1.0" },
  });
  if (!res.ok) throw new Error(`sitemap fetch failed: HTTP ${res.status}`);
  const xml = await res.text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  // Только наши URL, без дублей.
  return [...new Set(locs.filter((u) => u.startsWith(SITE)))];
}

async function submit(urlList) {
  if (dry) {
    console.log(`[dry] подали бы ${urlList.length} URL в IndexNow (${HOST}):`);
    for (const u of urlList) console.log("  " + u);
    return;
  }
  for (let i = 0; i < urlList.length; i += MAX_PER_REQUEST) {
    const chunk = urlList.slice(i, i + MAX_PER_REQUEST);
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList: chunk }),
    });
    // IndexNow: 200 OK принято; 202 принято, проверка ключа отложена.
    const body = await res.text();
    console.log(`IndexNow ← HTTP ${res.status} ${res.statusText} (${chunk.length} URL)${body ? " · " + body.slice(0, 200) : ""}`);
    if (res.status !== 200 && res.status !== 202) {
      process.exitCode = 1;
    }
  }
}

const urlList = explicit.length ? explicit : await urlsFromSitemap();
if (!urlList.length) {
  console.error("Нет URL для подачи.");
  process.exit(1);
}
await submit(urlList);
