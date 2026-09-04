import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseMarkdownBank } from "./question-import/markdown-parser";

describe("bank soal AAPAI Sesi 2 100 soal", () => {
  it("memuat 100 soal dengan empat opsi unik, satu kunci, dan pembahasan", () => {
    const markdown = readFileSync(join(process.cwd(), "data", "aapai-sesi-2-100.md"), "utf8");
    const result = parseMarkdownBank(markdown);
    const errors = result.issues.filter((issue) => issue.level === "error");
    const normalizedQuestions = result.questions.map((question) =>
      question.text.toLowerCase().replace(/[^a-z0-9]/g, ""),
    );

    expect(errors).toEqual([]);
    expect(result.questions).toHaveLength(100);
    expect(new Set(normalizedQuestions).size).toBe(100);
    expect(result.questions.every((question) => question.material === "Tambahan Sesi 2 - Set 1 - 100 Soal")).toBe(true);
    expect(result.questions.every((question) => Boolean(question.topic))).toBe(true);
    expect(result.questions.every((question) => Boolean(question.explanation))).toBe(true);
    expect(result.questions.every((question) => question.options.length === 4)).toBe(true);
    expect(result.questions.every((question) => new Set(question.options.map((option) => option.text)).size === 4)).toBe(true);
    expect(result.questions.every((question) => question.options.filter((option) => option.isCorrect).length === 1)).toBe(true);
  });

  it("tidak memakai opsi yang bergantung pada label A sampai D", () => {
    const markdown = readFileSync(join(process.cwd(), "data", "aapai-sesi-2-100.md"), "utf8");
    const result = parseMarkdownBank(markdown);
    const unsafeOption = /(?:semua\s+(?:jawaban\s+)?(?:benar|salah)|jawaban\s+[a-d](?:\s+(?:dan|atau)\s+[a-d])+|^(?:[a-d]\s*,\s*)+[a-d]\s+dan\s+[a-d]$|peristiwa(?:\s+pada)?\s+[a-d]\s+(?:dan|atau)\s+[a-d])/i;

    const violations = result.questions.flatMap((question) =>
      question.options
        .filter((option) => unsafeOption.test(option.text))
        .map((option) => `${question.externalId}: ${option.text}`),
    );

    expect(violations).toEqual([]);
  });
});
