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
      <p className="mt-2 font-display text-lg font-bold text-zinc-500 dark:text-zinc-400">
        Барак табылган жок
      </p>
      <p className="mt-4 text-zinc-600 dark:text-zinc-300">
        Возможно, ссылка устарела. Вернитесь на главную или выберите раздел ниже.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 px-7 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:brightness-110"
        >
          На главную
        </Link>
        <Link
          href="/ru/play"
          className="rounded-full border-2 border-indigo-200 bg-white px-7 py-3 font-bold text-indigo-600 transition hover:border-indigo-400 dark:border-white/15 dark:bg-zinc-900 dark:text-indigo-300"
        >
          Играть
        </Link>
        <Link
          href="/ru/articles"
          className="rounded-full border-2 border-indigo-200 bg-white px-7 py-3 font-bold text-indigo-600 transition hover:border-indigo-400 dark:border-white/15 dark:bg-zinc-900 dark:text-indigo-300"
        >
          Материалы
        </Link>
      </div>
    </main>
  );
}
