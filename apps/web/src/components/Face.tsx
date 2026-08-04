"use client";

import { useEffect, useRef } from "react";
import type { Helper } from "@izn-study/shared";
import { helperFace } from "@/lib/helperTheme";

export type Mood = "idle" | "happy" | "sad";

function Ears({ ear, dark, light }: { ear: Helper["ear"]; dark: string; light: string }) {
  if (ear === "pointy") {
    return (
      <>
        <path d="M20,42 L28,8 L48,30 Z" fill={dark} />
        <path d="M80,42 L72,8 L52,30 Z" fill={dark} />
        <path d="M27,34 L30,17 L40,29 Z" fill={light} />
        <path d="M73,34 L70,17 L60,29 Z" fill={light} />
      </>
    );
  }
  if (ear === "round") {
    return (
      <>
        <circle cx="26" cy="26" r="13" fill={dark} />
        <circle cx="74" cy="26" r="13" fill={dark} />
        <circle cx="26" cy="26" r="6" fill={light} />
        <circle cx="74" cy="26" r="6" fill={light} />
      </>
    );
  }
  return null;
}

export function Face({
  helper,
  mood = "idle",
  sizePx = 96,
}: {
  helper: Helper;
  mood?: Mood;
  sizePx?: number;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);
  const colors = helperFace[helper.color];
  const gid = `face-grad-${helper.id}`;
  const dark = "#3f3f46";

  // Зрачки следят за курсором.
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    function onMove(e: MouseEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const svg = svgRef.current;
        const pupils = pupilsRef.current;
        if (!svg || !pupils) return;
        const rect = svg.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(3.2, dist / 45);
        const nx = (dx / dist) * reach;
        const ny = (dy / dist) * reach;
        pupils.setAttribute("transform", `translate(${nx} ${ny})`);
      });
    }
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 100 100"
      width={sizePx}
      height={sizePx}
      className="drop-shadow-lg"
      role="img"
      aria-label={helper.name.ru}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.light} />
          <stop offset="100%" stopColor={colors.dark} />
        </linearGradient>
      </defs>

      <Ears ear={helper.ear} dark={colors.dark} light={colors.light} />

      {/* Голова */}
      <circle cx="50" cy="56" r="34" fill={`url(#${gid})`} />

      {/* Глаза (моргают) */}
      <g className="mascot-blink">
        <ellipse cx="38" cy="53" rx="8" ry="10" fill="#ffffff" />
        <ellipse cx="62" cy="53" rx="8" ry="10" fill="#ffffff" />
        <g ref={pupilsRef}>
          <circle cx="38" cy="55" r="4.2" fill={dark} />
          <circle cx="62" cy="55" r="4.2" fill={dark} />
          <circle cx="39.4" cy="53.4" r="1.4" fill="#ffffff" />
          <circle cx="63.4" cy="53.4" r="1.4" fill="#ffffff" />
        </g>
      </g>

      {/* Бровки при грусти */}
      {mood === "sad" && (
        <g stroke={dark} strokeWidth="2.5" strokeLinecap="round">
          <line x1="31" y1="41" x2="43" y2="45" />
          <line x1="69" y1="41" x2="57" y2="45" />
        </g>
      )}

      {/* Носик */}
      <circle cx="50" cy="63" r="2.4" fill={dark} />

      {/* Румянец при радости */}
      {mood === "happy" && (
        <g fill="#fb7185" opacity="0.55">
          <ellipse cx="27" cy="64" rx="5" ry="3.4" />
          <ellipse cx="73" cy="64" rx="5" ry="3.4" />
        </g>
      )}

      {/* Рот по настроению */}
      {mood === "happy" ? (
        <path d="M38,69 Q50,86 62,69 Z" fill="#7f1d1d" />
      ) : mood === "sad" ? (
        <path
          d="M41,76 Q50,69 59,76"
          fill="none"
          stroke={dark}
          strokeWidth="3"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M41,71 Q50,79 59,71"
          fill="none"
          stroke={dark}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
