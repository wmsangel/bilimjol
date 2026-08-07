"use client";

import { useEffect, useRef, useState } from "react";
import { buildCharacter, type Outfit } from "@/lib/characterArt";
import { loadOutfit } from "@/lib/wardrobe";

// Полноростовой персонаж: SVG + слежение зрачков за курсором.
export function Character({
  charId,
  sizePx = 96,
  outfit,
  className = "",
}: {
  charId: string;
  sizePx?: number;
  /** Если не передан — берётся сохранённый наряд ребёнка. */
  outfit?: Outfit;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [stored, setStored] = useState<Outfit>({});

  // Наряд из localStorage (если не задан явно).
  useEffect(() => {
    if (outfit) return;
    setStored(loadOutfit());
    const onChange = () => setStored(loadOutfit());
    window.addEventListener("izn-outfit", onChange);
    return () => window.removeEventListener("izn-outfit", onChange);
  }, [outfit]);

  const active = outfit ?? stored;
  const svg = buildCharacter(charId, active);

  // Зрачки тянутся к курсору.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    function onMove(e: PointerEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const node = ref.current;
        if (!node) return;
        const svgEl = node.querySelector("svg");
        if (!svgEl) return;
        const r = svgEl.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height * 0.42;
        const a = Math.atan2(e.clientY - cy, e.clientX - cx);
        const dist = Math.min(1, Math.hypot(e.clientX - cx, e.clientY - cy) / 400);
        const dx = Math.cos(a) * 4 * dist;
        const dy = Math.sin(a) * 3 * dist;
        node.querySelectorAll(".pupils").forEach((p) =>
          p.setAttribute("transform", `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`),
        );
      });
    }
    window.addEventListener("pointermove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, [charId, svg]);

  return (
    <div
      ref={ref}
      className={"izn-char " + className}
      style={{ width: sizePx, height: (sizePx * 232) / 220 }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
