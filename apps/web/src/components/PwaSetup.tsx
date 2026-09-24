"use client";

import { useEffect, useState } from "react";

interface BIPEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "izn.study:pwa-dismissed:v1";

export function PwaSetup({
  installLabel,
  laterLabel,
}: {
  installLabel: string;
  laterLabel: string;
}) {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);

  // Регистрируем service worker (только в проде).
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      typeof navigator !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);

  // Ловим системное предложение установки (Android/Chrome).
  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      /* ignore */
    }
    const standalone =
      typeof window !== "undefined" &&
      (window.matchMedia("(display-mode: standalone)").matches ||
        // iOS Safari
        (window.navigator as unknown as { standalone?: boolean }).standalone ===
          true);
    if (dismissed || standalone) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  async function install() {
    if (!deferred) return;
    setShow(false);
    try {
      await deferred.prompt();
      await deferred.userChoice;
    } catch {
      /* ignore */
    }
    setDeferred(null);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 shadow-xl sm:bottom-4">
      <span className="text-2xl">📲</span>
      <span className="flex-1 text-sm font-semibold">{installLabel}</span>
      <button
        onClick={install}
        className="flex-none rounded-full bg-[#6d5cf7] px-4 py-2 text-sm font-bold text-white transition hover:brightness-110"
      >
        OK
      </button>
      <button
        onClick={dismiss}
        className="flex-none px-2 text-sm font-semibold text-[#5c5880] hover:text-foreground"
      >
        {laterLabel}
      </button>
    </div>
  );
}
