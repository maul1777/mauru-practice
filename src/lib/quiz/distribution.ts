import { shuffle, type RandomSource } from "./shuffle";

export interface DistributableQuestion {
  id: string;
  materialId: string;
}

export function distributeQuestions<T extends DistributableQuestion>(
  questions: readonly T[],
  selectedMaterialIds: readonly string[],
  requestedCount: number,
  random: RandomSource = Math.random,
): T[] {
  if (!Number.isInteger(requestedCount) || requestedCount < 1) return [];
  const materialIds = [...new Set(selectedMaterialIds)];
  if (materialIds.length === 0) return shuffle(questions, random).slice(0, requestedCount);

  const pools = new Map(materialIds.map((id) => [id, shuffle(questions.filter((q) => q.materialId === id), random)]));
  const result: T[] = [];
  let cursor = 0;

  while (result.length < requestedCount) {
    let selectedInRound = false;
    for (let offset = 0; offset < materialIds.length && result.length < requestedCount; offset += 1) {
      const materialId = materialIds[(cursor + offset) % materialIds.length];
      const item = pools.get(materialId)?.shift();
      if (item) {
        result.push(item);
        selectedInRound = true;
      }
    }
    if (!selectedInRound) break;
    cursor = (cursor + 1) % materialIds.length;
  }

  return shuffle(result, random);
}
