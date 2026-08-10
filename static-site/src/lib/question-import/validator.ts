import type { ParseIssue, ParsedQuestion } from "./types";

export function validateQuestion(question: ParsedQuestion): ParseIssue[] {
  const issues: ParseIssue[] = [];
  const label = question.externalId ?? question.text.slice(0, 60);
  if (!question.material.trim()) issues.push({ level: "error", question: label, message: "Material wajib diisi." });
  if (!question.text.trim()) issues.push({ level: "error", question: label, message: "Pertanyaan wajib diisi." });
  if (question.options.length < 2) issues.push({ level: "error", question: label, message: "Minimal dua opsi diperlukan." });
  if (question.options.some((option) => !option.id.trim() || !option.text.trim())) {
    issues.push({ level: "error", question: label, message: "ID dan teks opsi wajib diisi." });
  }
  if (new Set(question.options.map((option) => option.id.trim().toUpperCase())).size !== question.options.length) {
    issues.push({ level: "error", question: label, message: "ID opsi duplikat terdeteksi." });
  }
  if (new Set(question.options.map((option) => option.text.trim().toLocaleLowerCase("id-ID"))).size !== question.options.length) {
    issues.push({ level: "error", question: label, message: "Opsi duplikat terdeteksi." });
  }
  if (question.options.filter((option) => option.isCorrect).length === 0) {
    issues.push({ level: "error", question: label, message: "Jawaban benar tidak ditemukan." });
  }
  if (!question.explanation) issues.push({ level: "warning", question: label, message: "Pembahasan tidak tersedia." });
  return issues;
}
