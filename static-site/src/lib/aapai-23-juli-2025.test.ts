import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseMarkdownBank } from "./question-import/markdown-parser";

describe("bank soal AAPAI 23 Juli 2025", () => {
  it("memuat 85 soal lengkap dengan empat opsi dan satu kunci", () => {
    const markdown = readFileSync(join(process.cwd(), "data", "aapai-23-juli-2025.md"), "utf8");
    const result = parseMarkdownBank(markdown);
    const errors = result.issues.filter((issue) => issue.level === "error");

    expect(errors).toEqual([]);
    expect(result.questions).toHaveLength(85);
    expect(result.questions.every((question) => question.material === "AAPAI - 23 Juli 2025")).toBe(true);
    expect(result.questions.every((question) => question.options.length === 4)).toBe(true);
    expect(result.questions.every((question) => new Set(question.options.map((option) => option.text)).size === 4)).toBe(true);
    expect(result.questions.every((question) => question.options.filter((option) => option.isCorrect).length === 1)).toBe(true);
  });

  it("menghasilkan 695 ID unik saat digabungkan dengan kedua bank lama", () => {
    const bankFiles = ["bank-soal.md", "aapai-sesi-1-study-guide.md", "aapai-23-juli-2025.md"];
    const questions = bankFiles.flatMap((fileName) => {
      const markdown = readFileSync(join(process.cwd(), "data", fileName), "utf8");
      return parseMarkdownBank(markdown).questions;
    });
    const ids = questions.map((question) => question.externalId);

    expect(questions).toHaveLength(695);
    expect(new Set(ids).size).toBe(695);
  });
});
