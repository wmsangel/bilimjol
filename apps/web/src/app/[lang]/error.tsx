"use client";

import { useEffect } from "react";
import Link from "next/link";

// Next 16.3: «попробовать снова» — retry() (повторный запрос).
// reset() только снимает границу и не перезагружает сегмент.
export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="text-7xl" aria-hidden="true">
        ⚠️
      </div>
      <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight">
        Что-то пошло не так
      </h1>
      <p className="mt-2 font-display text-lg font-bold text-[#5c5880]">
        Бир нерсе туура эмес болду
      </p>
      <p className="mt-4 text-[#5c5880]">
        Попробуйте ещё раз или вернитесь на главную.
      </p>
      <p className="mt-2 text-[#5c5880]">
        Дагы бир жолу аракет кылыңыз же башкы бетке кайтыңыз.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => retry()}
          className="rounded-full bg-[#6d5cf7] px-7 py-3 font-bold text-white transition hover:brightness-110"
        >
          Попробовать снова
        </button>
        <Link
          href="/"
          className="rounded-full border-2 border-[#e6e1ff] bg-white px-7 py-3 font-bold text-[#6d5cf7] transition hover:border-[#b9b3e6]"
        >
          На главную
        </Link>
      </div>
    </main>
  );
}
