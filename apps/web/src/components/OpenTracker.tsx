"use client";

import Link from "next/link";
import { useEffect } from "react";
import { sendGa4Event } from "@/lib/gtm";

// Аналитика «открыл класс / предмет». Событие шлётся ОДИН раз на открытие
// (гард в sessionStorage на сессию+ключ), без дублей при перерисовке и возврате
// назад. `placement` (откуда открыли) выставляется источником клика через
// setPlacement() и живёт один переход; по умолчанию — "deeplink" (прямой вход/назад).

const PLACEMENT_KEY = "bj:open_placement";

/** Источник открытия класса помечает placement перед переходом. */
export function setPlacement(src: string): void {
  try {
    sessionStorage.setItem(PLACEMENT_KEY, src);
  } catch {
    /* приватный режим / нет доступа — тогда placement будет deeplink */
  }
}

function readPlacement(): string {
  try {
    const p = sessionStorage.getItem(PLACEMENT_KEY);
    sessionStorage.removeItem(PLACEMENT_KEY);
    return p || "deeplink";
  } catch {
    return "deeplink";
  }
}

function fireOnce(guardKey: string, send: () => void): void {
  try {
    if (sessionStorage.getItem(guardKey)) return;
    sessionStorage.setItem(guardKey, "1");
  } catch {
    /* без sessionStorage гард не работает — шлём один раз на маунт всё равно */
  }
  send();
}

/** Ссылка-обёртка: Next Link + пометка placement при клике (для серверных страниц). */
export function ClassOpenLink({
  href,
  placement,
  className,
  children,
}: {
  href: string;
  placement: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className} onClick={() => setPlacement(placement)}>
      {children}
    </Link>
  );
}

/** На странице класса: фиксирует «открыл класс N». */
export function GradeOpenTracker({ grade, lang }: { grade: number; lang: string }) {
  useEffect(() => {
    fireOnce(`bj:go:${grade}`, () =>
      sendGa4Event("grade_open", { grade, placement: readPlacement(), lang }),
    );
  }, [grade, lang]);
  return null;
}

/** На лендинге предмета: фиксирует «открыл предмет subject в классе N». */
export function SubjectOpenTracker({
  grade,
  subject,
  lang,
}: {
  grade: number;
  subject: string;
  lang: string;
}) {
  useEffect(() => {
    fireOnce(`bj:so:${grade}:${subject}`, () =>
      sendGa4Event("subject_open", { grade, subject, lang }),
    );
  }, [grade, subject, lang]);
  return null;
}
