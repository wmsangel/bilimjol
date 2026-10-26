/**
 * Ассеты оформления профиля Instagram: аватар 1080×1080 (маскот-ирбис на бренд-
 * фоне) и обложки «Актуального» 1080×1920 (слово по центру под круглый кроп).
 * Движок тот же, что у слайдов — satori → resvg, фирменные шрифты и цвета.
 *
 * Запуск:  node scripts/profile-assets.mjs   → social/profile/*.png
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = (...a) => join(ROOT, ...a);
const OUT = p("profile");

// ── бренд ──
const GOLD = "#e6c079";
const VIOLET_BG = "linear-gradient(160deg, #7a6bff 0%, #6d5cf7 45%, #5a49de 100%)";
const fonts = [
  { name: "Comfortaa", data: readFileSync(p("fonts", "Comfortaa-700.ttf")), weight: 700, style: "normal" },
  { name: "Nunito", data: readFileSync(p("fonts", "Nunito-700.ttf")), weight: 700, style: "normal" },
];

// Маскот: SVG → PNG data-URI (в SVG есть обводка, resvg растрирует без шрифтов).
function rasterize(svg, width) {
  // resvg требует SVG-namespace; у маскота и иконок его нет — добавим.
  const s = /xmlns=/.test(svg) ? svg : svg.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  const png = new Resvg(s, { fitTo: { mode: "width", value: width }, font: { loadSystemFonts: false } }).render().asPng();
  return "data:image/png;base64," + png.toString("base64");
}
const IRBIS = rasterize(readFileSync(p("assets/irbis.svg"), "utf8"), 820);
const IRBIS_W = 760, IRBIS_H = Math.round((760 * 232) / 220); // сохраняем пропорции 220×232

const el = (style, children) => ({ type: "div", props: { style: { display: "flex", ...style }, children } });
const txt = (style, text) => ({ type: "div", props: { style: { display: "flex", ...style }, children: text } });
const img = (src, w, h) => ({ type: "img", props: { src, width: w, height: h, style: { width: w, height: h } } });

async function toPng(node, w, h) {
  const svg = await satori(node, { width: w, height: h, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: w }, font: { loadSystemFonts: false } }).render().asPng();
}

// ── аватар 1080×1080: ирбис в светлом круге на violet-градиенте ──
function avatarNode() {
  return el(
    { width: 1080, height: 1080, background: VIOLET_BG, alignItems: "center", justifyContent: "center" },
    [
      el(
        { width: 880, height: 880, borderRadius: 440, background: "#ffffff", border: `16px solid ${GOLD}`, alignItems: "center", justifyContent: "center" },
        [img(IRBIS, IRBIS_W, IRBIS_H)],
      ),
    ],
  );
}

// ── обложка «Актуального» 1080×1920: БЕЗ ТЕКСТА (круг обрезает) — белая иконка
// по центру на бренд-фоне. Название подписывается в самом Instagram. ──
function coverNode(iconSvg) {
  const icon = rasterize(iconSvg, 460);
  return el(
    { width: 1080, height: 1920, background: VIOLET_BG, alignItems: "center", justifyContent: "center" },
    [img(icon, 460, 460)],
  );
}

// Простые векторные иконки (satori не рисует эмодзи) — белым на градиенте.
const ICON = {
  classes: '<svg viewBox="0 0 100 100"><g fill="#fff"><rect x="12" y="12" width="34" height="34" rx="8"/><rect x="54" y="12" width="34" height="34" rx="8"/><rect x="12" y="54" width="34" height="34" rx="8"/><rect x="54" y="54" width="34" height="34" rx="8"/></g></svg>',
  math: '<svg viewBox="0 0 100 100"><g fill="#fff"><rect x="41" y="14" width="18" height="72" rx="9"/><rect x="14" y="41" width="72" height="18" rx="9"/></g></svg>',
  ort: '<svg viewBox="0 0 100 100"><g fill="none" stroke="#fff" stroke-width="9"><circle cx="50" cy="50" r="36"/><circle cx="50" cy="50" r="20"/></g><circle cx="50" cy="50" r="7" fill="#fff"/></svg>',
  games: '<svg viewBox="0 0 100 100"><path d="M36 24 L78 50 L36 76 Z" fill="#fff" stroke="#fff" stroke-width="12" stroke-linejoin="round"/></svg>',
  parents: '<svg viewBox="0 0 100 100"><path d="M50 80 C50 80 16 56 16 35 A15 15 0 0 1 50 29 A15 15 0 0 1 84 35 C84 56 50 80 50 80 Z" fill="#fff"/></svg>',
  free: '<svg viewBox="0 0 100 100"><path d="M50 10 L61 38 L91 40 L68 59 L76 89 L50 72 L24 89 L32 59 L9 40 L39 38 Z" fill="#fff"/></svg>',
};

// id → название «Актуального» (его владелец впишет в Instagram).
const COVERS = [
  ["classes", "Классы"],
  ["math", "Математика"],
  ["ort", "ОРТ"],
  ["games", "Игры"],
  ["parents", "Родителям"],
  ["free", "Бесплатно"],
];

mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, "avatar.png"), await toPng(avatarNode(), 1080, 1080));
for (const [id] of COVERS) {
  writeFileSync(join(OUT, `cover-${id}.png`), await toPng(coverNode(ICON[id]), 1080, 1920));
}
console.log(`Готово: avatar.png + ${COVERS.length} обложек → social/profile/`);
