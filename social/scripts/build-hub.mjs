import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(ROOT, "out/manifest.json"), "utf8"));
const tpl = readFileSync(join(ROOT, "hub.template.html"), "utf8");
// Журнал ленты запекается в хаб: опубликованное автопостером сразу отмечено,
// а «текущая неделя» считается по тому же правилу, что в plan.js.
let posted = {};
try { posted = JSON.parse(readFileSync(join(ROOT, "ig-posted.json"), "utf8")).posted ?? {}; } catch {}
const html = tpl.replace("__DATA__", JSON.stringify(manifest)).replace("__POSTED__", JSON.stringify(posted));
writeFileSync(join(ROOT, "out/hub.html"), html);
console.log("hub.html:", html.length, "байт ·", manifest.length, "постов");
