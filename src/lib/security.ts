import { createHash, randomBytes } from "node:crypto";

export function secureToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}

export function resultCode(): string {
  return `RESULT-${randomBytes(10).toString("hex").toUpperCase()}`;
}

export function normalizedQuestionText(text: string): string {
  return text.normalize("NFKC").toLocaleLowerCase("id-ID").replace(/\s+/g, " ").trim();
}

export function questionHash(text: string): string {
  return createHash("sha256").update(normalizedQuestionText(text)).digest("hex");
}
