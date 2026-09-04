import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseMarkdownBank } from "./question-import/markdown-parser";

const banks = [
  { file: "aapai-original-sesi-2-tambahan-1.md", material: "Original Sesi 2 - Tambahan 1", count: 85 },
  { file: "aapai-original-sesi-2-tambahan-2.md", material: "Original Sesi 2 - Tambahan 2", count: 90 },
] as const;

describe("bank Original Sesi 2 tambahan", () => {
  it.each(banks)("memuat $count soal dengan opsi unik dan satu kunci ($material)", ({ file, material, count }) => {
    const markdown = readFileSync(join(process.cwd(), "data", file), "utf8");
    const result = parseMarkdownBank(markdown);
    const errors = result.issues.filter((issue) => issue.level === "error");
    const normalizedQuestions = result.questions.map((question) =>
      question.text.toLowerCase().replace(/[^a-z0-9]/g, ""),
    );

    expect(errors).toEqual([]);
    expect(result.questions).toHaveLength(count);
    expect(new Set(normalizedQuestions).size).toBe(count);
    expect(result.questions.every((question) => question.material === material)).toBe(true);
    expect(result.questions.every((question) => Boolean(question.topic))).toBe(true);
    expect(result.questions.every((question) => Boolean(question.explanation))).toBe(true);
    expect(result.questions.every((question) => question.options.length >= 4)).toBe(true);
    expect(result.questions.every((question) => new Set(question.options.map((option) => option.text)).size === question.options.length)).toBe(true);
    expect(result.questions.every((question) => question.options.filter((option) => option.isCorrect).length === 1)).toBe(true);
  });

  it.each(banks)("tidak memakai opsi yang bergantung pada label A sampai E ($material)", ({ file }) => {
    const markdown = readFileSync(join(process.cwd(), "data", file), "utf8");
    const result = parseMarkdownBank(markdown);
    const unsafeOption = /(?:semua\s+(?:jawaban\s+)?(?:benar|salah)|jawaban\s+[a-e](?:\s+(?:dan|atau)\s+[a-e])+|^(?:[a-e]\s*,\s*)+[a-e]\s+dan\s+[a-e]$|peristiwa(?:\s+pada)?\s+[a-e]\s+(?:dan|atau)\s+[a-e])/i;

    const violations = result.questions.flatMap((question) =>
      question.options
        .filter((option) => unsafeOption.test(option.text))
        .map((option) => `${question.externalId}: ${option.text}`),
    );

    expect(violations).toEqual([]);
  });
});
