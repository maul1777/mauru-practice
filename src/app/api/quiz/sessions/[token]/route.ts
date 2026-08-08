import { NextResponse } from "next/server";
import { getParticipantSession, participantSessionDto } from "@/lib/quiz/session-service";

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params;
  const session = await getParticipantSession(token);
  if (!session) return NextResponse.json({ error: "Sesi tidak ditemukan." }, { status: 404 });
  return NextResponse.json(participantSessionDto(session));
}
