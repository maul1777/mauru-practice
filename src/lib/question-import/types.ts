export type ParsedDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface ParsedOption { id: string; text: string; isCorrect: boolean }

export interface ParsedQuestion {
  externalId?: string;
  material: string;
  topic?: string;
  text: string;
  options: ParsedOption[];
  explanation?: string;
  difficulty?: ParsedDifficulty;
  tags: string[];
  imageUrl?: string;
}

export interface ParseIssue {
  level: "error" | "warning";
  question?: string;
  message: string;
}

export interface ParseResult { questions: ParsedQuestion[]; issues: ParseIssue[] }
