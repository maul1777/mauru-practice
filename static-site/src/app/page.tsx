import { readFileSync } from "node:fs";
import { join } from "node:path";
import { StaticQuizApp } from "./static-quiz-app";
import { parseMarkdownBank } from "@/lib/question-import/markdown-parser";
import type { StaticQuestion } from "@/lib/static-quiz";

export default function Home() {
  // Bank lama tetap tersimpan di data/, tetapi disembunyikan selama fokus Sesi 2.
  const bankFiles = [
    "aapai-sesi-2.md",
    "aapai-sesi-2-100.md",
    "aapai-sesi-2-set-2-100.md",
    "aapai-original-sesi-2-tambahan-1.md",
    "aapai-original-sesi-2-tambahan-2.md",
  ];
  const parsedQuestions = bankFiles.flatMap((fileName) =>
    parseMarkdownBank(readFileSync(join(process.cwd(), "data", fileName), "utf8")).questions,
  );
  const questions: StaticQuestion[] = parsedQuestions.map((question, questionIndex) => ({
    id: question.externalId || "question-" + (questionIndex + 1),
    material: question.material,
    topic: question.topic,
    text: question.text,
    explanation: question.explanation,
    options: question.options.map((option, optionIndex) => ({
      id: (question.externalId || "question-" + (questionIndex + 1)) + "-option-" + (optionIndex + 1),
      text: option.text,
      isCorrect: option.isCorrect,
    })),
  }));

  if (questions.length === 0) {
    throw new Error("Bank soal tidak menghasilkan pertanyaan yang valid.");
  }

  return <StaticQuizApp questions={questions} />;
}
