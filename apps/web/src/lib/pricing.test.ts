import { describe, expect, it } from "vitest";
import { PRICE, approxLocal, approxLocalMonthly } from "./pricing";

describe("PRICE", () => {
  it("хранит канонические суммы в долларах и строки для экрана", () => {
    expect(PRICE.monthly).toEqual({ usd: 1.99, display: "$1.99" });
    expect(PRICE.annual).toEqual({ usd: 15.99, display: "$15.99" });
  });
});

describe("approxLocal", () => {
  it("для КГ и неизвестной страны показывает сомы", () => {
    expect(approxLocal("monthly")).toBe("≈ 175 сом");
    expect(approxLocal("monthly", null)).toBe("≈ 175 сом");
    expect(approxLocal("monthly", "KG")).toBe("≈ 175 сом");
    expect(approxLocal("monthly", "us")).toBe("≈ 175 сом");
    expect(approxLocal("annual")).toBe("≈ 1400 сом");
    expect(approxLocal("annual", "KG")).toBe("≈ 1400 сом");
  });

  it("для страны RU показывает рубли, регистр кода не важен", () => {
    expect(approxLocal("monthly", "RU")).toBe("≈ 190 ₽");
    expect(approxLocal("monthly", "ru")).toBe("≈ 190 ₽");
    expect(approxLocal("annual", "RU")).toBe("≈ 1500 ₽");
    expect(approxLocal("annual", "ru")).toBe("≈ 1500 ₽");
  });
});

describe("approxLocalMonthly", () => {
  it("совпадает с месячной ценой approxLocal", () => {
    expect(approxLocalMonthly()).toBe(approxLocal("monthly"));
    expect(approxLocalMonthly("RU")).toBe(approxLocal("monthly", "RU"));
    expect(approxLocalMonthly("KG")).toBe("≈ 175 сом");
  });
});
