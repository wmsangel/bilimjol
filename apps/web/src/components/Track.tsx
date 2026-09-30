"use client";

import { useEffect } from "react";
import { pushEvent } from "@/lib/gtm";

type V = string | number | boolean | null | undefined;

/**
 * Невидимый трекер: шлёт одно событие в dataLayer при монтировании.
 * Удобно вешать на серверные страницы (game_open, test_start и т.п.).
 */
export function Track({
  event,
  params,
}: {
  event: string;
  params?: Record<string, V>;
}) {
  useEffect(() => {
    pushEvent(event, params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
