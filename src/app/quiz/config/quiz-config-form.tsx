"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { QuizSettings } from "@/lib/settings";

type Material = { id: string; name: string; topics: { id: string; name: string }[] };
export function QuizConfigForm({ participantName, materials, settings }: { participantName: string; materials: Material[]; settings: QuizSettings }) {
  const router = useRouter();
  const [name, setName] = useState(participantName);
  const [materialIds, setMaterials] = useState<string[]>(materials.map((m) => m.id));
  const [topicIds, setTopics] = useState<string[]>([]);
  const [durationMinutes, setDuration] = useState(settings.defaultDuration);
  const [questionCount, setQuestionCount] = useState(settings.defaultQuestionCount);
  const [available, setAvailable] = useState(0);
  const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const visibleTopics = useMemo(() => materials.filter((m) => materialIds.includes(m.id)).flatMap((m) => m.topics), [materials, materialIds]);
  useEffect(() => { const timer = setTimeout(() => fetch("/api/quiz/availability", { method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({materialIds,topicIds}) }).then((r)=>r.json()).then((d)=>setAvailable(d.count)).catch(()=>setError("Gagal menghitung soal tersedia.")), 150); return () => clearTimeout(timer); }, [materialIds, topicIds]);
  const toggle = (value: string, values: string[], setter: (next: string[]) => void) => setter(values.includes(value) ? values.filter((id)=>id!==value) : [...values,value]);
  async function submit(event: React.FormEvent) { event.preventDefault(); setError(""); setLoading(true); try { const response=await fetch("/api/quiz/sessions",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({participantName:name,durationMinutes,questionCount,materialIds,topicIds})}); const data=await response.json(); if(!response.ok) throw new Error(data.error); router.push(`/quiz/${data.publicToken}`); } catch(e){setError(e instanceof Error?e.message:"Gagal memulai latihan.");setLoading(false);} }
  return <form className="card stack" onSubmit={submit}><div className="field"><label>Nama Peserta</label><input className="input" value={name} minLength={2} maxLength={100} onChange={(e)=>setName(e.target.value)} required /></div><div><div className="label" style={{marginBottom:10}}>Materi</div><div className="choices">{materials.map((m)=><label className="choice" key={m.id}><input type="checkbox" checked={materialIds.includes(m.id)} onChange={()=>toggle(m.id,materialIds,setMaterials)} />{m.name}</label>)}</div></div>{visibleTopics.length>0&&<div><div className="label" style={{marginBottom:10}}>Submateri (opsional)</div><div className="choices">{visibleTopics.map((t)=><label className="choice" key={t.id}><input type="checkbox" checked={topicIds.includes(t.id)} onChange={()=>toggle(t.id,topicIds,setTopics)} />{t.name}</label>)}</div></div>}<div className="grid-2"><div className="field"><label>Durasi</label><select className="select" value={durationMinutes} onChange={(e)=>setDuration(Number(e.target.value))}>{settings.durationOptions.map((v)=><option key={v} value={v}>{v} menit</option>)}</select></div><div className="field"><label>Jumlah Soal</label><select className="select" value={questionCount} onChange={(e)=>setQuestionCount(Number(e.target.value))}>{settings.questionCountOptions.map((v)=><option key={v} value={v}>{v} soal</option>)}{available>0&&<option value={available}>Semua ({available})</option>}</select></div></div><div className={`notice ${questionCount>available?"error":""}`}>Tersedia <strong>{available} soal</strong>{questionCount>available&&" — kurangi jumlah soal atau perluas filter."}</div>{error&&<div className="notice error">{error}</div>}<button className="button" disabled={loading||materialIds.length===0||questionCount>available||available===0}>{loading?"Menyiapkan sesi…":"Mulai Latihan"}</button></form>;
}
