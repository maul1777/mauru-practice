import { NextResponse } from "next/server";
import { finalizeSession } from "@/lib/quiz/session-service";

export async function POST(_request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    const result = await finalizeSession(token);
    return NextResponse.json({ resultCode: result.resultCode });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menyelesaikan sesi." }, { status: 400 }); }
}
