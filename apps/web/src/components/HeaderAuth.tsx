"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { isLoggedIn } from "@/lib/api";

/** Кнопка справа в шапке: «Войти» гостю, «Кабинет» авторизованному. */
export function HeaderAuth({
  lang,
  signIn,
  cabinet,
}: {
  lang: string;
  signIn: string;
  cabinet: string;
}) {
  const [state, setState] = useState<"loading" | "guest" | "user">("loading");

  useEffect(() => {
    setState(isLoggedIn() ? "user" : "guest");
  }, []);

  // До гидратации ничего не показываем — чтобы не мигать «Войти» у залогиненного.
  if (state === "loading") {
    return <span className="hidden sm:inline-block sm:w-[76px]" aria-hidden="true" />;
  }

  const guest = state === "guest";
  return (
    <Link
      href={guest ? `/${lang}/login` : `/${lang}/me`}
      className="hidden rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-indigo-500/30 transition hover:brightness-110 sm:inline-block"
    >
      {guest ? signIn : cabinet}
    </Link>
  );
}
