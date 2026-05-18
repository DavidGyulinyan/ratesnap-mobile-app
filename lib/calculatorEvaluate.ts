import { create, all } from "mathjs";

/** Sandboxed math.js instance for calculator expressions only. */
const math = create(all, {});

const OPERATOR_CHARS = new Set(["+", "-", "*", "/"]);

/**
 * Normalize UI symbols (× ÷) and strip unsafe characters before evaluation.
 */
export function normalizeCalculatorExpression(raw: string): string {
  return raw
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/\s+/g, "")
    .replace(/[^0-9+\-*/().]/g, "");
}

export function isValidCalculatorExpression(raw: string): boolean {
  const normalized = normalizeCalculatorExpression(raw);
  if (!normalized) return false;
  if (/[+\-*/]{2,}/.test(normalized.replace(/\(-/g, ""))) return false;
  if (/[+\-*/.]$/.test(normalized)) return false;
  return /^[\d.+\-*/()]+$/.test(normalized);
}

/** Human-readable equation with spaced operators (× ÷). */
export function formatCalculatorExpressionForDisplay(raw: string): string {
  const normalized = normalizeCalculatorExpression(raw);
  if (!normalized) return "";

  let out = "";
  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (OPERATOR_CHARS.has(ch)) {
      const symbol =
        ch === "*" ? "×" : ch === "/" ? "÷" : ch;
      out += ` ${symbol} `;
    } else {
      out += ch;
    }
  }
  return out.replace(/\s+/g, " ").trim();
}

/**
 * Evaluate a basic arithmetic expression. Returns null if invalid or non-finite.
 */
export function evaluateCalculatorExpression(
  raw: string
): number | null {
  const expression = normalizeCalculatorExpression(raw);
  if (!expression || !isValidCalculatorExpression(expression)) {
    return null;
  }

  try {
    const value = math.evaluate(expression);
    const n =
      typeof value === "number"
        ? value
        : value != null && typeof value === "object" && "toNumber" in value
          ? Number((value as { toNumber: () => number }).toNumber())
          : Number(value);

    if (!Number.isFinite(n)) return null;
    return n;
  } catch {
    return null;
  }
}

export function roundCalculatorResult(
  value: number,
  decimalPlaces: number
): number {
  const factor = 10 ** decimalPlaces;
  return Math.round(value * factor) / factor;
}

/** Append digit/decimal to the current entry segment (calculator-style). */
export function appendCalculatorDigit(
  currentSegment: string,
  digit: string
): string {
  if (digit !== "." && !/^\d$/.test(digit)) return currentSegment;

  if (
    !currentSegment ||
    (currentSegment === "0" && digit !== ".")
  ) {
    return digit === "." ? "0." : digit;
  }

  const last = currentSegment.slice(-1);
  if (OPERATOR_CHARS.has(last) || last === "(") {
    return digit === "." ? "0." : digit;
  }

  if (
    digit === "." &&
    /\.\d*$/.test(currentSegment.split(/[+\-*/]/).pop() ?? currentSegment)
  ) {
    return currentSegment;
  }

  return currentSegment + digit;
}

/** Append or replace trailing operator. */
export function appendCalculatorOperator(
  expression: string,
  operator: "+" | "-" | "*" | "/"
): string {
  const trimmed = expression.trim();
  if (!trimmed) return "";

  const last = trimmed.slice(-1);
  if (OPERATOR_CHARS.has(last)) {
    return trimmed.slice(0, -1) + operator;
  }

  if (/[0-9.)]$/.test(trimmed)) {
    return trimmed + operator;
  }

  return trimmed;
}
