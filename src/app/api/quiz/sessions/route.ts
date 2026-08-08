import { NextResponse } from "next/server";
import { z } from "zod";
import { createTrainingSession } from "@/lib/quiz/session-service";

const schema = z.object({ participantName: z.string().trim().min(2).max(100), durationMinutes: z.number().int().min(1).max(240), questionCount: z.number().int().min(1).max(500), materialIds: z.array(z.string()).min(1), topicIds: z.array(z.string()).optional(), difficulties: z.array(z.enum(["EASY", "MEDIUM", "HARD"])).optional() });

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    return NextResponse.json(await createTrainingSession(input), { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Konfigurasi tidak valid." }, { status: 400 });
  }
}
