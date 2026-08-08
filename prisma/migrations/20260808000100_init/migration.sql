-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "QuestionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'MULTIPLE_ANSWER');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('CREATED', 'IN_PROGRESS', 'COMPLETED', 'TIMEOUT', 'ABANDONED');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PREVIEW', 'COMPLETED', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "ImportItemStatus" AS ENUM ('IMPORTED', 'SKIPPED', 'DUPLICATE', 'FAILED', 'REPLACED');

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Material" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Material_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Topic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "normalizedHash" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "topicId" TEXT,
    "type" "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "text" TEXT NOT NULL,
    "explanation" TEXT,
    "imageUrl" TEXT,
    "difficulty" "Difficulty",
    "status" "QuestionStatus" NOT NULL DEFAULT 'ACTIVE',
    "source" TEXT,
    "createdById" TEXT,
    "updatedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionTag" (
    "questionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "QuestionTag_pkey" PRIMARY KEY ("questionId","tagId")
);

-- CreateTable
CREATE TABLE "QuestionImport" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "status" "ImportStatus" NOT NULL DEFAULT 'PREVIEW',
    "totalCount" INTEGER NOT NULL DEFAULT 0,
    "validCount" INTEGER NOT NULL DEFAULT 0,
    "warningCount" INTEGER NOT NULL DEFAULT 0,
    "importedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "QuestionImport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionImportItem" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "externalId" TEXT,
    "questionText" TEXT,
    "status" "ImportItemStatus" NOT NULL,
    "message" TEXT,

    CONSTRAINT "QuestionImportItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "publicToken" TEXT NOT NULL,
    "resultCode" TEXT,
    "participantId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL,
    "questionCount" INTEGER NOT NULL,
    "selectedMaterialIds" TEXT[],
    "selectedTopicIds" TEXT[],
    "selectedDifficulties" "Difficulty"[],
    "status" "SessionStatus" NOT NULL DEFAULT 'CREATED',
    "score" DECIMAL(5,2),
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "incorrectCount" INTEGER NOT NULL DEFAULT 0,
    "unansweredCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingSessionQuestion" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT,
    "orderIndex" INTEGER NOT NULL,
    "questionSnapshot" JSONB NOT NULL,
    "optionsSnapshot" JSONB NOT NULL,
    "correctOptionIds" TEXT[],
    "materialSnapshot" TEXT NOT NULL,
    "topicSnapshot" TEXT,
    "explanationSnapshot" TEXT,

    CONSTRAINT "TrainingSessionQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingAnswer" (
    "id" TEXT NOT NULL,
    "sessionQuestionId" TEXT NOT NULL,
    "selectedOptionIds" TEXT[],
    "isFlagged" BOOLEAN NOT NULL DEFAULT false,
    "isCorrect" BOOLEAN,
    "answeredAt" TIMESTAMP(3),
    "responseTimeMs" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE INDEX "Participant_name_idx" ON "Participant"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Material_name_key" ON "Material"("name");

-- CreateIndex
CREATE INDEX "Material_active_sortOrder_idx" ON "Material"("active", "sortOrder");

-- CreateIndex
CREATE INDEX "Topic_materialId_active_sortOrder_idx" ON "Topic"("materialId", "active", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Topic_materialId_parentId_name_key" ON "Topic"("materialId", "parentId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Question_externalId_key" ON "Question"("externalId");

-- CreateIndex
CREATE INDEX "Question_normalizedHash_idx" ON "Question"("normalizedHash");

-- CreateIndex
CREATE INDEX "Question_materialId_status_idx" ON "Question"("materialId", "status");

-- CreateIndex
CREATE INDEX "Question_topicId_status_idx" ON "Question"("topicId", "status");

-- CreateIndex
CREATE INDEX "Question_difficulty_status_idx" ON "Question"("difficulty", "status");

-- CreateIndex
CREATE INDEX "Question_createdAt_idx" ON "Question"("createdAt");

-- CreateIndex
CREATE INDEX "QuestionOption_questionId_sortOrder_idx" ON "QuestionOption"("questionId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "QuestionTag_tagId_idx" ON "QuestionTag"("tagId");

-- CreateIndex
CREATE INDEX "QuestionImport_createdAt_idx" ON "QuestionImport"("createdAt");

-- CreateIndex
CREATE INDEX "QuestionImportItem_importId_status_idx" ON "QuestionImportItem"("importId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingSession_publicToken_key" ON "TrainingSession"("publicToken");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingSession_resultCode_key" ON "TrainingSession"("resultCode");

-- CreateIndex
CREATE INDEX "TrainingSession_status_createdAt_idx" ON "TrainingSession"("status", "createdAt");

-- CreateIndex
CREATE INDEX "TrainingSession_participantId_createdAt_idx" ON "TrainingSession"("participantId", "createdAt");

-- CreateIndex
CREATE INDEX "TrainingSession_startedAt_idx" ON "TrainingSession"("startedAt");

-- CreateIndex
CREATE INDEX "TrainingSessionQuestion_questionId_idx" ON "TrainingSessionQuestion"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingSessionQuestion_sessionId_orderIndex_key" ON "TrainingSessionQuestion"("sessionId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingAnswer_sessionQuestionId_key" ON "TrainingAnswer"("sessionQuestionId");

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Topic" ADD CONSTRAINT "Topic_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTag" ADD CONSTRAINT "QuestionTag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionTag" ADD CONSTRAINT "QuestionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionImport" ADD CONSTRAINT "QuestionImport_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionImportItem" ADD CONSTRAINT "QuestionImportItem_importId_fkey" FOREIGN KEY ("importId") REFERENCES "QuestionImport"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSessionQuestion" ADD CONSTRAINT "TrainingSessionQuestion_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingSessionQuestion" ADD CONSTRAINT "TrainingSessionQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingAnswer" ADD CONSTRAINT "TrainingAnswer_sessionQuestionId_fkey" FOREIGN KEY ("sessionQuestionId") REFERENCES "TrainingSessionQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
