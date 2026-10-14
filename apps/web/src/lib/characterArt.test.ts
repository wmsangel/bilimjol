import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CHARACTER_IDS,
  SETS,
  WARDROBE,
  buildCharacter,
  characterName,
  wardrobeIcon,
} from "./characterArt";

function sourceList(name: string): string[] {
  const src = readFileSync(new URL("./characterArt.ts", import.meta.url), "utf8");
  const match = src.match(new RegExp(`const ${name} = \\[([^\\]]+)\\]`));
  if (!match) throw new Error(`не найден ${name}`);
  return [...match[1].matchAll(/"([^"]+)"/g)].map((found) => found[1]);
}

function unlockKeys(): string[] {
  const src = readFileSync(new URL("./characterArt.ts", import.meta.url), "utf8");
  const match = src.match(/const UNLOCK_AT: Record<string, number> = \{([^}]+)\}/);
  if (!match) throw new Error("не найден UNLOCK_AT");
  return [...match[1].matchAll(/(\w+):/g)].map((found) => found[1]);
}

describe("buildCharacter / characterName", () => {
  it("для каждого CHARACTER_IDS рисует svg, а имя не равно id", () => {
    expect(CHARACTER_IDS.length).toBeGreaterThan(0);
    for (const id of CHARACTER_IDS) {
      expect(buildCharacter(id).startsWith("<svg")).toBe(true);
      expect(characterName(id)).not.toBe(id);
    }
  });
});

describe("гардероб", () => {
  it("предметы наборов есть в WARDROBE, UNLOCK_AT входит в WARD_ORDER, у каждой вещи есть svg", () => {
    const wardrobeIds = new Set(WARDROBE.map((item) => item.id));
    const missing = SETS.flatMap((set) => set.items.filter((id) => !wardrobeIds.has(id)));
    expect(missing).toEqual([]);

    const order = sourceList("WARD_ORDER");
    expect(WARDROBE.map((item) => item.id)).toEqual(order);
    const outside = unlockKeys().filter((key) => !order.includes(key));
    expect(outside).toEqual([]);

    const empty = '<svg viewBox="0 0 44 40" aria-hidden="true"></svg>';
    for (const key of order) {
      const svg = wardrobeIcon(key);
      expect(svg.startsWith("<svg")).toBe(true);
      expect(svg.endsWith("</svg>")).toBe(true);
      expect(svg.length).toBeGreaterThan(empty.length);
    }
  });
});
