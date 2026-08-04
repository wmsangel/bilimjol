"use client";

import { useMemo } from "react";

const EMOJIS = ["🎉", "⭐", "✨", "🎊", "🌟", "💫", "🥳"];

// Разовый залп конфетти. Родитель монтирует компонент в момент праздника,
// размонтирует — при переходе дальше (каждый раз новый залп).
export function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.35,
        duration: 1.1 + Math.random() * 0.9,
        size: 14 + Math.random() * 18,
        emoji: EMOJIS[i % EMOJIS.length],
      })),
    [],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
      aria-hidden
    >
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            fontSize: `${p.size}px`,
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
