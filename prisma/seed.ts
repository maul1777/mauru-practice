import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { questionHash } from "../src/lib/security";

const db = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@example.com").toLowerCase();
  const password = process.env.ADMIN_INITIAL_PASSWORD;
  if (!password || password.length < 12) throw new Error("ADMIN_INITIAL_PASSWORD wajib diisi minimal 12 karakter sebelum seed.");
  await db.adminUser.upsert({ where: { email }, update: {}, create: { email, name: "Administrator", passwordHash: await bcrypt.hash(password, 12) } });
  await db.appSetting.upsert({ where: { key: "quiz" }, update: {}, create: { key: "quiz", value: { allowAnswerReview: true, showCorrectAnswer: true, showExplanation: true, defaultDuration: 30, durationOptions: [10,15,30,45,60], defaultQuestionCount: 10, questionCountOptions: [10,20,30,50], shuffleQuestions: true, shuffleOptions: true, autoSubmitOnTimeout: true, allowResumeSession: true } } });
  const materials = ["Marine Insurance", "Property Insurance", "Engineering Insurance"];
  for (const name of materials) await db.material.upsert({ where: { name }, update: {}, create: { name } });
  const marine = await db.material.findUniqueOrThrow({ where: { name: "Marine Insurance" } });
  const topic = await db.topic.findFirst({ where: { materialId: marine.id, parentId: null, name: "Marine Cargo" } }) ?? await db.topic.create({ data: { materialId: marine.id, name: "Marine Cargo" } });
  const text = "Apabila barang dibuang ke laut secara sengaja untuk menyelamatkan kapal, tindakan tersebut disebut?";
  if (!(await db.question.findFirst({ where: { normalizedHash: questionHash(text) } }))) await db.question.create({ data: { materialId: marine.id, topicId: topic.id, text, normalizedHash: questionHash(text), difficulty: "EASY", explanation: "Jettison adalah tindakan membuang sebagian cargo untuk keselamatan bersama.", source: "seed", options: { create: [{ text: "Jettison", isCorrect: true, sortOrder: 0 }, { text: "Collision", isCorrect: false, sortOrder: 1 }, { text: "Particular Average", isCorrect: false, sortOrder: 2 }, { text: "Salvage", isCorrect: false, sortOrder: 3 }] } } });
}

main().finally(async () => db.$disconnect());
