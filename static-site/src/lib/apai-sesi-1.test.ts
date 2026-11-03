import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseMarkdownBank } from "./question-import/markdown-parser";

const banks = [
  { edition: 37, file: "apai-37-8-januari-2025.md", material: "APAI 37 - 8 Januari 2025", count: 50 },
  { edition: 38, file: "apai-38-15-juli-2025.md", material: "APAI 38 - 15 Juli 2025", count: 75 },
  { edition: 39, file: "apai-39-14-oktober-2025.md", material: "APAI 39 - 14 Oktober 2025", count: 80 },
  { edition: 40, file: "apai-40-sesi-1-5-mei-2026.md", material: "APAI 40 Sesi 1 - 5 Mei 2026", count: 90 },
];

describe("bank soal APAI Sesi 1", () => {
  it.each(banks)("memuat $count soal APAI $edition dengan satu kunci dan pembahasan", ({ edition, file, material, count }) => {
    const result = parseMarkdownBank(readFileSync(join(process.cwd(), "data", file), "utf8"));
    const ids = Array.from({ length: count }, (_, index) => `apai-${edition}-${String(index + 1).padStart(3, "0")}`);

    expect(result.issues).toEqual([]);
    expect(result.questions.map((question) => question.externalId)).toEqual(ids);

    for (const question of result.questions) {
      expect(question.material).toBe(material);
      expect(question.explanation).toBeTruthy();
      expect(question.options.filter((option) => option.isCorrect)).toHaveLength(1);
      expect(question.options).toHaveLength(question.externalId === "apai-38-008" ? 3 : 4);
    }
  });

  it("mempertahankan kunci yang ditandai dan menjelaskan selisih sumber pada APAI 38 soal 8", () => {
    const result = parseMarkdownBank(readFileSync(join(process.cwd(), "data", "apai-38-15-juli-2025.md"), "utf8"));
    const question = result.questions.find((item) => item.externalId === "apai-38-008");

    expect(question?.options.find((option) => option.isCorrect)?.text).toBe("POJK 70 tahun 2016 pasal 2");
    expect(question?.explanation).toContain("pembahasan dan kunci sumber tidak konsisten");
  });
});
