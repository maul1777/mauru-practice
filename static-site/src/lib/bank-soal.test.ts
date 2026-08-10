import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseMarkdownBank } from "./question-import/markdown-parser";

describe("bank soal statis", () => {
  it("memuat seluruh 500 soal dengan jawaban benar", () => {
    const markdown = readFileSync(join(process.cwd(), "data", "bank-soal.md"), "utf8");
    const result = parseMarkdownBank(markdown);
    const errors = result.issues.filter((issue) => issue.level === "error");

    expect(errors).toEqual([]);
    expect(result.questions).toHaveLength(500);
    expect(result.questions.every((question) => question.options.some((option) => option.isCorrect))).toBe(true);
  });
});
