"use client";

import { useEffect, useRef } from "react";
import type { Helper } from "@izn-study/shared";
import { helperGradient } from "@/lib/helperTheme";

export type Mood = "idle" | "happy" | "sad";

const SIZES = {
  md: { circle: "h-24 w-24", emoji: "text-5xl" },
  lg: { circle: "h-32 w-32", emoji: "text-7xl" },
};

export function Mascot({
  helper,
  mood = "idle",
  message,
  size = "md",
}: {
  helper: Helper;
  mood?: Mood;
  message?: string;
  size?: keyof typeof SIZES;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Мордашка тянется к курсору мыши.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    function onMove(e: MouseEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const node = trackRef.current;
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(8, dist / 12);
        const nx = (dx / dist) * reach;
        const ny = (dy / dist) * reach;
        const rot = Math.max(-7, Math.min(7, dx / 28));
        node.style.transform = `translate(${nx}px, ${ny}px) rotate(${rot}deg)`;
      });
    }
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  const anim =
    mood === "happy"
      ? "animate-happy"
      : mood === "sad"
        ? "animate-shake"
        : "animate-bob";

  const s = SIZES[size];

  return (
    <div className="flex items-center gap-3">
      <div ref={trackRef} className="transition-transform duration-100 ease-out">
        <div
          className={
            "relative flex items-center justify-center rounded-full bg-gradient-to-br shadow-lg ring-4 ring-white/70 dark:ring-white/10 " +
            helperGradient[helper.color] +
            " " +
            s.circle +
            " " +
            anim
          }
        >
          <span className={s.emoji}>{helper.emoji}</span>
        </div>
      </div>

      {message && (
        <div className="animate-pop relative max-w-[11rem] rounded-2xl bg-white px-4 py-2 text-left font-display text-lg font-bold shadow-md dark:bg-zinc-800">
          {/* хвостик реплики слева, указывает на помощника */}
          <span className="absolute top-1/2 -left-1.5 h-3 w-3 -translate-y-1/2 rotate-45 bg-white dark:bg-zinc-800" />
          {message}
        </div>
      )}
    </div>
  );
}
