/**
 * Ролики серии «Знакомство с Bilimjol» (social/INTRO-SERIES.md) — 1080×1920 MP4.
 *
 * Визуал — РЕАЛЬНЫЙ экран прода: длинный мобильный скриншот (390px, ×2), снятый
 * headless-браузером, плавно прокручивается в «телефоне», сверху меняются подписи.
 * Заставка и финал рисуются satori (бренд, кириллица без системных шрифтов).
 * Беззвучная аудиодорожка добавляется, потому что часть площадок не принимает видео
 * совсем без звука. Без ПДн: снимаются только публичные страницы без входа.
 *
 *   node scripts/intro-reels.mjs                    все ролики, обе локали → out/intro/
 *   node scripts/intro-reels.mjs intro-about        один по id
 *   node scripts/intro-reels.mjs --lang ru
 *   node scripts/intro-reels.mjs --shots <папка>    готовые скриншоты (иначе снимаем сами)
 */
import { readFileSync, mkdirSync, rmSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = (...a) => join(ROOT, ...a);
const OUT = p("out", "intro");
const TMP = p("out", "intro", "_work");

const INK = "#191539", MUTED = "#5c5880", VIOLET = "#6d5cf7", GOLD = "#e6c079";
const VIOLET_BG = "linear-gradient(160deg, #7a6bff 0%, #6d5cf7 45%, #5a49de 100%)";
const LAV_BG = "radial-gradient(120% 90% at 80% 0%, #efe9ff 0%, #f6f3ff 55%, #efeaff 100%)";

const FONT = (f) => readFileSync(p("fonts", f));
const fonts = [
  { name: "Comfortaa", data: FONT("Comfortaa-700.ttf"), weight: 700, style: "normal" },
  { name: "Nunito", data: FONT("Nunito-700.ttf"), weight: 700, style: "normal" },
  { name: "Nunito", data: FONT("Nunito-800.ttf"), weight: 800, style: "normal" },
];
const el = (type, style, children) => ({ type, props: { style: { display: "flex", ...style }, children } });
const col = (style, children) => el("div", { display: "flex", flexDirection: "column", ...style }, children);
const row = (style, children) => el("div", { display: "flex", ...style }, children);
const txt = (style, s) => el("div", { display: "flex", ...style }, s);
const C = "Comfortaa", N = "Nunito";
const wordmark = (size, onDark) =>
  row({ fontFamily: C, fontWeight: 700, fontSize: size }, [
    txt({ color: onDark ? "#ffffff" : INK }, "Bilim"),
    txt({ color: GOLD }, "jol"),
  ]);

async function png(node, w, h, file) {
  const svg = await satori(node, { width: w, height: h, fonts });
  writeFileSync(file, new Resvg(svg, { fitTo: { mode: "width", value: w }, font: { loadSystemFonts: false } }).render().asPng());
}

// ── ролики: экран (страница + путь прокрутки в px скриншота 780 шир.) и подписи ──
const REELS = [
  {
    id: "intro-about", n: 1, path: "", shotH: 2600, from: 0, to: 1000,
    title: { ru: "Что такое Bilimjol?", ky: "Bilimjol деген эмне?" },
    caps: {
      ru: ["Задания для детей — от подготовки до 11 класса", "На русском и кыргызском, с озвучкой", "Бесплатно и без рекламы"],
      ky: ["Мектепке даярдыктан 11-класска чейинки балдарга тапшырмалар", "Кыргызча жана орусча, үн менен", "Акысыз жана жарнамасыз"],
    },
  },
  {
    id: "intro-subjects", n: 2, path: "/class", shotH: 2200, from: 0, to: 2200,
    title: { ru: "Предметы и классы", ky: "Предметтер жана класстар" },
    caps: {
      ru: ["Выберите класс — от подготовки до 11-го", "Логика, счёт, чтение и окружающий мир", "От 87 до 126 заданий на каждый класс"],
      ky: ["Классты тандаңыз — даярдыктан 11-класска чейин", "Логика, эсеп, окуу жана айлана-чөйрө", "Ар бир класска 87ден 126га чейин тапшырма"],
    },
  },
];

const T = {
  kicker: { ru: (n) => `Знакомство с Bilimjol · ${n}`, ky: (n) => `Bilimjol менен таанышуу · ${n}` },
  ctaSub: { ru: "Начните бесплатно — ссылка в профиле", ky: "Акысыз баштаңыз — шилтеме профилде" },
  ctaPill: { ru: "RU / KY · 0–11 класс", ky: "RU / KY · 0–11-класс" },
};

// ── скриншоты прода (headless-shell из кэша Playwright уважает ширину 390px) ──
function findShell() {
  const base = join(homedir(), "Library/Caches/ms-playwright");
  if (!existsSync(base)) return null;
  for (const d of readdirSync(base).filter((x) => x.startsWith("chromium_headless_shell")).sort().reverse()) {
    for (const sub of readdirSync(join(base, d))) {
      const f = join(base, d, sub, "chrome-headless-shell");
      if (existsSync(f)) return f;
    }
  }
  return null;
}
const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1";
function shoot(url, h, file) {
  const shell = findShell();
  if (!shell) throw new Error("нет chrome-headless-shell (кэш Playwright)");
  execFileSync(shell, ["--disable-gpu", "--hide-scrollbars", `--user-data-dir=${join(TMP, "hs")}`, `--user-agent=${UA}`,
    "--force-device-scale-factor=2", `--window-size=390,${h}`, "--virtual-time-budget=9000", `--screenshot=${file}`, url], { stdio: "ignore" });
}

// ── кадры satori ──
const titleCard = (r, L) => col({ width: 1080, height: 1920, backgroundImage: VIOLET_BG, alignItems: "center", justifyContent: "center", padding: 90 }, [
  wordmark(64, true),
  txt({ marginTop: 70, fontFamily: N, fontWeight: 800, fontSize: 40, color: GOLD, textAlign: "center" }, T.kicker[L](r.n)),
  txt({ marginTop: 28, fontFamily: C, fontWeight: 700, fontSize: 96, color: "#ffffff", textAlign: "center", lineHeight: 1.15 }, r.title[L]),
]);
const ctaCard = (L) => col({ width: 1080, height: 1920, backgroundImage: VIOLET_BG, alignItems: "center", justifyContent: "center", padding: 90 }, [
  wordmark(110, true),
  txt({ marginTop: 40, fontFamily: N, fontWeight: 800, fontSize: 64, color: "#ffffff" }, "bilimjol.com"),
  txt({ marginTop: 36, fontFamily: N, fontWeight: 700, fontSize: 46, color: "#ece8ff", textAlign: "center", lineHeight: 1.3 }, T.ctaSub[L]),
  txt({ marginTop: 56, padding: "18px 40px", borderRadius: 999, backgroundColor: GOLD, fontFamily: N, fontWeight: 800, fontSize: 40, color: INK }, T.ctaPill[L]),
]);
// Фон «экрана»: лавандовый, рамка телефона 920×1400 с позиции (80,420), подпись сверху.
const PHONE = { x: 80, y: 420, w: 920, h: 1400, inner: 20 };
const screenBg = () => col({ width: 1080, height: 1920, backgroundImage: LAV_BG, alignItems: "center" }, [
  el("div", { position: "absolute", left: PHONE.x, top: PHONE.y, width: PHONE.w, height: PHONE.h, borderRadius: 56, backgroundColor: INK, boxShadow: "0 40px 90px rgba(25,21,57,.35)" }, []),
  row({ position: "absolute", left: 0, top: 1850, width: 1080, justifyContent: "center" }, [wordmark(40, false)]),
]);
const caption = (s) => row({ width: 1080, height: 380, alignItems: "center", justifyContent: "center", padding: "0 70px" }, [
  txt({ fontFamily: C, fontWeight: 700, fontSize: s.length > 44 ? 58 : 66, color: INK, textAlign: "center", lineHeight: 1.2 }, s),
]);

const FPS = 30, T_TITLE = 2.4, T_SCREEN = 9, T_CTA = 3, XF = 0.4;

async function render(r, L, shotsDir) {
  const w = join(TMP, `${r.id}-${L}`);
  rmSync(w, { recursive: true, force: true }); mkdirSync(w, { recursive: true });
  const shotName = `${r.id === "intro-about" ? "home" : "class"}-${L}.png`;
  let shot = shotsDir ? join(shotsDir, shotName) : join(w, "shot.png");
  if (!shotsDir || !existsSync(shot)) { shot = join(w, "shot.png"); shoot(`https://bilimjol.com/${L}${r.path}`, r.shotH, shot); }

  await png(titleCard(r, L), 1080, 1920, join(w, "title.png"));
  await png(ctaCard(L), 1080, 1920, join(w, "cta.png"));
  await png(screenBg(), 1080, 1920, join(w, "bg.png"));
  const caps = r.caps[L];
  for (let i = 0; i < caps.length; i++) await png(caption(caps[i]), 1080, 380, join(w, `cap${i}.png`));

  // Экран: скриншот 780 → ширина внутренней области, окно высотой внутренней области
  // едет по y от from до to (в px исходника) — это и есть «прокрутка».
  const iw = PHONE.w - PHONE.inner * 2, ih = PHONE.h - PHONE.inner * 2, k = iw / 780;
  const y0 = Math.round(r.from * k), y1 = Math.round(r.to * k);
  const seg = T_SCREEN / caps.length;
  const capOv = caps.map((_, i) => `[c${i}]overlay=0:40:enable='between(t,${(i * seg).toFixed(2)},${((i + 1) * seg).toFixed(2)})'`);
  let chain = `[1:v]scale=${iw}:-2,crop=${iw}:${ih}:0:'${y0}+(${y1 - y0})*min(1\\,max(0\\,(t-0.6)/${T_SCREEN - 1.4}))'[scr];[0:v][scr]overlay=${PHONE.x + PHONE.inner}:${PHONE.y + PHONE.inner}[s0]`;
  caps.forEach((_, i) => { chain += `;[${i + 2}:v]format=rgba[c${i}];[s${i}]${capOv[i]}[s${i + 1}]`; });
  const screenMp4 = join(w, "screen.mp4");
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-loop", "1", "-t", String(T_SCREEN), "-i", join(w, "bg.png"),
    "-loop", "1", "-t", String(T_SCREEN), "-i", shot,
    ...caps.flatMap((_, i) => ["-loop", "1", "-t", String(T_SCREEN), "-i", join(w, `cap${i}.png`)]),
    "-filter_complex", chain, "-map", `[s${caps.length}]`, "-r", String(FPS), "-pix_fmt", "yuv420p", "-c:v", "libx264", "-preset", "medium", "-crf", "20", screenMp4]);

  // Сборка: заставка → экран → финал, плавные переходы, беззвучная дорожка.
  const total = T_TITLE + T_SCREEN + T_CTA - 2 * XF;
  const outFile = join(OUT, `${r.id}-${L}.mp4`);
  execFileSync("ffmpeg", ["-y", "-loglevel", "error",
    "-loop", "1", "-t", String(T_TITLE), "-i", join(w, "title.png"),
    "-i", screenMp4,
    "-loop", "1", "-t", String(T_CTA), "-i", join(w, "cta.png"),
    "-f", "lavfi", "-t", total.toFixed(2), "-i", "anullsrc=channel_layout=stereo:sample_rate=44100",
    "-filter_complex",
    `[0:v]fps=${FPS},format=yuv420p,setsar=1[a];[1:v]fps=${FPS},format=yuv420p,setsar=1[b];[2:v]fps=${FPS},format=yuv420p,setsar=1[c];` +
    `[a][b]xfade=transition=fade:duration=${XF}:offset=${T_TITLE - XF}[ab];[ab][c]xfade=transition=fade:duration=${XF}:offset=${T_TITLE + T_SCREEN - 2 * XF}[v]`,
    "-map", "[v]", "-map", "3:a", "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "96k", "-shortest", "-movflags", "+faststart", outFile]);
  return outFile;
}

const args = process.argv.slice(2);
const langIdx = args.indexOf("--lang");
const LANGS = langIdx >= 0 ? [args[langIdx + 1]] : ["ru", "ky"];
const shotsIdx = args.indexOf("--shots");
const shotsDir = shotsIdx >= 0 ? args[shotsIdx + 1] : null;
const ids = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--lang" && args[i - 1] !== "--shots");
mkdirSync(OUT, { recursive: true });
for (const r of REELS.filter((x) => !ids.length || ids.includes(x.id))) {
  for (const L of LANGS) console.log("  ✓", await render(r, L, shotsDir));
}
