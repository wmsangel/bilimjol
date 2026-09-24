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
    <section className="mt-14 font-sans text-[#191539]">
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <div className="mt-5 divide-y divide-[#efecff] overflow-hidden rounded-[28px] bg-white shadow-[0_8px_24px_rgba(25,21,57,.06)]">
        {items.map((it, i) => (
          <details key={i} className="group px-6 py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold">
              <span>{it.q}</span>
              <span className="flex-none text-2xl text-[#6d5cf7] transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 leading-8 text-[#2d2950]">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
