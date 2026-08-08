import { randomUUID } from "node:crypto";
import type { ParseResult, ParsedDifficulty, ParsedOption, ParsedQuestion } from "./types";
import { validateQuestion } from "./validator";

const difficultyMap: Record<string, ParsedDifficulty> = { easy: "EASY", medium: "MEDIUM", hard: "HARD", mudah: "EASY", sedang: "MEDIUM", sulit: "HARD" };

export function parseMarkdownBank(markdown: string): ParseResult {
  return markdown.includes("## Options") && markdown.includes("## Answer")
    ? parseDeterministic(markdown)
    : parseLegacyBank(markdown);
}

function parseDeterministic(markdown: string): ParseResult {
  const questions: ParsedQuestion[] = [];
  const issues: ParseResult["issues"] = [];
  const blocks = markdown.split(/(?=^---\s*\r?\n(?=id:|material:))/gm).filter((block) => block.includes("# Question"));
  for (const block of blocks) {
    const metadata: Record<string, string> = {};
    for (const match of block.matchAll(/^([a-zA-Z][\w-]*):[ \t]*(.*)$/gm)) metadata[match[1].toLowerCase()] = match[2].trim();
    const text = section(block, "# Question", "## Options");
    const optionTexts = section(block, "## Options", "## Answer").split(/\r?\n/).map((line) => line.replace(/^\s*[-*]\s+/, "").trim()).filter(Boolean);
    const answerText = section(block, "## Answer", "## Explanation").replace(/\r?\n---\s*$/, "").trim();
    const tags = metadata.tags?.split(",").map((tag) => tag.trim()).filter(Boolean) ?? [];
    const question: ParsedQuestion = {
      externalId: metadata.id,
      material: metadata.material ?? "",
      topic: metadata.topic,
      text,
      options: optionTexts.map((option) => ({ id: randomUUID(), text: option, isCorrect: normalize(option) === normalize(answerText) })),
      explanation: block.includes("## Explanation") ? section(block, "## Explanation", "").replace(/\r?\n---\s*$/, "").trim() : undefined,
      difficulty: difficultyMap[metadata.difficulty?.toLowerCase()],
      tags,
      imageUrl: metadata.image,
    };
    const validation = validateQuestion(question);
    issues.push(...validation);
    if (!validation.some((issue) => issue.level === "error")) questions.push(question);
  }
  return { questions, issues };
}

function parseLegacyBank(markdown: string): ParseResult {
  const questions: ParsedQuestion[] = [];
  const issues: ParseResult["issues"] = [];
  const keyStart = markdown.search(/^#####\s+Kunci Jawaban/im);
  const body = keyStart >= 0 ? markdown.slice(0, keyStart) : markdown;
  const keyBody = keyStart >= 0 ? markdown.slice(keyStart) : "";
  const answerKeys = parseLegacyAnswerKeys(keyBody);
  const sections = [...body.matchAll(/^#####\s+(?:\d+\.\s*)?(.+)$/gm)];

  sections.forEach((heading, sectionIndex) => {
    const start = (heading.index ?? 0) + heading[0].length;
    const end = sections[sectionIndex + 1]?.index ?? body.length;
    const material = cleanText(heading[1]);
    const content = body.slice(start, end);
    const entries = [...content.matchAll(/^\s*(\d+)\.\s+(.+?)(?=\r?\n\s*\r?\n|$)/gms)];
    entries.forEach((entry) => {
      const questionNumber = Number(entry[1]);
      const parsed = parseInlineOptions(cleanText(entry[2]));
      if (!parsed) {
        issues.push({ level: "error", question: `${material} #${questionNumber}`, message: "Opsi A/B tidak dapat dipisahkan." });
        return;
      }
      const correctLetter = answerKeys[sectionIndex]?.get(questionNumber);
      const question: ParsedQuestion = {
        externalId: `legacy-${sectionIndex + 1}-${questionNumber}`,
        material,
        text: parsed.text,
        options: parsed.options.map((option) => ({ ...option, isCorrect: option.id === correctLetter })),
        tags: [],
      };
      const validation = validateQuestion(question);
      issues.push(...validation);
      if (!validation.some((issue) => issue.level === "error")) questions.push(question);
    });
  });
  return { questions, issues };
}

function parseLegacyAnswerKeys(keyBody: string): Map<number, string>[] {
  const maps: Map<number, string>[] = [];
  const rows = keyBody.split(/\r?\n/).filter((line) => /^\d+,[A-D](?:,|$)/i.test(line.trim()));
  for (const row of rows) {
    const cells = row.split(",").map((cell) => cell.trim());
    for (let index = 0; index + 1 < cells.length; index += 2) {
      const number = Number(cells[index]);
      const answer = cells[index + 1]?.toUpperCase();
      if (number > 0 && /^[A-D]$/.test(answer)) {
        const sectionIndex = Math.floor((number - 1) / 100);
        const localNumber = ((number - 1) % 100) + 1;
        maps[sectionIndex] ??= new Map();
        maps[sectionIndex].set(localNumber, answer);
      }
    }
  }
  return maps;
}

function parseInlineOptions(value: string): { text: string; options: ParsedOption[] } | null {
  const matches = [...value.matchAll(/(?:^|\s)([A-H])\.\s+/g)];
  if (matches.length < 2) return null;
  const text = value.slice(0, matches[0].index).trim();
  const options = matches.map((match, index) => ({
    id: match[1],
    text: value.slice((match.index ?? 0) + match[0].length, matches[index + 1]?.index ?? value.length).trim(),
    isCorrect: false,
  }));
  return { text, options };
}

function section(block: string, startHeading: string, endHeading: string): string {
  const start = block.indexOf(startHeading);
  if (start < 0) return "";
  const contentStart = start + startHeading.length;
  const end = endHeading ? block.indexOf(endHeading, contentStart) : block.length;
  return block.slice(contentStart, end < 0 ? block.length : end).trim();
}

function cleanText(value: string): string {
  return value.replace(/\*\*/g, "").replace(/\u00c2\u00a0/g, " ").replace(/\s+/g, " ").trim();
}

function normalize(value: string): string {
  return cleanText(value).normalize("NFKC").toLocaleLowerCase("id-ID");
}
