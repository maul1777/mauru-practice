import { describe, expect, it } from "vitest";
import { distributeQuestions } from "./distribution";
import { scoreAnswers } from "./scoring";
import { shuffle } from "./shuffle";
import { canResumeSession, isExpired, remainingSeconds } from "./timer";

describe("shuffle", () => {
  it("preserves every element and does not mutate input", () => {
    const input = [1, 2, 3, 4];
    const output = shuffle(input, () => 0);
    expect(output).toEqual([2, 3, 4, 1]);
    expect(input).toEqual([1, 2, 3, 4]);
  });
});

describe("balanced distribution", () => {
  it("balances materials and redistributes unavailable quota", () => {
    const questions = [
      ...Array.from({ length: 2 }, (_, index) => ({ id: `a${index}`, materialId: "a" })),
      ...Array.from({ length: 6 }, (_, index) => ({ id: `b${index}`, materialId: "b" })),
      ...Array.from({ length: 6 }, (_, index) => ({ id: `c${index}`, materialId: "c" })),
    ];
    const selected = distributeQuestions(questions, ["a", "b", "c"], 9, () => 0.5);
    expect(selected).toHaveLength(9);
    expect(selected.filter((item) => item.materialId === "a")).toHaveLength(2);
    expect(selected.filter((item) => item.materialId === "b").length).toBeGreaterThanOrEqual(3);
    expect(selected.filter((item) => item.materialId === "c").length).toBeGreaterThanOrEqual(3);
  });
});

describe("scoring", () => {
  it("handles correct, incorrect and unanswered answers", () => {
    expect(scoreAnswers([
      { selectedOptionIds: ["a"], correctOptionIds: ["a"] },
      { selectedOptionIds: ["b"], correctOptionIds: ["c"] },
      { selectedOptionIds: [], correctOptionIds: ["d"] },
      { selectedOptionIds: ["x", "y"], correctOptionIds: ["y", "x"] },
    ])).toEqual({ score: 50, correctCount: 2, incorrectCount: 1, unansweredCount: 1 });
  });
});

describe("timer", () => {
  const startedAt = new Date("2026-01-01T00:00:00Z");
  it("uses the server start time", () => {
    expect(remainingSeconds(startedAt, 10, new Date("2026-01-01T00:05:00Z"))).toBe(300);
    expect(isExpired(startedAt, 10, new Date("2026-01-01T00:10:00Z"))).toBe(true);
    expect(canResumeSession("IN_PROGRESS", startedAt, 10, true, new Date("2026-01-01T00:09:59Z"))).toBe(true);
    expect(canResumeSession("IN_PROGRESS", startedAt, 10, true, new Date("2026-01-01T00:10:00Z"))).toBe(false);
  });
});
