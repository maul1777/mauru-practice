import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseMarkdownBank } from "./question-import/markdown-parser";

describe("bank soal AAPAI 20 Oktober 2025", () => {
  it("memuat 89 soal unik dengan empat opsi dan satu kunci", () => {
    const markdown = readFileSync(join(process.cwd(), "data", "aapai-20-okt-2025.md"), "utf8");
    const result = parseMarkdownBank(markdown);
    const errors = result.issues.filter((issue) => issue.level === "error");
    const normalizedQuestions = result.questions.map((question) =>
      question.text.toLowerCase().replace(/[^a-z0-9]/g, ""),
    );

    expect(errors).toEqual([]);
    expect(result.questions).toHaveLength(89);
    expect(new Set(normalizedQuestions).size).toBe(89);
    expect(result.questions.every((question) => question.material === "AAPAI - 20 Oktober 2025")).toBe(true);
    expect(result.questions.every((question) => question.options.length === 4)).toBe(true);
    expect(result.questions.every((question) => new Set(question.options.map((option) => option.text)).size === 4)).toBe(true);
    expect(result.questions.every((question) => question.options.filter((option) => option.isCorrect).length === 1)).toBe(true);
  });

  it("menghasilkan ID unik saat digabungkan dengan seluruh bank", () => {
    const bankDirectory = join(process.cwd(), "data");
    const bankFiles = readdirSync(bankDirectory).filter((fileName) => fileName.endsWith(".md"));
    const questions = bankFiles.flatMap((fileName) => {
      const markdown = readFileSync(join(bankDirectory, fileName), "utf8");
      return parseMarkdownBank(markdown).questions;
    });
    const ids = questions.map((question) => question.externalId);

    expect(ids).not.toContain(undefined);
    expect(new Set(ids).size).toBe(questions.length);
  });
});
