import { describe, expect, it } from "vitest";
import { calculateQuizResult, createQuiz, type StaticQuestion } from "./static-quiz";

const questions: StaticQuestion[] = [
  {
    id: "q1",
    material: "Dasar",
    text: "Pertanyaan pertama",
    options: [
      { id: "a", text: "Benar", isCorrect: true },
      { id: "b", text: "Salah", isCorrect: false },
    ],
  },
  {
    id: "q2",
    material: "Dasar",
    topic: "Risiko",
    text: "Pertanyaan kedua",
    options: [
      { id: "a", text: "Salah", isCorrect: false },
      { id: "b", text: "Benar", isCorrect: true },
    ],
  },
];

describe("static quiz", () => {
  it("membatasi jumlah soal dan membuat deadline", () => {
    const session = createQuiz(questions, 99, 10, "  Maulana  ", () => 0.5, 1_000);
    expect(session.participantName).toBe("Maulana");
    expect(session.questions).toHaveLength(2);
    expect(session.deadline).toBe(601_000);
  });

  it("menghitung benar, salah, kosong, dan breakdown", () => {
    const session = createQuiz(questions, 2, 10, "Maulana", () => 0.999, 0);
    session.questions[0].selectedOptionId = "a";
    const result = calculateQuizResult(session);
    expect(result).toMatchObject({ score: 50, correctCount: 1, incorrectCount: 0, unansweredCount: 1 });
    expect(result.breakdown).toHaveLength(2);
  });
});
