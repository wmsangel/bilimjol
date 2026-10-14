import { describe, expect, it } from "vitest";
import { pluralRu } from "./plural";

describe("pluralRu", () => {
  it("выбирает форму для 1, 2, 5, 11, 21, 22 и 25", () => {
    const form = (n: number) => pluralRu(n, "одно", "несколько", "много");
    expect(form(1)).toBe("одно");
    expect(form(2)).toBe("несколько");
    expect(form(5)).toBe("много");
    expect(form(11)).toBe("много");
    expect(form(21)).toBe("одно");
    expect(form(22)).toBe("несколько");
    expect(form(25)).toBe("много");
  });
});
