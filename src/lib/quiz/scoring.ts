export interface ScorableAnswer {
  selectedOptionIds: readonly string[];
  correctOptionIds: readonly string[];
}

export interface ScoreResult {
  score: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
}

function sameSet(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && new Set(left).size === left.length && left.every((value) => right.includes(value));
}

export function scoreAnswers(answers: readonly ScorableAnswer[]): ScoreResult {
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  for (const answer of answers) {
    if (answer.selectedOptionIds.length === 0) unansweredCount += 1;
    else if (sameSet(answer.selectedOptionIds, answer.correctOptionIds)) correctCount += 1;
    else incorrectCount += 1;
  }
  return {
    score: answers.length === 0 ? 0 : Math.round((correctCount / answers.length) * 10_000) / 100,
    correctCount,
    incorrectCount,
    unansweredCount,
  };
}
