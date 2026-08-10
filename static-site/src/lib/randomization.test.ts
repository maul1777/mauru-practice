import { describe, expect, it } from "vitest";
import { createQuiz, type StaticQuestion } from "./static-quiz";

const questions: StaticQuestion[] = [
  { id: "q1", material: "A", text: "Satu", options: [{ id: "a", text: "A", isCorrect: true }, { id: "b", text: "B", isCorrect: false }] },
  { id: "q2", material: "A", text: "Dua", options: [{ id: "a", text: "A", isCorrect: true }, { id: "b", text: "B", isCorrect: false }] },
  { id: "q3", material: "A", text: "Tiga", options: [{ id: "a", text: "A", isCorrect: true }, { id: "b", text: "B", isCorrect: false }] },
];

describe("pengacakan sesi", () => {
  it("menghasilkan urutan soal berbeda dari sumber acak berbeda", () => {
    const first = createQuiz(questions, 3, 10, "Peserta", () => 0, 0);
    const second = createQuiz(questions, 3, 10, "Peserta", () => 0.999, 0);

    expect(first.questions.map((question) => question.id)).not.toEqual(second.questions.map((question) => question.id));
  });
});
