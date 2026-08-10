import Link from "next/link";

export default function Home() {
  return <main className="shell"><header className="topbar"><div className="container brand">MTryOut Simulator</div></header><div className="container hero">
    <section><div className="eyebrow">Latihan cerdas, progres nyata</div><h1>Kuasai materi asuransi, satu soal setiap waktu.</h1><p className="lead">Latihan soal terstruktur dengan materi yang dapat dipilih, timer yang adil, penyimpanan otomatis, dan pembahasan setelah selesai.</p></section>
    <section className="card"><h2>Mulai latihan</h2><p className="muted">Tidak perlu akun. Kami hanya meminta nama untuk mencatat sesi latihan Anda.</p><form action="/quiz/config" method="get"><div className="field"><label htmlFor="name">Nama Peserta</label><input className="input" id="name" name="name" minLength={2} maxLength={100} required autoFocus placeholder="Masukkan nama Anda" /></div><button className="button" style={{width:"100%"}}>Lanjutkan</button></form><p className="muted" style={{fontSize:12,marginTop:16}}>Admin? <Link href="/admin/login" style={{color:"var(--brand)",fontWeight:700}}>Masuk di sini</Link></p></section>
  </div></main>;
}
