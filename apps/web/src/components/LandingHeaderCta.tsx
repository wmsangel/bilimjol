"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isLoggedIn } from "@/lib/api";

/**
 * Кнопка в шапке лендинга: гостю — «Начать бесплатно» (→ /play), залогиненному —
 * «Кабинет» (→ /me). Авторизация клиентская (localStorage), поэтому по умолчанию
 * рисуем гостевой вариант и переключаем после гидратации.
 */
export function LandingHeaderCta({
  lang,
  startLabel,
  cabinetLabel,
}: {
  lang: string;
  startLabel: string;
  cabinetLabel: string;
}) {
  const [logged, setLogged] = useState(false);
  useEffect(() => setLogged(isLoggedIn()), []);

  return (
    <Link
      href={logged ? `/${lang}/me` : `/${lang}/play`}
      className="hidden rounded-full bg-[#6d5cf7] px-5 py-3 text-[15px] font-extrabold text-white transition hover:shadow-[0_0_0_3px_#e6c079] sm:inline-block"
    >
      {logged ? cabinetLabel : startLabel}
    </Link>
  );
}
