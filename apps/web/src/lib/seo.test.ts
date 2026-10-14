import { describe, expect, it } from "vitest";
import {
  breadcrumbJsonLd,
  courseJsonLd,
  faqJsonLd,
  itemListJsonLd,
  localizedAlternates,
  productJsonLd,
} from "./seo";

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://bilimjol.com";

describe("localizedAlternates", () => {
  it("отдаёт ru, ky и x-default с URL выбранного пути", () => {
    expect(localizedAlternates("ky", "/play")).toEqual({
      canonical: `${SITE}/ky/play`,
      languages: {
        ru: `${SITE}/ru/play`,
        ky: `${SITE}/ky/play`,
        "x-default": `${SITE}/ru/play`,
      },
    });
    expect(localizedAlternates("ru")).toEqual({
      canonical: `${SITE}/ru`,
      languages: {
        ru: `${SITE}/ru`,
        ky: `${SITE}/ky`,
        "x-default": `${SITE}/ru`,
      },
    });
  });
});

describe("JSON-LD", () => {
  it("breadcrumbJsonLd — BreadcrumbList с позициями и URL", () => {
    expect(breadcrumbJsonLd("ru", [["Игры", "/games"]])).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Игры",
          item: `${SITE}/ru/games`,
        },
      ],
    });
  });

  it("faqJsonLd — FAQPage с вопросом и ответом", () => {
    expect(faqJsonLd([{ q: "Сколько?", a: "10 минут" }])).toEqual({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "Сколько?",
          acceptedAnswer: { "@type": "Answer", text: "10 минут" },
        },
      ],
    });
  });

  it("itemListJsonLd — ItemList с url", () => {
    expect(itemListJsonLd("ky", [["Тесты", "/tests"]])).toEqual({
      "@context": "https://schema.org",
      "@type": "ItemList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Тесты",
          url: `${SITE}/ky/tests`,
        },
      ],
    });
  });

  it("courseJsonLd — Course с уровнем, языком и двумя офферами", () => {
    const data = courseJsonLd("ru", {
      name: "1 класс",
      description: "Задания",
      path: "/class/1",
      level: "1 класс",
    });
    expect(data["@context"]).toBe("https://schema.org");
    expect(data["@type"]).toBe("Course");
    expect(data.name).toBe("1 класс");
    expect(data.description).toBe("Задания");
    expect(data.url).toBe(`${SITE}/ru/class/1`);
    expect(data.inLanguage).toBe("ru");
    expect(data.educationalLevel).toBe("1 класс");
    expect(data.provider).toMatchObject({ "@type": "EducationalOrganization", name: "Bilimjol" });
    expect(data.offers).toEqual([
      {
        "@type": "Offer",
        category: "Free",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
      {
        "@type": "Offer",
        category: "Premium",
        price: "1.99",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
      },
    ]);
  });

  it("productJsonLd — Product с месяцем и годом на языке страницы", () => {
    const ru = productJsonLd("ru", { name: "Premium", description: "Подписка" });
    expect(ru["@context"]).toBe("https://schema.org");
    expect(ru["@type"]).toBe("Product");
    expect(ru.name).toBe("Premium");
    expect(ru.description).toBe("Подписка");
    expect(ru.brand).toEqual({ "@type": "Brand", name: "Bilimjol" });
    expect(ru.offers).toEqual([
      {
        "@type": "Offer",
        name: "Месяц",
        price: "1.99",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE}/ru/subscribe`,
      },
      {
        "@type": "Offer",
        name: "Год",
        price: "15.99",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: `${SITE}/ru/subscribe`,
      },
    ]);

    const ky = productJsonLd("ky", { name: "Premium", description: "Жазылуу" });
    expect(ky.offers).toMatchObject([{ name: "Айлык" }, { name: "Жылдык" }]);
  });
});
