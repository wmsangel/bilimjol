// Видимый FAQ-аккордеон (native <details>, без JS). Текст обязан совпадать
// с FAQPage JSON-LD — иначе Google не покажет rich-результат.
export function Faq({
  title,
  items,
}: {
  title: string;
  items: { q: string; a: string }[];
}) {
  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl font-extrabold">{title}</h2>
      <div className="mt-5 divide-y divide-black/[.06] overflow-hidden rounded-[2rem] border border-black/[.06] bg-white dark:divide-white/10 dark:border-white/10 dark:bg-zinc-900">
        {items.map((it, i) => (
          <details key={i} className="group px-6 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold">
              <span>{it.q}</span>
              <span className="flex-none text-2xl text-indigo-400 transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 leading-8 text-zinc-600 dark:text-zinc-300">
              {it.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
