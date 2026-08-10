import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { parseMarkdownBank } from "./question-import/markdown-parser";

describe("integritas bank soal statis", () => {
  it("setiap soal memiliki tepat empat opsi A sampai D yang unik", () => {
    const markdown = readFileSync(join(process.cwd(), "data", "bank-soal.md"), "utf8");
    const result = parseMarkdownBank(markdown);

    expect(result.questions).toHaveLength(500);
    expect(result.issues.filter((issue) => issue.level === "error")).toEqual([]);
    for (const question of result.questions) {
      expect(question.options.map((option) => option.id), question.externalId).toEqual(["A", "B", "C", "D"]);
      expect(new Set(question.options.map((option) => option.text)).size, question.externalId).toBe(4);
    }
  });

  it("tidak memiliki opsi yang bergantung pada label atau posisi", () => {
    const bankFiles = ["bank-soal.md", "aapai-sesi-1-study-guide.md", "aapai-23-juli-2025.md"];
    const unsafeOption = /^(?:benar\s+(?:semua|[a-h]\s+(?:dan|atau)\s+[a-h])|semua\s+(?:jawaban\s+)?(?:benar|salah)|[a-h]\.\s*[a-h]\s+dan\s+[a-h]\s+(?:benar|salah)|kedua\s+jawaban\s+di\s+atas)/i;
    const violations: string[] = [];

    for (const bankFile of bankFiles) {
      const markdown = readFileSync(join(process.cwd(), "data", bankFile), "utf8");
      const result = parseMarkdownBank(markdown);
      for (const question of result.questions) {
        for (const option of question.options) {
          if (unsafeOption.test(option.text.trim())) {
            violations.push(`${question.externalId ?? question.text}: ${option.text}`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("setiap pertanyaan dapat dipahami tanpa soal sebelumnya", () => {
    const bankFiles = ["bank-soal.md", "aapai-sesi-1-study-guide.md", "aapai-23-juli-2025.md"];
    const crossReference = /(?:\bsoal\s+(?:(?:nomor\s+)?\d+|sebelumnya)\b|\b(?:kasus|data(?:\s+akun)?)\s+yang\s+sama\b|\b(?:kasus|soal)\s+sebelumnya\b|\bpenutupan\s+tersebut\b|\bmenggunakan\s+data\s+PT\s+Maju\s+Jaya\b|\bpada\s+kasus\s+crane\b)/i;
    const violations: string[] = [];

    for (const bankFile of bankFiles) {
      const markdown = readFileSync(join(process.cwd(), "data", bankFile), "utf8");
      const result = parseMarkdownBank(markdown);
      for (const question of result.questions) {
        const learningContent = `${question.text}\n${question.explanation ?? ""}`;
        if (crossReference.test(learningContent)) {
          violations.push(`${question.externalId ?? bankFile}: ${learningContent}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

});
