import { NextResponse } from "next/server";
import { availableQuestionCount } from "@/lib/quiz/session-service";

export async function POST(request: Request) {
  const body = await request.json();
  const count = await availableQuestionCount({ materialIds: body.materialIds ?? [], topicIds: body.topicIds ?? [], difficulties: body.difficulties ?? [] });
  return NextResponse.json({ count });
}
