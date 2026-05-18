import {
  appendCalculatorDigit,
  appendCalculatorOperator,
  evaluateCalculatorExpression,
  formatCalculatorExpressionForDisplay,
  normalizeCalculatorExpression,
  roundCalculatorResult,
} from "../lib/calculatorEvaluate";

describe("calculatorEvaluate", () => {
  it("respects operator precedence", () => {
    expect(evaluateCalculatorExpression("1+2*3")).toBe(7);
    expect(evaluateCalculatorExpression("10-2/2")).toBe(9);
  });

  it("normalizes display operators", () => {
    expect(normalizeCalculatorExpression("12 × 3 ÷ 2")).toBe("12*3/2");
    expect(evaluateCalculatorExpression("12 × 3 ÷ 2")).toBe(18);
  });

  it("formats for display", () => {
    expect(formatCalculatorExpressionForDisplay("12+3*4")).toBe("12 + 3 × 4");
  });

  it("appends digits and operators", () => {
    expect(appendCalculatorDigit("", "5")).toBe("5");
    expect(appendCalculatorDigit("12+", "3")).toBe("3");
    expect(appendCalculatorOperator("12+3", "*")).toBe("12+3*");
    expect(appendCalculatorOperator("12+", "/")).toBe("12/");
  });

  it("rounds results", () => {
    expect(roundCalculatorResult(1.005, 2)).toBe(1.01);
  });
});
