import { db } from "@/lib/db";
import { getQuizSettings } from "@/lib/settings";
import { QuizConfigForm } from "./quiz-config-form";

export default async function QuizConfigPage({ searchParams }: { searchParams: Promise<{ name?: string }> }) {
  const { name = "" } = await searchParams;
  const [materials, settings] = await Promise.all([db.material.findMany({ where: { active: true }, orderBy: { sortOrder: "asc" }, include: { topics: { where: { active: true }, orderBy: { sortOrder: "asc" } } } }), getQuizSettings()]);
  return <main><header className="topbar"><div className="container brand">MTryOut Simulator</div></header><div className="container" style={{paddingBlock:40,maxWidth:820}}><h1 style={{fontSize:"2.6rem"}}>Atur latihanmu</h1><p className="lead">Pilih materi, jumlah soal, dan durasi. Sistem akan mengacak soal dengan distribusi yang seimbang.</p><QuizConfigForm participantName={name} materials={materials} settings={settings} /></div></main>;
}
