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
      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-lg transition hover:bg-black/[.04] dark:border-white/15 dark:hover:bg-white/5"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}
