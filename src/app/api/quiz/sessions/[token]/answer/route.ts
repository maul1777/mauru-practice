import { NextResponse } from "next/server";
import { z } from "zod";
import { saveAnswer } from "@/lib/quiz/session-service";

const schema = z.object({ sessionQuestionId: z.string(), optionIds: z.array(z.string()), flagged: z.boolean().optional() });
export async function PATCH(request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await context.params;
    const input = schema.parse(await request.json());
    await saveAnswer(token, input.sessionQuestionId, input.optionIds, input.flagged);
    return NextResponse.json({ ok: true });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Gagal menyimpan." }, { status: 400 }); }
}
