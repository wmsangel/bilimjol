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
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e6e1ff] text-lg transition hover:bg-[#f7f5ff]"
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
