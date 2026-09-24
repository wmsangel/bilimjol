import Link from "next/link";

// Кастомная 404 внутри локали. Компоненты not-found не получают params,
// поэтому текст двуязычный и нейтральный; ссылки ведут на корень (прокси
// сам отправит на нужную локаль) и в основные разделы.
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <div className="text-7xl">🧭</div>
      <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight">
        Страница не найдена
      </h1>
      <p className="mt-2 font-display text-lg font-bold text-[#5c5880]">
        Барак табылган жок
      </p>
      <p className="mt-4 text-[#5c5880]">
        Возможно, ссылка устарела. Вернитесь на главную или выберите раздел ниже.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-[#6d5cf7] px-7 py-3 font-bold text-white transition hover:brightness-110"
        >
          На главную
        </Link>
        <Link
          href="/ru/play"
          className="rounded-full border-2 border-[#e6e1ff] bg-white px-7 py-3 font-bold text-[#6d5cf7] transition hover:border-[#b9b3e6]"
        >
          Играть
        </Link>
        <Link
          href="/ru/articles"
          className="rounded-full border-2 border-[#e6e1ff] bg-white px-7 py-3 font-bold text-[#6d5cf7] transition hover:border-[#b9b3e6]"
        >
          Материалы
        </Link>
      </div>
    </main>
  );
}
