"use client";

import { useEffect, useState } from "react";
import { isMuted, toggleMuted, playSound } from "@/lib/sound";

export function SoundToggle() {
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    setMuted(isMuted());
  }, []);

  function toggle() {
    const next = toggleMuted();
    setMuted(next);
    if (!next) playSound("click");
  }

  return (
    <button
      onClick={toggle}
      aria-label={muted ? "Включить звук" : "Выключить звук"}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-lg transition hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/5"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
