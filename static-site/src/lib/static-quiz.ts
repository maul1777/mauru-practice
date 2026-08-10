import { shuffle, type RandomSource } from "./quiz/shuffle";

export interface StaticOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface StaticQuestion {
  id: string;
  material: string;
  topic?: string;
  text: string;
  explanation?: string;
  options: StaticOption[];
}

export interface QuizItem extends StaticQuestion {
  selectedOptionId?: string;
  flagged: boolean;
}

export interface QuizSession {
  participantName: string;
  startedAt: number;
  deadline: number;
  questions: QuizItem[];
}

export interface QuizResult {
  score: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  breakdown: { name: string; correct: number; total: number }[];
}

export function createQuiz(
  questions: readonly StaticQuestion[],
  count: number,
  durationMinutes: number,
  participantName: string,
  random: RandomSource = Math.random,
  now = Date.now(),
): QuizSession {
  const safeCount = Math.max(1, Math.min(Math.floor(count), questions.length));
  const safeDuration = Math.max(1, Math.floor(durationMinutes));
  return {
    participantName: participantName.trim(),
    startedAt: now,
    deadline: now + safeDuration * 60_000,
    questions: shuffle(questions, random).slice(0, safeCount).map((question) => ({
      ...question,
      options: shuffle(question.options, random),
      flagged: false,
    })),
  };
}

export function calculateQuizResult(session: QuizSession): QuizResult {
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  const breakdown = new Map<string, { correct: number; total: number }>();

  for (const question of session.questions) {
    const selected = question.options.find((option) => option.id === question.selectedOptionId);
    if (!selected) unansweredCount += 1;
    else if (selected.isCorrect) correctCount += 1;
    else incorrectCount += 1;

    const name = question.topic || question.material;
    const item = breakdown.get(name) ?? { correct: 0, total: 0 };
    item.total += 1;
    if (selected?.isCorrect) item.correct += 1;
    breakdown.set(name, item);
  }

  return {
    score: session.questions.length === 0 ? 0 : Math.round((correctCount / session.questions.length) * 100),
    correctCount,
    incorrectCount,
    unansweredCount,
    breakdown: [...breakdown].map(([name, value]) => ({ name, ...value })),
  };
}
