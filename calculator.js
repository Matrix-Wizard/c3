export const OP_SYMBOL = { "+": "+", "-": "−", "*": "×", "/": "÷" };

export function formatDisplay(numStr) {
  if (numStr === "Ошибка") return numStr;
  const n = parseFloat(String(numStr).replace(",", "."));
  if (!Number.isFinite(n)) return "0";
  const s = String(n);
  return s.includes(".") ? s.replace(".", ",") : s;
}

export function toNumber(str) {
  return parseFloat(String(str).replace(",", "."));
}

export function compute(a, op, b) {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      if (b === 0) return null;
      return a / b;
    default:
      return b;
  }
}

export class Calculator {
  constructor() {
    this.reset();
  }

  reset() {
    this.current = "0";
    this.stored = null;
    this.pendingOp = null;
    this.freshStart = false;
  }

  getResult() {
    return formatDisplay(this.current);
  }

  getExpression() {
    if (this.stored !== null && this.pendingOp) {
      return formatDisplay(String(this.stored)) + " " + OP_SYMBOL[this.pendingOp];
    }
    return "";
  }

  inputDigit(d) {
    if (this.freshStart || this.current === "Ошибка") {
      this.current = d;
      this.freshStart = false;
    } else if (this.current === "0") {
      this.current = d;
    } else if (this.current.replace("-", "").replace(",", "").length < 12) {
      this.current += d;
    }
  }

  inputDecimal() {
    if (this.freshStart || this.current === "Ошибка") {
      this.current = "0,";
      this.freshStart = false;
    } else if (!this.current.includes(",")) {
      this.current += ",";
    }
  }

  clearAll() {
    this.reset();
  }

  backspace() {
    if (this.current === "Ошибка") {
      this.reset();
      return;
    }
    if (this.freshStart) return;
    if (
      this.current.length <= 1 ||
      (this.current.length === 2 && this.current.startsWith("-"))
    ) {
      this.current = "0";
    } else {
      this.current = this.current.slice(0, -1);
    }
  }

  applyPending() {
    if (this.stored === null || !this.pendingOp) return;
    const a = this.stored;
    const b = toNumber(this.current);
    const out = compute(a, this.pendingOp, b);
    if (out === null) {
      this.current = "Ошибка";
      this.stored = null;
      this.pendingOp = null;
      this.freshStart = true;
      return;
    }
    this.stored = out;
    this.current = String(out);
  }

  setOperator(op) {
    if (this.current === "Ошибка") return;
    const value = toNumber(this.current);
    if (this.stored !== null && this.pendingOp && !this.freshStart) {
      this.applyPending();
      if (this.current === "Ошибка") return;
      this.stored = toNumber(this.current);
    } else {
      this.stored = value;
    }
    this.pendingOp = op;
    this.freshStart = true;
  }

  equals() {
    if (this.pendingOp === null || this.stored === null || this.current === "Ошибка") {
      return null;
    }
    const a = this.stored;
    const b = toNumber(this.current);
    const op = this.pendingOp;
    this.applyPending();
    const line =
      formatDisplay(String(a)) +
      " " +
      OP_SYMBOL[op] +
      " " +
      formatDisplay(String(b)) +
      " = " +
      formatDisplay(this.current);
    this.pendingOp = null;
    this.stored = null;
    this.freshStart = true;
    return line;
  }

  percent() {
    if (this.current === "Ошибка") return;
    const n = toNumber(this.current) / 100;
    this.current = String(n);
  }
}

export const HISTORY_MAX = 50;

export function formatHistoryTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export class HistoryStore {
  constructor(storageKey = "calc-history", maxEntries = HISTORY_MAX) {
    this.storageKey = storageKey;
    this.maxEntries = maxEntries;
    this.entries = [];
  }

  load(rawStorage) {
    try {
      const parsed = rawStorage ? JSON.parse(rawStorage) : [];
      this.entries = Array.isArray(parsed)
        ? parsed.filter((e) => e && typeof e.text === "string").slice(0, this.maxEntries)
        : [];
    } catch {
      this.entries = [];
    }
    return this.entries;
  }

  serialize() {
    return JSON.stringify(this.entries);
  }

  add(text, at = new Date().toISOString()) {
    this.entries.unshift({ text, at });
    if (this.entries.length > this.maxEntries) {
      this.entries.length = this.maxEntries;
    }
  }

  clear() {
    this.entries = [];
  }
}
