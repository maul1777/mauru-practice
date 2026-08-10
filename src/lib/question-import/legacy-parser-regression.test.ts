import { describe, expect, it } from "vitest";
import { parseMarkdownBank } from "./markdown-parser";
import { validateQuestion } from "./validator";

describe("legacy option parsing regression", () => {
  it("tidak membaca B. di dalam kalimat opsi C sebagai opsi baru", () => {
    const legacy = [
      "##### 1. Marine",
      "",
      '1. Actual Total Loss terjadi bila: A. Kapal hancur. B. Kapal hilang. C. Benar A dan B. D. Kapal mogok.',
      "",
      "##### Kunci Jawaban",
      "",
      "No,Kunci",
      "1,C",
    ].join("\n");
    const result = parseMarkdownBank(legacy);

    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].options.map((option) => option.id)).toEqual(["A", "B", "C", "D"]);
    expect(result.questions[0].options.map((option) => option.text)).toEqual([
      "Kapal hancur.",
      "Kapal hilang.",
      "Benar A dan B.",
      "Kapal mogok.",
    ]);
    expect(result.questions[0].options.find((option) => option.isCorrect)?.id).toBe("C");
  });

  it("menolak ID opsi duplikat", () => {
    const issues = validateQuestion({
      material: "Marine",
      text: "Pertanyaan",
      tags: [],
      options: [
        { id: "B", text: "Satu", isCorrect: true },
        { id: "B", text: "Dua", isCorrect: false },
      ],
    });

    expect(issues).toContainEqual(expect.objectContaining({ level: "error", message: "ID opsi duplikat terdeteksi." }));
  });
});
