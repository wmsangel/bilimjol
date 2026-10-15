/**
 * Рендер постов из `social/posts.js` в слайды-PNG.
 *
 * Движок — satori (раскладывает текст и обводит глифы в path) + resvg (растр),
 * тот же способ, что OG-картинки сайта. Шрифты встраиваются в satori, поэтому
 * кириллица рисуется без системных шрифтов. Бренд — потребительский Bilimjol
 * (Comfortaa + Nunito, violet/gold, маскот-ирбис): именно его видят подписчики.
 *
 *   node scripts/social-slides.mjs                все посты, обе локали
 *   node scripts/social-slides.mjs delenie ort    по id
 *   node scripts/social-slides.mjs --lang ru       только одна локаль
 *   node scripts/social-slides.mjs --captions      подписи+хэштеги для вставки
 *   node scripts/social-slides.mjs --manifest      JSON-манифест (для хаба)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { POSTS } from "../posts.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const p = (...a) => join(ROOT, ...a);

// ── бренд-токены (потребительский Bilimjol) ──
const INK = "#191539", MUTED = "#5c5880", VIOLET = "#6d5cf7", GOLD = "#e6c079";
const LAV = "#f5f3ff", SURF = "#ffffff", FAINT = "#8f8aa8";
const GOOD = "#2f9e7d", BAD = "#d9456f";
const VIOLET_BG = "linear-gradient(160deg, #7a6bff 0%, #6d5cf7 45%, #5a49de 100%)";
const LAV_BG = "radial-gradient(120% 90% at 80% 0%, #efe9ff 0%, #f6f3ff 55%, #efeaff 100%)";

// ── шрифты ──
// Статические веса (полное покрытие latin+cyrillic+пунктуация), инстансированы
// из вариативных TTF через fonttools. Внутри одного имени satori НЕ делает
// fallback по глифам, поэтому один файл на (семейство, вес) с полным покрытием.
const FONT = (f) => readFileSync(p("fonts", f));
const fonts = [
  { name: "Comfortaa", data: FONT("Comfortaa-700.ttf"), weight: 700, style: "normal" },
  { name: "Nunito", data: FONT("Nunito-700.ttf"), weight: 700, style: "normal" },
  { name: "Nunito", data: FONT("Nunito-800.ttf"), weight: 800, style: "normal" },
];

// ── ассеты: маскот + векторные ✓/✗ → PNG (в SVG текста нет, resvg без шрифтов) ──
function rasterize(svg, width) {
  if (!/xmlns=/.test(svg)) svg = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
  const png = new Resvg(svg, { fitTo: { mode: "width", value: width }, font: { loadSystemFonts: false } }).render().asPng();
  return "data:image/png;base64," + png.toString("base64");
}
const IRBIS = rasterize(readFileSync(p("assets/irbis.svg"), "utf8"), 560);
const CHECK = rasterize('<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#2f9e7d"/><path d="M17 33 l9 10 l21 -23" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>', 64);
const CROSS = rasterize('<svg viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#d9456f"/><path d="M22 22 L42 42 M42 22 L22 42" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>', 64);

// ── хелперы satori ──
const el = (type, style, children) => ({ type, props: { style, children } });
const img = (src, w, h) => ({ type: "img", props: { src, width: w, height: h, style: { width: w, height: h } } });
const col = (style, children) => el("div", { display: "flex", flexDirection: "column", ...style }, children);
const row = (style, children) => el("div", { display: "flex", ...style }, children);
const txt = (style, s) => el("div", { display: "flex", ...style }, s);
const C = "Comfortaa", N = "Nunito";

/** Заголовок уменьшается ступенями по длине, чтобы не переполнять. */
const headSize = (sizes, s) => (s.length <= 30 ? sizes[0] : s.length <= 52 ? sizes[1] : sizes[2]);

/** Вордмарк Bilimjol: «Bilim» + «jol» (золото). */
const wordmark = (size, onDark) =>
  row({ fontFamily: C, fontWeight: 700, fontSize: size, letterSpacing: "-0.01em" }, [
    txt({ color: onDark ? "#ffffff" : INK }, "Bilim"),
    txt({ color: GOLD }, "jol"),
  ]);

const FORMATS = {
  square: { w: 1080, h: 1080, pad: 84 },
  story: { w: 1080, h: 1920, pad: 96 },
};

// ── шаблоны слайдов ── (каждый возвращает корневой node satori)
function tplCover(s, f, L) {
  const dark = s.theme === "violet";
  return col(
    { width: f.w, height: f.h, padding: f.pad, background: dark ? VIOLET_BG : LAV_BG, justifyContent: "space-between" },
    [
      col({}, [
        txt({ fontFamily: C, fontWeight: 700, fontSize: 34, letterSpacing: "0.16em", color: dark ? GOLD : VIOLET }, s.kicker[L].toUpperCase()),
        txt({ fontFamily: C, fontWeight: 700, fontSize: headSize([92, 76, 60], s.title[L]), lineHeight: 1.14, marginTop: 34, color: dark ? "#ffffff" : INK, maxWidth: f.w - f.pad * 2 }, s.title[L]),
        s.sub ? txt({ fontFamily: N, fontWeight: 700, fontSize: 40, marginTop: 28, color: dark ? "rgba(255,255,255,0.9)" : MUTED }, s.sub[L]) : null,
      ].filter(Boolean)),
      row({ justifyContent: "space-between", alignItems: "flex-end" }, [
        txt({ fontFamily: C, fontWeight: 700, fontSize: 40, color: dark ? "#ffffff" : INK }, "bilimjol.com"),
        img(IRBIS, 300, 316),
      ]),
    ]
  );
}

function tplText(s, f, L) {
  return col({ width: f.w, height: f.h, padding: f.pad, background: SURF, justifyContent: "space-between" }, [
    txt({ fontFamily: C, fontWeight: 700, fontSize: 24, letterSpacing: "0.16em", color: FAINT }, "BILIMJOL"),
    col({ flex: 1, justifyContent: "center" }, [
      row({ alignItems: "center" }, [
        el("div", { display: "flex", width: 104, height: 104, borderRadius: 30, background: VIOLET, alignItems: "center", justifyContent: "center", fontFamily: C, fontWeight: 700, fontSize: 56, color: "#ffffff" }, String(s.n)),
        txt({ fontFamily: C, fontWeight: 700, fontSize: headSize([56, 48, 40], s.title[L]), lineHeight: 1.15, marginLeft: 34, color: INK, flex: 1 }, s.title[L]),
      ]),
      txt({ fontFamily: N, fontWeight: 700, fontSize: 44, lineHeight: 1.45, marginTop: 44, color: MUTED }, s.body[L]),
    ]),
    txt({ fontFamily: C, fontWeight: 700, fontSize: 30, color: GOLD }, "bilimjol.com"),
  ]);
}

function tplList(s, f, L) {
  return col({ width: f.w, height: f.h, padding: f.pad, background: SURF, justifyContent: "space-between" }, [
    col({}, [
      txt({ fontFamily: C, fontWeight: 700, fontSize: 24, letterSpacing: "0.16em", color: FAINT }, "BILIMJOL"),
      txt({ fontFamily: C, fontWeight: 700, fontSize: 56, lineHeight: 1.15, marginTop: 24, color: INK }, s.title[L]),
    ]),
    col({ flex: 1, justifyContent: "center", gap: 30 }, s.items.map((it) =>
      row({ alignItems: "center", gap: 28 }, [
        img(it.ok ? CHECK : CROSS, 64, 64),
        txt({ fontFamily: N, fontWeight: 700, fontSize: 42, color: INK, flex: 1, lineHeight: 1.25 }, it.text[L]),
      ])
    )),
    txt({ fontFamily: C, fontWeight: 700, fontSize: 30, color: GOLD }, "bilimjol.com"),
  ]);
}

function tplCta(s, f, L) {
  return col({ width: f.w, height: f.h, padding: f.pad, background: VIOLET_BG, justifyContent: "space-between" }, [
    img(IRBIS, 240, 253),
    col({ flex: 1, justifyContent: "center" }, [
      txt({ fontFamily: C, fontWeight: 700, fontSize: headSize([84, 68, 56], s.title[L]), lineHeight: 1.12, color: "#ffffff" }, s.title[L]),
      txt({ fontFamily: N, fontWeight: 700, fontSize: 42, lineHeight: 1.4, marginTop: 30, color: "rgba(255,255,255,0.92)" }, s.sub[L]),
    ]),
    row({}, [
      el("div", { display: "flex", background: "#ffffff", borderRadius: 999, padding: "26px 56px", fontFamily: C, fontWeight: 700, fontSize: 46, color: VIOLET }, s.pill[L]),
    ]),
  ]);
}

function tplMyth(s, f, L) {
  const isFact = /факт/i.test(s.tag[L]);
  return col({ width: f.w, height: f.h, padding: f.pad, background: SURF, justifyContent: "space-between" }, [
    row({}, [
      el("div", { display: "flex", background: isFact ? GOOD : BAD, borderRadius: 999, padding: "16px 40px", fontFamily: C, fontWeight: 700, fontSize: 40, letterSpacing: "0.08em", color: "#ffffff" }, s.tag[L]),
    ]),
    col({ flex: 1, justifyContent: "center" }, [
      txt({ fontFamily: C, fontWeight: 700, fontSize: headSize([64, 54, 46], s.statement[L]), lineHeight: 1.18, color: INK }, s.statement[L]),
      txt({ fontFamily: N, fontWeight: 700, fontSize: 42, lineHeight: 1.45, marginTop: 40, color: MUTED }, s.answer[L]),
    ]),
    row({ justifyContent: "space-between", alignItems: "flex-end" }, [
      wordmark(40, false),
      txt({ fontFamily: C, fontWeight: 700, fontSize: 30, color: GOLD }, "bilimjol.com"),
    ]),
  ]);
}

function tplStory(s, f, L) {
  const dark = s.theme === "violet";
  return col({ width: f.w, height: f.h, padding: f.pad, background: dark ? VIOLET_BG : LAV_BG, alignItems: "center" }, [
    el("div", { display: "flex", marginTop: 40 }, [wordmark(44, dark)]),
    col({ alignItems: "center", marginTop: 120 }, [
      txt({ fontFamily: C, fontWeight: 700, fontSize: 36, letterSpacing: "0.14em", color: dark ? GOLD : VIOLET }, s.kicker[L].toUpperCase()),
      txt({ fontFamily: C, fontWeight: 700, fontSize: headSize([108, 84, 64], s.question[L]), lineHeight: 1.12, marginTop: 44, color: dark ? "#ffffff" : INK, textAlign: "center", maxWidth: f.w - f.pad * 2 }, s.question[L]),
    ]),
    el("div", { display: "flex", flex: 1 }, []),
    img(IRBIS, 260, 274),
    txt({ fontFamily: N, fontWeight: 700, fontSize: 30, marginTop: 20, color: dark ? "rgba(255,255,255,0.75)" : FAINT }, "↓ стикер добавь в Instagram"),
  ]);
}

const TPL = { cover: tplCover, text: tplText, list: tplList, cta: tplCta, myth: tplMyth, story: tplStory };

async function renderSlide(slide, fmtName, L) {
  const f = FORMATS[fmtName];
  const node = TPL[slide.type](slide, f, L);
  const svg = await satori(node, { width: f.w, height: f.h, fonts });
  return new Resvg(svg, { fitTo: { mode: "width", value: f.w }, font: { loadSystemFonts: false } }).render().asPng();
}

// формат файла по типу поста: сторис → story, остальное → square
const fmtOf = (post) => (post.format === "story" ? "story" : "square");

// ── CLI ──
const args = process.argv.slice(2);
const langArg = args.includes("--lang") ? args[args.indexOf("--lang") + 1] : null;
const LANGS = langArg ? [langArg] : ["ru", "ky"];

if (args.includes("--captions")) {
  for (const post of POSTS) {
    for (const L of LANGS) {
      console.log(`\n── ${post.day} · ${post.id} · ${L.toUpperCase()} · bilimjol.com/${L}${post.page}`);
      console.log(post.caption[L] + (post.hashtags[L] ? "\n\n" + post.hashtags[L] : ""));
      if (post.sticker) console.log("СТИКЕР: " + post.sticker[L]);
    }
  }
  process.exit(0);
}

const only = args.filter((a) => !a.startsWith("--") && a !== langArg);
const chosen = only.length ? POSTS.filter((x) => only.includes(x.id)) : POSTS;
if (!chosen.length) {
  console.error(`Нет поста. id: ${POSTS.map((x) => x.id).join(", ")}`);
  process.exit(1);
}

mkdirSync(p("out"), { recursive: true });
const manifest = [];
let total = 0;
for (const post of chosen) {
  const fmtName = fmtOf(post);
  const entry = { id: post.id, week: post.week, day: post.day, format: post.format, rubric: post.rubric, page: post.page, caption: post.caption, hashtags: post.hashtags, sticker: post.sticker ?? null, slides: {} };
  for (const L of LANGS) {
    const files = [];
    for (let i = 0; i < post.slides.length; i++) {
      const png = await renderSlide(post.slides[i], fmtName, L);
      const name = `${post.id}-${L}-${String(i + 1).padStart(2, "0")}-${fmtName}.png`;
      writeFileSync(p("out", name), png);
      files.push(name);
      total++;
    }
    entry.slides[L] = files;
  }
  manifest.push(entry);
  console.log(`  ${post.day}  ${post.id.padEnd(18)} ${post.format.padEnd(9)} ${post.slides.length}×${LANGS.length}`);
}
writeFileSync(p("out", "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\n${total} слайдов → social/out/  ·  manifest.json обновлён`);
