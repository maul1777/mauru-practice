import { readFileSync } from "node:fs";
import { join } from "node:path";
import { StaticQuizApp } from "./static-quiz-app";
import { parseMarkdownBank } from "@/lib/question-import/markdown-parser";
import type { StaticQuestion } from "@/lib/static-quiz";

export default function Home() {
  const markdown = readFileSync(join(process.cwd(), "data", "bank-soal.md"), "utf8");
  const parsed = parseMarkdownBank(markdown);
  const questions: StaticQuestion[] = parsed.questions.map((question, questionIndex) => ({
    id: question.externalId || "question-" + (questionIndex + 1),
    material: question.material,
    topic: question.topic,
    text: question.text,
    explanation: question.explanation,
    options: question.options.map((option, optionIndex) => ({
      id: (question.externalId || "question-" + (questionIndex + 1)) + "-option-" + (option.id || optionIndex + 1),
      text: option.text,
      isCorrect: option.isCorrect,
    })),
  }));

  if (questions.length === 0) {
    throw new Error("Bank soal tidak menghasilkan pertanyaan yang valid.");
  }

  return <StaticQuizApp questions={questions} />;
}
