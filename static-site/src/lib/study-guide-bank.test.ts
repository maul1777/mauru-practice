import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseMarkdownBank } from "./question-import/markdown-parser";

function parseBank(fileName: string) {
  return parseMarkdownBank(readFileSync(join(process.cwd(), "data", fileName), "utf8"));
}

describe("AAPAI Sesi 1 study guide", () => {
  it("menambahkan 110 soal valid ke 500 soal lama", () => {
    const original = parseBank("bank-soal.md");
    const studyGuide = parseBank("aapai-sesi-1-study-guide.md");
    const errors = studyGuide.issues.filter((issue) => issue.level === "error");
    const combinedIds = [...original.questions, ...studyGuide.questions].map((question) => question.externalId);

    expect(errors).toEqual([]);
    expect(original.questions).toHaveLength(500);
    expect(studyGuide.questions).toHaveLength(110);
    expect(new Set(combinedIds).size).toBe(610);
    expect(studyGuide.questions.every((question) => question.material === "AAPAI Sesi 1 - Study Guide")).toBe(true);
    expect(studyGuide.questions.every((question) => question.options.filter((option) => option.isCorrect).length === 1)).toBe(true);
  });
});
