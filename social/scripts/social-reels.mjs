/**
 * Рендер квиз-рилсов из `social/reels.js` в вертикальные MP4 (1080×1920).
 *
 * Весь текст рисует satori (бренд Bilimjol, кириллица без системных шрифтов),
 * ffmpeg только анимирует: полоса-таймер на кадре вопроса → плавный переход →
 * кадр ответа с разбором и призывом. Видео без звука (рилсы смотрят без звука,
 * текст на экране). Один рилс на день.
 *
 *   node scripts/social-reels.mjs                все рилсы, обе локали → out/reels/
 *   node scripts/social-reels.mjs r-umnozhenie   один по id
 *   node scripts/social-reels.mjs --lang ru      только одна локаль
 */
import { readFileSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { REELS } from "../reels.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = (...a) => join(ROOT, ...a);
const OUT = p("out", "reels");
const TMP = p("out", "reels", "_frames");

// ── бренд-токены (как в social-slides.mjs) ──
const INK = "#191539", MUTED = "#5c5880", VIOLET = "#6d5cf7", GOLD = "#e6c079";
const FAINT = "#8f8aa8";
const VIOLET_BG = "linear-gradient(160deg, #7a6bff 0%, #6d5cf7 45%, #5a49de 100%)";
const LAV_BG = "radial-gradient(120% 90% at 80% 0%, #efe9ff 0%, #f6f3ff 55%, #efeaff 100%)";

const FONT = (f) => readFileSync(p("fonts", f));
const fonts = [
  { name: "Comfortaa", data: FONT("Comfortaa-700.ttf"), weight: 700, style: "normal" },
  { name: "Nunito", data: FONT("Nunito-700.ttf"), weight: 700, style: "normal" },
  { name: "Nunito", data: FONT("Nunito-800.ttf"), weight: 800, style: "normal" },
];

function rasterize(svg, width) {
  if (!/xmlns=/.test(svg)) svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
  const png = new Resvg(svg, { fitTo: { mode: "width", value: width }, font: { loadSystemFonts: false } }).render().asPng();
  return "data:image/png;base64," + png.toString("base64");
}
const IRBIS = rasterize(readFileSync(p("assets/irbis.svg"), "utf8"), 560);

// ── хелперы satori ──
const el = (type, style, children) => ({ type, props: { style, children } });
const img = (src, w, h) => ({ type: "img", props: { src, width: w, height: h, style: { width: w, height: h } } });
const col = (style, children) => el("div", { display: "flex", flexDirection: "column", ...style }, children);
const row = (style, children) => el("div", { display: "flex", ...style }, children);
const txt = (style, s) => el("div", { display: "flex", ...style }, s);
const C = "Comfortaa", N = "Nunito";
const headSize = (sizes, s) => (s.length <= 24 ? sizes[0] : s.length <= 40 ? sizes[1] : sizes[2]);

const wordmark = (size, onDark) =>
  row({ fontFamily: C, fontWeight: 700, fontSize: size, letterSpacing: "-0.01em" }, [
    txt({ color: onDark ? "#ffffff" : INK }, "Bilim"),
    txt({ color: GOLD }, "jol"),
  ]);

const W = 1080, H = 1920, PAD = 96;

// Кадр ВОПРОС: кикер + крупный вопрос + маскот. Полосу-таймер поверх рисует ffmpeg.
function frameQuestion(r, L) {
  const dark = r.theme === "violet";
  return col({ width: W, height: H, padding: PAD, background: dark ? VIOLET_BG : LAV_BG, alignItems: "center" }, [
    el("div", { display: "flex", marginTop: 40 }, [wordmark(44, dark)]),
    col({ alignItems: "center", marginTop: 150 }, [
      txt({ fontFamily: C, fontWeight: 700, fontSize: 38, letterSpacing: "0.14em", color: dark ? GOLD : VIOLET }, r.kicker[L].toUpperCase()),
      txt({ fontFamily: C, fontWeight: 700, fontSize: headSize([128, 104, 84], r.question[L]), lineHeight: 1.1, marginTop: 56, color: dark ? "#ffffff" : INK, textAlign: "center", maxWidth: W - PAD * 2 }, r.question[L]),
    ]),
    el("div", { display: "flex", flex: 1 }, []),
    img(IRBIS, 240, 253),
    el("div", { display: "flex", height: 70 }, []),
  ]);
}

// Кадр ОТВЕТ: кикер «ОТВЕТ» + крупный ответ + разбор + призыв.
function frameAnswer(r, L) {
  const dark = r.theme === "violet";
  const answerLbl = L === "ky" ? "ЖООП" : "ОТВЕТ";
  return col({ width: W, height: H, padding: PAD, background: dark ? VIOLET_BG : LAV_BG, alignItems: "center" }, [
    el("div", { display: "flex", marginTop: 40 }, [wordmark(44, dark)]),
    col({ alignItems: "center", marginTop: 150 }, [
      txt({ fontFamily: C, fontWeight: 700, fontSize: 38, letterSpacing: "0.18em", color: dark ? GOLD : VIOLET }, answerLbl),
      txt({ fontFamily: C, fontWeight: 700, fontSize: headSize([200, 150, 120], r.answer[L]), marginTop: 40, color: dark ? "#ffffff" : INK, textAlign: "center", maxWidth: W - PAD * 2 }, r.answer[L]),
      txt({ fontFamily: N, fontWeight: 700, fontSize: 44, marginTop: 44, color: dark ? "rgba(255,255,255,0.8)" : MUTED, textAlign: "center", maxWidth: W - PAD * 2, lineHeight: 1.3 }, r.solve[L]),
    ]),
    el("div", { display: "flex", flex: 1 }, []),
    col({ alignItems: "center" }, [
      txt({
        fontFamily: N, fontWeight: 800, fontSize: 40, textAlign: "center", color: dark ? "#2a2250" : "#ffffff",
        backgroundColor: dark ? GOLD : VIOLET, padding: "26px 44px", borderRadius: 999, maxWidth: W - PAD * 2, lineHeight: 1.2,
      }, r.cta[L]),
      txt({ fontFamily: N, fontWeight: 700, fontSize: 32, marginTop: 24, color: dark ? "rgba(255,255,255,0.7)" : FAINT }, "bilimjol.com · ссылка в профиле"),
    ]),
    img(IRBIS, 160, 169),
  ]);
}

async function renderPng(node, file) {
  const svg = await satori(node, { width: W, height: H, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: W }, font: { loadSystemFonts: false } }).render().asPng();
  writeFileSync(file, png);
}

// Цвета полосы-таймера под тему (контраст на обоих фонах).
function barColors(theme) {
  return theme === "violet"
    ? { track: "0xffffff@0.25", bar: "0xe6c079" }
    : { track: "0x191539@0.12", bar: "0x6d5cf7" };
}

const Q_SEC = 5, HOLD = 0.4, A_SEC = 3.6; // вопрос 5с + переход + ответ

function buildReel(r, L) {
  const q = join(TMP, `${r.id}-${L}-q.png`);
  const a = join(TMP, `${r.id}-${L}-a.png`);
  const outMp4 = join(OUT, `${r.id}-${L}.mp4`);
  const { track, bar } = barColors(r.theme);
  // Полоса по центру-низу (над маскотом), шириной 900, сжимается за Q_SEC секунд.
  const barY = 1480, barX = 90, barW = 900, barH = 16;
  const filter =
    `[0:v]drawbox=x=${barX}:y=${barY}:w=${barW}:h=${barH}:color=${track}:t=fill,` +
    `drawbox=x=${barX}:y=${barY}:w='max(0,${barW}*(1-t/${Q_SEC}))':h=${barH}:color=${bar}:t=fill:enable='lt(t,${Q_SEC})',` +
    `setsar=1,format=yuv420p[q];` +
    `[1:v]setsar=1,format=yuv420p[a];` +
    `[q][a]xfade=transition=fade:duration=${HOLD}:offset=${Q_SEC},format=yuv420p[v]`;
  execFileSync("ffmpeg", [
    "-y",
    "-loop", "1", "-t", String(Q_SEC + HOLD), "-i", q,
    "-loop", "1", "-t", String(A_SEC), "-i", a,
    "-filter_complex", filter,
    "-map", "[v]",
    "-r", "30", "-c:v", "libx264", "-preset", "medium", "-pix_fmt", "yuv420p",
    "-movflags", "+faststart",
    outMp4,
  ], { stdio: "pipe" });
  return outMp4;
}

// ─── main ───
const args = process.argv.slice(2);
const langArg = args.includes("--lang") ? args[args.indexOf("--lang") + 1] : null;
const ids = args.filter((a) => !a.startsWith("--") && a !== langArg);
const langs = langArg ? [langArg] : ["ru", "ky"];
const list = ids.length ? REELS.filter((r) => ids.includes(r.id)) : REELS;

mkdirSync(OUT, { recursive: true });
mkdirSync(TMP, { recursive: true });

for (const r of list) {
  for (const L of langs) {
    await renderPng(frameQuestion(r, L), join(TMP, `${r.id}-${L}-q.png`));
    await renderPng(frameAnswer(r, L), join(TMP, `${r.id}-${L}-a.png`));
    const out = buildReel(r, L);
    console.log(`${r.day}  ${r.id}-${L}  → ${out.replace(ROOT + "/", "")}`);
  }
}
rmSync(TMP, { recursive: true, force: true });
console.log(`\n${list.length * langs.length} рилсов → social/out/reels/`);
