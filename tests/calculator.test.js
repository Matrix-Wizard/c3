import { describe, expect, it } from "vitest";
import {
  Calculator,
  HistoryStore,
  compute,
  formatDisplay,
  formatHistoryTime,
  toNumber,
} from "../calculator.js";

describe("formatDisplay", () => {
  it("форматирует целые числа без изменений", () => {
    expect(formatDisplay("42")).toBe("42");
    expect(formatDisplay("0")).toBe("0");
  });

  it("заменяет точку на запятую в десятичных числах", () => {
    expect(formatDisplay("3.14")).toBe("3,14");
    expect(formatDisplay("3,14")).toBe("3,14");
  });

  it("возвращает «Ошибка» без изменений", () => {
    expect(formatDisplay("Ошибка")).toBe("Ошибка");
  });

  it("возвращает «0» для некорректных значений", () => {
    expect(formatDisplay("abc")).toBe("0");
    expect(formatDisplay("NaN")).toBe("0");
  });
});

describe("toNumber", () => {
  it("парсит числа с запятой", () => {
    expect(toNumber("3,5")).toBe(3.5);
    expect(toNumber("10")).toBe(10);
  });
});

describe("compute", () => {
  it("складывает числа", () => {
    expect(compute(2, "+", 3)).toBe(5);
  });

  it("вычитает числа", () => {
    expect(compute(10, "-", 4)).toBe(6);
  });

  it("умножает числа", () => {
    expect(compute(6, "*", 7)).toBe(42);
  });

  it("делит числа", () => {
    expect(compute(8, "/", 2)).toBe(4);
  });

  it("возвращает null при делении на ноль", () => {
    expect(compute(5, "/", 0)).toBeNull();
    expect(compute(0, "/", 0)).toBeNull();
  });

  it("возвращает второй операнд для неизвестной операции", () => {
    expect(compute(1, "?", 9)).toBe(9);
  });
});

describe("Calculator — положительные сценарии", () => {
  it("начинает с нуля", () => {
    const calc = new Calculator();
    expect(calc.getResult()).toBe("0");
    expect(calc.getExpression()).toBe("");
  });

  it("вводит цифры и заменяет начальный ноль", () => {
    const calc = new Calculator();
    calc.inputDigit("7");
    calc.inputDigit("5");
    expect(calc.getResult()).toBe("75");
  });

  it("добавляет десятичную часть", () => {
    const calc = new Calculator();
    calc.inputDigit("3");
    calc.inputDecimal();
    calc.inputDigit("5");
    expect(calc.getResult()).toBe("3,5");
  });

  it("начинает десятичный ввод с «0,» после оператора", () => {
    const calc = new Calculator();
    calc.inputDigit("5");
    calc.setOperator("+");
    calc.inputDecimal();
    calc.inputDigit("2");
    expect(calc.getResult()).toBe("0,2");
  });

  it("выполняет сложение", () => {
    const calc = new Calculator();
    calc.inputDigit("2");
    calc.inputDigit("5");
    calc.setOperator("+");
    calc.inputDigit("1");
    calc.inputDigit("3");
    const historyLine = calc.equals();
    expect(calc.getResult()).toBe("38");
    expect(historyLine).toBe("25 + 13 = 38");
  });

  it("выполняет вычитание", () => {
    const calc = new Calculator();
    calc.inputDigit("9");
    calc.setOperator("-");
    calc.inputDigit("4");
    calc.equals();
    expect(calc.getResult()).toBe("5");
  });

  it("выполняет умножение", () => {
    const calc = new Calculator();
    calc.inputDigit("6");
    calc.setOperator("*");
    calc.inputDigit("7");
    calc.equals();
    expect(calc.getResult()).toBe("42");
  });

  it("выполняет деление", () => {
    const calc = new Calculator();
    calc.inputDigit("8");
    calc.setOperator("/");
    calc.inputDigit("2");
    calc.equals();
    expect(calc.getResult()).toBe("4");
  });

  it("поддерживает цепочку операций", () => {
    const calc = new Calculator();
    calc.inputDigit("2");
    calc.setOperator("+");
    calc.inputDigit("3");
    calc.setOperator("*");
    calc.inputDigit("4");
    calc.equals();
    expect(calc.getResult()).toBe("20");
  });

  it("показывает выражение до нажатия «=»", () => {
    const calc = new Calculator();
    calc.inputDigit("1");
    calc.inputDigit("0");
    calc.setOperator("+");
    expect(calc.getExpression()).toBe("10 +");
    expect(calc.getResult()).toBe("10");
  });

  it("вычисляет процент", () => {
    const calc = new Calculator();
    calc.inputDigit("5");
    calc.inputDigit("0");
    calc.percent();
    expect(calc.getResult()).toBe("0,5");
  });

  it("удаляет последний символ через backspace", () => {
    const calc = new Calculator();
    calc.inputDigit("1");
    calc.inputDigit("2");
    calc.inputDigit("3");
    calc.backspace();
    expect(calc.getResult()).toBe("12");
  });

  it("сбрасывает состояние через clearAll", () => {
    const calc = new Calculator();
    calc.inputDigit("9");
    calc.setOperator("+");
    calc.inputDigit("1");
    calc.clearAll();
    expect(calc.getResult()).toBe("0");
    expect(calc.getExpression()).toBe("");
  });

  it("не добавляет вторую запятую", () => {
    const calc = new Calculator();
    calc.inputDigit("1");
    calc.inputDecimal();
    calc.inputDigit("2");
    calc.inputDecimal();
    expect(calc.getResult()).toBe("1,2");
  });
});

describe("Calculator — отрицательные сценарии", () => {
  it("показывает «Ошибка» при делении на ноль", () => {
    const calc = new Calculator();
    calc.inputDigit("7");
    calc.setOperator("/");
    calc.inputDigit("0");
    const historyLine = calc.equals();
    expect(calc.getResult()).toBe("Ошибка");
    expect(historyLine).toBe("7 ÷ 0 = Ошибка");
  });

  it("показывает «Ошибка» при делении на ноль в цепочке операций", () => {
    const calc = new Calculator();
    calc.inputDigit("1");
    calc.inputDigit("0");
    calc.setOperator("/");
    calc.inputDigit("0");
    calc.setOperator("+");
    expect(calc.getResult()).toBe("Ошибка");
    expect(calc.getExpression()).toBe("");
  });

  it("не выполняет операции после ошибки", () => {
    const calc = new Calculator();
    calc.inputDigit("1");
    calc.setOperator("/");
    calc.inputDigit("0");
    calc.equals();
    calc.setOperator("+");
    expect(calc.getResult()).toBe("Ошибка");
    expect(calc.getExpression()).toBe("");
  });

  it("не вычисляет процент после ошибки", () => {
    const calc = new Calculator();
    calc.inputDigit("1");
    calc.setOperator("/");
    calc.inputDigit("0");
    calc.equals();
    calc.percent();
    expect(calc.getResult()).toBe("Ошибка");
  });

  it("сбрасывает ошибку через backspace", () => {
    const calc = new Calculator();
    calc.inputDigit("1");
    calc.setOperator("/");
    calc.inputDigit("0");
    calc.equals();
    calc.backspace();
    expect(calc.getResult()).toBe("0");
  });

  it("не выполняет equals без оператора", () => {
    const calc = new Calculator();
    calc.inputDigit("5");
    expect(calc.equals()).toBeNull();
    expect(calc.getResult()).toBe("5");
  });

  it("не выполняет backspace после выбора оператора (freshStart)", () => {
    const calc = new Calculator();
    calc.inputDigit("1");
    calc.inputDigit("2");
    calc.setOperator("+");
    calc.backspace();
    expect(calc.getResult()).toBe("12");
  });

  it("ограничивает длину ввода 12 цифрами", () => {
    const calc = new Calculator();
    "1234567890123".split("").forEach((d) => calc.inputDigit(d));
    expect(calc.getResult()).toBe("123456789012");
  });

  it("приводит одиночный символ к нулю через backspace", () => {
    const calc = new Calculator();
    calc.inputDigit("5");
    calc.backspace();
    expect(calc.getResult()).toBe("0");
  });

  it("начинает новый ввод цифры после ошибки", () => {
    const calc = new Calculator();
    calc.inputDigit("1");
    calc.setOperator("/");
    calc.inputDigit("0");
    calc.equals();
    calc.inputDigit("8");
    expect(calc.getResult()).toBe("8");
  });
});

describe("HistoryStore", () => {
  it("загружает и сохраняет записи", () => {
    const store = new HistoryStore();
    store.load(JSON.stringify([{ text: "1 + 1 = 2", at: "2026-01-01T10:00:00.000Z" }]));
    expect(store.entries).toHaveLength(1);
    expect(store.serialize()).toContain("1 + 1 = 2");
  });

  it("отбрасывает некорректные записи при загрузке", () => {
    const store = new HistoryStore();
    store.load(JSON.stringify([{ text: 123 }, null, { text: "ok" }]));
    expect(store.entries).toEqual([{ text: "ok" }]);
  });

  it("возвращает пустой журнал при битых данных", () => {
    const store = new HistoryStore();
    store.load("{invalid");
    expect(store.entries).toEqual([]);
  });

  it("ограничивает число записей", () => {
    const store = new HistoryStore("calc-history", 2);
    store.add("a");
    store.add("b");
    store.add("c");
    expect(store.entries.map((e) => e.text)).toEqual(["c", "b"]);
  });

  it("очищает журнал", () => {
    const store = new HistoryStore();
    store.add("1 + 1 = 2");
    store.clear();
    expect(store.entries).toEqual([]);
  });
});

describe("formatHistoryTime", () => {
  it("возвращает пустую строку для некорректной даты", () => {
    expect(formatHistoryTime("invalid-date")).toBe("");
  });

  it("форматирует корректную ISO-дату", () => {
    const formatted = formatHistoryTime("2026-08-08T12:30:00.000Z");
    expect(formatted).toMatch(/\d{2}\.\d{2}/);
  });
});
