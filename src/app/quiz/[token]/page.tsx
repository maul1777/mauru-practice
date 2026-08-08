import { notFound, redirect } from "next/navigation";
import { getParticipantSession, participantSessionDto } from "@/lib/quiz/session-service";
import { QuizRunner } from "./quiz-runner";

export default async function QuizPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const session = await getParticipantSession(token);
  if (!session) notFound();
  if (session.status !== "IN_PROGRESS" && session.resultCode) redirect(`/result/${session.resultCode}`);
  return <QuizRunner initial={participantSessionDto(session)} />;
}
