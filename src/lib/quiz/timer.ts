export function expiresAt(startedAt: Date, durationMinutes: number): Date {
  return new Date(startedAt.getTime() + durationMinutes * 60_000);
}

export function remainingSeconds(startedAt: Date, durationMinutes: number, now = new Date()): number {
  return Math.max(0, Math.ceil((expiresAt(startedAt, durationMinutes).getTime() - now.getTime()) / 1000));
}

export function isExpired(startedAt: Date, durationMinutes: number, now = new Date()): boolean {
  return remainingSeconds(startedAt, durationMinutes, now) === 0;
}

export function canResumeSession(status: string, startedAt: Date | null, durationMinutes: number, allowResume: boolean, now = new Date()): boolean {
  return allowResume && status === "IN_PROGRESS" && startedAt !== null && !isExpired(startedAt, durationMinutes, now);
}
