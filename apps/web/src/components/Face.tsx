"use client";

import { useEffect, useRef } from "react";
import type { Helper } from "@izn-study/shared";
import { helperFace } from "@/lib/helperTheme";

export type Mood = "idle" | "happy" | "sad";

const DARK = "#3f3f46";
const BLACK = "#27272a";
const WHITE = "#ffffff";

interface EyeCfg {
  lx: number;
  rx: number;
  y: number;
  rw: number;
  rh: number;
}
const DEFAULT_EYES: EyeCfg = { lx: 38, rx: 62, y: 53, rw: 8, rh: 10 };

function eyesFor(id: string): EyeCfg {
  if (id === "owl") return { lx: 36, rx: 64, y: 51, rw: 11, rh: 12 };
  if (id === "frog") return { lx: 33, rx: 67, y: 33, rw: 9, rh: 10 };
  return DEFAULT_EYES;
}

// Черты, рисуемые ЗА головой (уши, рога, грива).
function TopFeatures({ helper, light, dark }: { helper: Helper; light: string; dark: string }) {
  const id = helper.id;
  const pointy = (
    <>
      <path d="M20,42 L28,8 L48,30 Z" fill={dark} />
      <path d="M80,42 L72,8 L52,30 Z" fill={dark} />
    </>
  );
  switch (id) {
    case "fox":
      return (
        <>
          {pointy}
          <path d="M27,34 L30,17 L40,29 Z" fill={WHITE} />
          <path d="M73,34 L70,17 L60,29 Z" fill={WHITE} />
        </>
      );
    case "cat":
      return (
        <>
          {pointy}
          <path d="M28,33 L31,18 L40,29 Z" fill="#fbcfe8" />
          <path d="M72,33 L69,18 L60,29 Z" fill="#fbcfe8" />
        </>
      );
    case "tiger":
      return (
        <>
          <circle cx="27" cy="26" r="11" fill={dark} />
          <circle cx="73" cy="26" r="11" fill={dark} />
          <circle cx="27" cy="26" r="5" fill="#fecaca" />
          <circle cx="73" cy="26" r="5" fill="#fecaca" />
        </>
      );
    case "bear":
    case "panda": {
      const earFill = id === "panda" ? BLACK : dark;
      return (
        <>
          <circle cx="26" cy="24" r="13" fill={earFill} />
          <circle cx="74" cy="24" r="13" fill={earFill} />
          {id === "bear" && (
            <>
              <circle cx="26" cy="24" r="6" fill={light} />
              <circle cx="74" cy="24" r="6" fill={light} />
            </>
          )}
        </>
      );
    }
    case "rabbit":
      return (
        <>
          <ellipse cx="36" cy="14" rx="7" ry="20" fill={dark} />
          <ellipse cx="64" cy="14" rx="7" ry="20" fill={dark} />
          <ellipse cx="36" cy="16" rx="3" ry="13" fill="#fbcfe8" />
          <ellipse cx="64" cy="16" rx="3" ry="13" fill="#fbcfe8" />
        </>
      );
    case "lion":
      return (
        <>
          {/* грива */}
          <circle cx="50" cy="56" r="43" fill="#d97706" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            const cx = Math.round((50 + Math.cos(a) * 43) * 100) / 100;
            const cy = Math.round((56 + Math.sin(a) * 43) * 100) / 100;
            return <circle key={i} cx={cx} cy={cy} r="8" fill="#b45309" />;
          })}
          <circle cx="30" cy="30" r="7" fill={dark} />
          <circle cx="70" cy="30" r="7" fill={dark} />
        </>
      );
    case "owl":
      return (
        <>
          <path d="M28,30 L33,12 L44,28 Z" fill={dark} />
          <path d="M72,30 L67,12 L56,28 Z" fill={dark} />
        </>
      );
    case "dragon":
      return (
        <>
          <path d="M34,26 L30,6 L44,22 Z" fill="#fde68a" />
          <path d="M66,26 L70,6 L56,22 Z" fill="#fde68a" />
          {/* гребень */}
          <path d="M44,22 L50,10 L56,22 Z" fill="#f59e0b" />
        </>
      );
    case "unicorn":
      return (
        <>
          <path d="M44,26 L50,2 L56,26 Z" fill="#facc15" />
          <path d="M44,26 L50,2 L50,26 Z" fill="#eab308" />
          <path d="M22,40 L30,14 L46,32 Z" fill={dark} />
          <path d="M78,40 L70,14 L54,32 Z" fill={dark} />
        </>
      );
    default:
      return pointy;
  }
}

// Черты, рисуемые ПОВЕРХ головы (морда, пятна, полоски, клюв-зона).
function Markings({ helper, light }: { helper: Helper; light: string }) {
  switch (helper.id) {
    case "fox":
      return <ellipse cx="50" cy="66" rx="16" ry="13" fill={WHITE} />;
    case "bear":
      return <ellipse cx="50" cy="66" rx="15" ry="12" fill={light} opacity="0.85" />;
    case "tiger":
      return (
        <>
          <ellipse cx="50" cy="66" rx="16" ry="13" fill={WHITE} />
          <g stroke={BLACK} strokeWidth="2.5" strokeLinecap="round">
            <line x1="24" y1="44" x2="32" y2="48" />
            <line x1="76" y1="44" x2="68" y2="48" />
            <line x1="50" y1="30" x2="50" y2="40" />
            <line x1="42" y1="32" x2="44" y2="41" />
            <line x1="58" y1="32" x2="56" y2="41" />
          </g>
        </>
      );
    case "panda":
      return (
        <>
          <circle cx="50" cy="58" r="30" fill="#fafafa" />
          <ellipse cx="38" cy="53" rx="9" ry="12" fill={BLACK} transform="rotate(-18 38 53)" />
          <ellipse cx="62" cy="53" rx="9" ry="12" fill={BLACK} transform="rotate(18 62 53)" />
        </>
      );
    case "penguin":
      return <ellipse cx="50" cy="60" rx="23" ry="25" fill="#fafafa" />;
    default:
      return null;
  }
}

export function Face({
  helper,
  mood = "idle",
  sizePx = 96,
  track = true,
}: {
  helper: Helper;
  mood?: Mood;
  sizePx?: number;
  track?: boolean;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pupilsRef = useRef<SVGGElement>(null);
  const colors = helperFace[helper.color];
  const gid = `face-grad-${helper.id}`;
  const eyes = eyesFor(helper.id);
  const beakId = ["owl", "penguin", "dragon"].includes(helper.id);
  const catNose = helper.id === "cat" || helper.id === "rabbit";

  useEffect(() => {
    if (!track) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    function onMove(e: MouseEvent) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const svg = svgRef.current;
        const pupils = pupilsRef.current;
        if (!svg || !pupils) return;
        const rect = svg.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        const dist = Math.hypot(dx, dy) || 1;
        const reach = Math.min(3.2, dist / 45);
        pupils.setAttribute(
          "transform",
          `translate(${(dx / dist) * reach} ${(dy / dist) * reach})`,
        );
      });
    }
    window.addEventListener("mousemove", onMove);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", onMove);
    };
  }, [track]);

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

      <TopFeatures helper={helper} light={colors.light} dark={colors.dark} />

      {/* Голова */}
      <circle cx="50" cy="56" r="34" fill={`url(#${gid})`} />

      <Markings helper={helper} light={colors.light} />

      {/* Усы (кот/заяц) */}
      {catNose && (
        <g stroke={DARK} strokeWidth="1.4" strokeLinecap="round" opacity="0.7">
          <line x1="30" y1="64" x2="16" y2="61" />
          <line x1="30" y1="67" x2="16" y2="68" />
          <line x1="70" y1="64" x2="84" y2="61" />
          <line x1="70" y1="67" x2="84" y2="68" />
        </g>
      )}

      {/* Глаза (моргают) */}
      <g className="mascot-blink">
        <ellipse cx={eyes.lx} cy={eyes.y} rx={eyes.rw} ry={eyes.rh} fill={WHITE} />
        <ellipse cx={eyes.rx} cy={eyes.y} rx={eyes.rw} ry={eyes.rh} fill={WHITE} />
        <g ref={pupilsRef}>
          <circle cx={eyes.lx} cy={eyes.y + 2} r="4.2" fill={DARK} />
          <circle cx={eyes.rx} cy={eyes.y + 2} r="4.2" fill={DARK} />
          <circle cx={eyes.lx + 1.4} cy={eyes.y + 0.4} r="1.4" fill={WHITE} />
          <circle cx={eyes.rx + 1.4} cy={eyes.y + 0.4} r="1.4" fill={WHITE} />
        </g>
      </g>

      {/* Бровки при грусти */}
      {mood === "sad" && (
        <g stroke={DARK} strokeWidth="2.5" strokeLinecap="round">
          <line x1="31" y1="41" x2="43" y2="45" />
          <line x1="69" y1="41" x2="57" y2="45" />
        </g>
      )}

      {/* Румянец при радости */}
      {mood === "happy" && (
        <g fill="#fb7185" opacity="0.5">
          <ellipse cx="27" cy="67" rx="5" ry="3.2" />
          <ellipse cx="73" cy="67" rx="5" ry="3.2" />
        </g>
      )}

      {/* Нос / клюв */}
      {beakId ? (
        <path
          d="M45,62 L55,62 L50,70 Z"
          fill={helper.id === "penguin" || helper.id === "owl" ? "#f59e0b" : "#f97316"}
        />
      ) : catNose ? (
        <path d="M46,61 L54,61 L50,66 Z" fill="#fb7185" />
      ) : (
        <circle cx="50" cy="62" r="2.6" fill={DARK} />
      )}

      {/* Рот по настроению */}
      {mood === "happy" ? (
        <path d="M40,70 Q50,84 60,70 Z" fill="#7f1d1d" />
      ) : mood === "sad" ? (
        <path
          d="M42,76 Q50,70 58,76"
          fill="none"
          stroke={DARK}
          strokeWidth="3"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M43,71 Q50,78 57,71"
          fill="none"
          stroke={DARK}
          strokeWidth="3"
          strokeLinecap="round"
        />
      )}

      {/* Передние зубки зайца */}
      {helper.id === "rabbit" && (
        <rect x="47" y="74" width="6" height="6" rx="1.5" fill={WHITE} stroke={DARK} strokeWidth="0.6" />
      )}
    </svg>
  );
}
