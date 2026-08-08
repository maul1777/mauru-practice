import { SessionStatus } from "@prisma/client";
import { db } from "../db";
import { resultCode, secureToken } from "../security";
import { getQuizSettings } from "../settings";
import { distributeQuestions } from "./distribution";
import { scoreAnswers } from "./scoring";
import { shuffle } from "./shuffle";
import { isExpired, remainingSeconds } from "./timer";

export interface CreateSessionInput {
  participantName: string;
  durationMinutes: number;
  questionCount: number;
  materialIds: string[];
  topicIds?: string[];
  difficulties?: ("EASY" | "MEDIUM" | "HARD")[];
}

export async function availableQuestionCount(input: Pick<CreateSessionInput, "materialIds" | "topicIds" | "difficulties">): Promise<number> {
  return db.question.count({ where: {
    status: "ACTIVE",
    materialId: input.materialIds.length ? { in: input.materialIds } : undefined,
    topicId: input.topicIds?.length ? { in: input.topicIds } : undefined,
    difficulty: input.difficulties?.length ? { in: input.difficulties } : undefined,
  } });
}

export async function createTrainingSession(input: CreateSessionInput) {
  const available = await availableQuestionCount(input);
  if (input.questionCount < 1 || input.questionCount > available) throw new Error(`Jumlah soal harus 1–${available}.`);
  if (input.durationMinutes < 1 || input.durationMinutes > 240) throw new Error("Durasi harus 1–240 menit.");
  const settings = await getQuizSettings();
  const questions = await db.question.findMany({
    where: { status: "ACTIVE", materialId: input.materialIds.length ? { in: input.materialIds } : undefined, topicId: input.topicIds?.length ? { in: input.topicIds } : undefined, difficulty: input.difficulties?.length ? { in: input.difficulties } : undefined },
    include: { material: true, topic: true, options: { orderBy: { sortOrder: "asc" } } },
  });
  const selected = distributeQuestions(questions, input.materialIds, input.questionCount);
  const ordered = settings.shuffleQuestions ? shuffle(selected) : selected;
  const now = new Date();
  return db.$transaction(async (tx) => {
    const participant = await tx.participant.create({ data: { name: input.participantName.trim() } });
    return tx.trainingSession.create({
      data: {
        publicToken: secureToken(), participantId: participant.id, durationMinutes: input.durationMinutes,
        questionCount: ordered.length, selectedMaterialIds: input.materialIds, selectedTopicIds: input.topicIds ?? [],
        selectedDifficulties: input.difficulties ?? [], status: "IN_PROGRESS", startedAt: now,
        questions: { create: ordered.map((question, orderIndex) => {
          const options = settings.shuffleOptions ? shuffle(question.options) : question.options;
          return {
            questionId: question.id, orderIndex,
            questionSnapshot: { text: question.text, imageUrl: question.imageUrl, type: question.type },
            optionsSnapshot: options.map((option) => ({ id: option.id, text: option.text })),
            correctOptionIds: question.options.filter((option) => option.isCorrect).map((option) => option.id),
            materialSnapshot: question.material.name, topicSnapshot: question.topic?.name,
            explanationSnapshot: question.explanation,
            answer: { create: { selectedOptionIds: [] } },
          };
        }) },
      }, select: { publicToken: true },
    });
  });
}

export async function finalizeSession(token: string, timeout = false) {
  return db.$transaction(async (tx) => {
    const session = await tx.trainingSession.findUnique({ where: { publicToken: token }, include: { questions: { include: { answer: true } } } });
    if (!session) throw new Error("Sesi tidak ditemukan.");
    if (session.status === SessionStatus.COMPLETED || session.status === SessionStatus.TIMEOUT) return session;
    const expired = session.startedAt ? isExpired(session.startedAt, session.durationMinutes) : false;
    const answers = session.questions.map((question) => ({ selectedOptionIds: question.answer?.selectedOptionIds ?? [], correctOptionIds: question.correctOptionIds }));
    const result = scoreAnswers(answers);
    await Promise.all(session.questions.map((question) => tx.trainingAnswer.update({ where: { sessionQuestionId: question.id }, data: { isCorrect: question.answer?.selectedOptionIds.length ? equalSets(question.answer.selectedOptionIds, question.correctOptionIds) : null } })));
    return tx.trainingSession.update({ where: { id: session.id }, data: { ...result, status: timeout || expired ? "TIMEOUT" : "COMPLETED", finishedAt: new Date(), resultCode: resultCode() } });
  });
}

export async function getParticipantSession(token: string) {
  let session = await db.trainingSession.findUnique({ where: { publicToken: token }, include: { participant: true, questions: { orderBy: { orderIndex: "asc" }, include: { answer: true } } } });
  if (session?.status === "IN_PROGRESS" && session.startedAt && isExpired(session.startedAt, session.durationMinutes)) {
    await finalizeSession(token, true);
    session = await db.trainingSession.findUnique({ where: { publicToken: token }, include: { participant: true, questions: { orderBy: { orderIndex: "asc" }, include: { answer: true } } } });
  }
  return session;
}

export async function saveAnswer(token: string, sessionQuestionId: string, optionIds: string[], flagged?: boolean) {
  const session = await db.trainingSession.findUnique({ where: { publicToken: token }, include: { questions: true } });
  if (!session || session.status !== "IN_PROGRESS" || !session.startedAt || isExpired(session.startedAt, session.durationMinutes)) throw new Error("Sesi tidak aktif.");
  const question = session.questions.find((item) => item.id === sessionQuestionId);
  if (!question) throw new Error("Soal tidak termasuk sesi ini.");
  const options = question.optionsSnapshot as unknown as { id: string }[];
  if (optionIds.some((id) => !options.some((option) => option.id === id))) throw new Error("Pilihan jawaban tidak valid.");
  return db.trainingAnswer.update({ where: { sessionQuestionId }, data: { selectedOptionIds: optionIds, answeredAt: optionIds.length ? new Date() : null, ...(typeof flagged === "boolean" ? { isFlagged: flagged } : {}) } });
}

export function participantSessionDto(session: NonNullable<Awaited<ReturnType<typeof getParticipantSession>>>) {
  return {
    token: session.publicToken, participantName: session.participant.name, status: session.status,
    startedAt: session.startedAt?.toISOString(), durationMinutes: session.durationMinutes,
    resultCode: session.resultCode, remainingSeconds: session.startedAt ? remainingSeconds(session.startedAt, session.durationMinutes) : 0,
    questions: session.questions.map((question) => ({
      id: question.id, orderIndex: question.orderIndex, question: question.questionSnapshot as unknown as { text: string; imageUrl?: string },
      options: question.optionsSnapshot as unknown as { id: string; text: string }[], material: question.materialSnapshot, topic: question.topicSnapshot ?? undefined,
      selectedOptionIds: question.answer?.selectedOptionIds ?? [], flagged: question.answer?.isFlagged ?? false,
    })),
  };
}

function equalSets(left: string[], right: string[]): boolean { return left.length === right.length && left.every((id) => right.includes(id)); }
