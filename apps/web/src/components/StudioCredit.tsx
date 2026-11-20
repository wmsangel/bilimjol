"use client";

import { sendGa4Event } from "@/lib/gtm";
import type { Locale } from "@izn-study/shared";

// Скромная подпись студии в подвале (сетевое решение 20.11). Анкор — только имя
// домена (брендовый, без ключевых слов), ссылка rel="nofollow noopener", чтобы
// сквозные ссылки сети не выглядели схемой ссылок. Событие outbound_click.
export function StudioCredit({ lang }: { lang: Locale }) {
  const ky = lang === "ky";
  return (
    <span className="text-[#8f8aa8]">
      {ky ? "" : "Сделано студией "}
      <a
        href="https://izagorodnyi.dev"
        target="_blank"
        rel="nofollow noopener"
        onClick={() => sendGa4Event("outbound_click", { host: "izagorodnyi.dev", item: "izagorodnyi.dev" })}
        className="font-semibold text-[#8f8aa8] transition hover:text-[#5c5880] hover:underline"
      >
        izagorodnyi.dev
      </a>
      {ky ? " студиясы жасаган" : ""}
    </span>
  );
}
