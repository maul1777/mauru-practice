import { describe, expect, it } from "vitest";
import { questionHash } from "../security";
import { detectDuplicate } from "./duplicate-detector";
import { parseMarkdownBank } from "./markdown-parser";

const valid = `---
id: marine-001
material: Marine Insurance
topic: Marine Cargo
difficulty: medium
tags: Cargo, GA
---
# Question
Apa istilah membuang cargo untuk keselamatan bersama?
## Options
* Jettison
* Collision
* Salvage
## Answer
Jettison
## Explanation
Jettison adalah pembuangan cargo secara sengaja.
---`;

describe("deterministic markdown parser", () => {
  it("parses a valid question", () => {
    const result = parseMarkdownBank(valid);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].options.find((option) => option.isCorrect)?.text).toBe("Jettison");
    expect(result.questions[0].difficulty).toBe("MEDIUM");
  });

  it.each([
    ["answer tidak ditemukan", valid.replace("Jettison\n## Explanation", "Unknown\n## Explanation"), "Jawaban benar tidak ditemukan"],
    ["option kurang", valid.replace("* Collision\n* Salvage\n", ""), "Minimal dua opsi"],
    ["duplicate option", valid.replace("* Salvage", "* Collision"), "Opsi duplikat"],
    ["missing material", valid.replace("material: Marine Insurance", "material: "), "Material wajib"],
    ["malformed answer", valid.replace("## Answer", "## Answers"), "Jawaban benar"],
  ])("reports %s", (_name, markdown, message) => {
    expect(parseMarkdownBank(markdown).issues.some((issue) => issue.message.includes(message))).toBe(true);
  });

  it("allows a missing explanation as a warning", () => {
    const result = parseMarkdownBank(valid.replace(/## Explanation[\s\S]*?---$/, "---"));
    expect(result.questions).toHaveLength(1);
    expect(result.issues).toContainEqual(expect.objectContaining({ level: "warning" }));
  });
});

describe("legacy parser", () => {
  it("maps per-section answer keys", () => {
    const legacy = `##### 1. Marine Insurance

1. Pertanyaan pertama? A. Salah B. Benar C. Salah lagi D. Bukan

##### Kunci Jawaban Komprehensif

No,Kunci
1,B`;
    const result = parseMarkdownBank(legacy);
    expect(result.questions).toHaveLength(1);
    expect(result.questions[0].options.find((option) => option.isCorrect)?.id).toBe("B");
  });
});

describe("duplicate detector", () => {
  it("detects external IDs and normalized question text", () => {
    const existing = [{ id: "1", externalId: null, normalizedHash: questionHash("  Pertanyaan SAMA ") }];
    expect(detectDuplicate({ text: "pertanyaan sama" }, existing)?.id).toBe("1");
  });
});
