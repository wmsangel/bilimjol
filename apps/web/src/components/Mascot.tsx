"use client";

import { useEffect, useRef } from "react";
import type { Helper } from "@izn-study/shared";
import { type Mood } from "./Face";
import { Character } from "./Character";

const SIZE_PX = { md: 96, lg: 132 };

export function Mascot({
  helper,
  mood = "idle",
  message,
  size = "md",
}: {
  helper: Helper;
  mood?: Mood;
  message?: string;
  size?: keyof typeof SIZE_PX;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  // Голова слегка тянется/наклоняется к курсору.
  useEffect(() => {
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
        const reach = Math.min(7, dist / 16);
        const nx = (dx / dist) * reach;
        const ny = (dy / dist) * reach;
        const rot = Math.max(-6, Math.min(6, dx / 32));
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

  return (
    <div className="flex items-center gap-3">
      <div ref={trackRef} className="transition-transform duration-100 ease-out">
        <div className={anim}>
          <Character charId={helper.id} sizePx={SIZE_PX[size]} />
        </div>
      </div>

      {message && (
        <div className="animate-pop relative max-w-[11rem] rounded-2xl bg-white px-4 py-2 text-left font-display text-lg font-bold shadow-md dark:bg-zinc-800">
          <span className="absolute top-1/2 -left-1.5 h-3 w-3 -translate-y-1/2 rotate-45 bg-white dark:bg-zinc-800" />
          {message}
        </div>
      )}
    </div>
  );
}
