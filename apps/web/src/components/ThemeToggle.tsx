"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const el = document.documentElement;
    const next = !el.classList.contains("dark");
    el.classList.toggle("dark", next);
    document.cookie = `izn-theme=${next ? "dark" : "light"}; path=/; max-age=31536000; samesite=lax`;
    setDark(next);
  }

  return (
    <button
      onClick={toggle}
      aria-label="Сменить тему"
      className="flex h-11 w-11 items-center md:h-9 md:w-9 justify-center rounded-full border border-[#e6e1ff] text-lg transition hover:bg-[#f7f5ff]"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}
