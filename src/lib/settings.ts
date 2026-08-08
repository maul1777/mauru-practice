import { db } from "./db";

export interface QuizSettings {
  allowAnswerReview: boolean;
  showCorrectAnswer: boolean;
  showExplanation: boolean;
  defaultDuration: number;
  durationOptions: number[];
  defaultQuestionCount: number;
  questionCountOptions: number[];
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  autoSubmitOnTimeout: boolean;
  allowResumeSession: boolean;
}

export const defaultSettings: QuizSettings = {
  allowAnswerReview: true, showCorrectAnswer: true, showExplanation: true,
  defaultDuration: 30, durationOptions: [10, 15, 30, 45, 60],
  defaultQuestionCount: 20, questionCountOptions: [10, 20, 30, 50],
  shuffleQuestions: true, shuffleOptions: true, autoSubmitOnTimeout: true, allowResumeSession: true,
};

export async function getQuizSettings(): Promise<QuizSettings> {
  const setting = await db.appSetting.findUnique({ where: { key: "quiz" } });
  return setting ? { ...defaultSettings, ...(setting.value as Partial<QuizSettings>) } : defaultSettings;
}
