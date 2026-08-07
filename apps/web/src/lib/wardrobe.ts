// Наряд ребёнка (что надето на персонаже). Хранится локально.
import type { Outfit } from "./characterArt";

const KEY = "izn.study:outfit:v1";

export function loadOutfit(): Outfit {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Outfit) : {};
  } catch {
    return {};
  }
}

export function saveOutfit(outfit: Outfit) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(outfit));
  window.dispatchEvent(new CustomEvent("izn-outfit"));
}
