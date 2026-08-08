import { questionHash } from "../security";

export interface DuplicateCandidate { externalId?: string; text: string }
export interface ExistingQuestion { id: string; externalId: string | null; normalizedHash: string }

export function detectDuplicate(candidate: DuplicateCandidate, existing: readonly ExistingQuestion[]): ExistingQuestion | undefined {
  const hash = questionHash(candidate.text);
  return existing.find((question) =>
    (candidate.externalId && question.externalId === candidate.externalId) || question.normalizedHash === hash,
  );
}
