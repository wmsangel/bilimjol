import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(ROOT, "out/manifest.json"), "utf8"));
const tpl = readFileSync(join(ROOT, "hub.template.html"), "utf8");
const html = tpl.replace("__DATA__", JSON.stringify(manifest));
writeFileSync(join(ROOT, "out/hub.html"), html);
console.log("hub.html:", html.length, "байт ·", manifest.length, "дней");
