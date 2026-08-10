"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  calculateQuizResult,
  createQuiz,
  type QuizSession,
  type StaticQuestion,
} from "@/lib/static-quiz";

type Screen = "welcome" | "config" | "quiz" | "result";

interface SavedState {
  version: 2;
  screen: Screen;
  name: string;
  selectedMaterials: string[];
  questionCount: number;
  durationMinutes: number;
  currentQuestion: number;
  session?: QuizSession;
}

const STORAGE_KEY = "mauru-practice-static-v2";
const QUESTION_COUNT_OPTIONS = [10, 20, 50, 100];
const DURATION_OPTIONS = [10, 20, 30, 60];

function isSavedState(value: unknown): value is SavedState {
  if (!value || typeof value !== "object") return false;
  const state = value as Partial<SavedState>;
  const validScreen = state.screen === "welcome" || state.screen === "config" || state.screen === "quiz" || state.screen === "result";
  const validSession = state.session === undefined || (
    typeof state.session === "object" &&
    typeof state.session.participantName === "string" &&
    typeof state.session.deadline === "number" &&
    Array.isArray(state.session.questions)
  );
  return state.version === 2 && validScreen && typeof state.name === "string" &&
    Array.isArray(state.selectedMaterials) && typeof state.questionCount === "number" &&
    typeof state.durationMinutes === "number" && typeof state.currentQuestion === "number" &&
    validSession;
}

function subscribeToBrowser() {
  return () => undefined;
}

function loadSavedState(materials: readonly string[]): SavedState | undefined {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const saved: unknown = JSON.parse(raw);
    if (!isSavedState(saved)) return undefined;
    return {
      ...saved,
      selectedMaterials: saved.selectedMaterials.filter((material) => materials.includes(material)),
    };
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return undefined;
  }
}

export function StaticQuizApp({ questions }: { questions: StaticQuestion[] }) {
  const isBrowser = useSyncExternalStore(subscribeToBrowser, () => true, () => false);
  if (!isBrowser) {
    return <main className="center-screen"><div className="card">Memuat latihan...</div></main>;
  }
  return <QuizClient questions={questions} />;
}

function QuizClient({ questions }: { questions: StaticQuestion[] }) {
  const materials = useMemo(
    () => [...new Set(questions.map((question) => question.material))].sort((left, right) => left.localeCompare(right, "id")),
    [questions],
  );
  const [initialState] = useState(() => loadSavedState(materials));
  const [screen, setScreen] = useState<Screen>(initialState?.screen ?? "welcome");
  const [name, setName] = useState(initialState?.name ?? "");
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>(initialState?.selectedMaterials ?? materials);
  const [questionCount, setQuestionCount] = useState(initialState?.questionCount ?? 20);
  const [durationMinutes, setDurationMinutes] = useState(initialState?.durationMinutes ?? 20);
  const [currentQuestion, setCurrentQuestion] = useState(initialState?.currentQuestion ?? 0);
  const [session, setSession] = useState<QuizSession | undefined>(initialState?.session);
  const [now, setNow] = useState(initialState?.session?.startedAt ?? 0);
  const [error, setError] = useState("");

  const availableQuestions = useMemo(
    () => questions.filter((question) => selectedMaterials.includes(question.material)),
    [questions, selectedMaterials],
  );

  useEffect(() => {
    const state: SavedState = {
      version: 2,
      screen,
      name,
      selectedMaterials,
      questionCount,
      durationMinutes,
      currentQuestion,
      session,
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [currentQuestion, durationMinutes, name, questionCount, screen, selectedMaterials, session]);

  useEffect(() => {
    if (screen !== "quiz" || !session) return;
    const tick = () => {
      const currentTime = Date.now();
      setNow(currentTime);
      if (currentTime >= session.deadline) setScreen("result");
    };
    tick();
    const timer = window.setInterval(tick, 1_000);
    return () => window.clearInterval(timer);
  }, [screen, session]);

  function toggleMaterial(material: string) {
    setSelectedMaterials((current) =>
      current.includes(material) ? current.filter((item) => item !== material) : [...current, material],
    );
  }

  function openConfig(event: React.FormEvent) {
    event.preventDefault();
    if (name.trim().length < 2) {
      setError("Nama minimal 2 karakter.");
      return;
    }
    setError("");
    setScreen("config");
  }

  function startQuiz(event: React.FormEvent) {
    event.preventDefault();
    if (availableQuestions.length === 0) {
      setError("Pilih minimal satu materi yang memiliki soal.");
      return;
    }
    const count = Math.min(Math.max(1, questionCount), availableQuestions.length);
    setSession(createQuiz(availableQuestions, count, durationMinutes, name));
    setCurrentQuestion(0);
    setNow(Date.now());
    setError("");
    setScreen("quiz");
  }

  function selectAnswer(questionId: string, optionId: string) {
    setSession((current) => current ? {
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId ? { ...question, selectedOptionId: optionId } : question,
      ),
    } : current);
  }

  function toggleFlag(questionId: string) {
    setSession((current) => current ? {
      ...current,
      questions: current.questions.map((question) =>
        question.id === questionId ? { ...question, flagged: !question.flagged } : question,
      ),
    } : current);
  }

  function finishQuiz() {
    if (!session) return;
    const unanswered = session.questions.filter((question) => !question.selectedOptionId).length;
    const flagged = session.questions.filter((question) => question.flagged).length;
    const warning = (unanswered ? "Masih ada " + unanswered + " soal belum dijawab. " : "") +
      (flagged ? flagged + " soal ditandai. " : "") + "Selesaikan latihan sekarang?";
    if (window.confirm(warning)) setScreen("result");
  }

  function resetQuiz() {
    window.localStorage.removeItem(STORAGE_KEY);
    setScreen("welcome");
    setName("");
    setSelectedMaterials(materials);
    setQuestionCount(20);
    setDurationMinutes(20);
    setCurrentQuestion(0);
    setSession(undefined);
    setError("");
  }

  if (screen === "welcome") {
    return <main className="shell">
      <header className="topbar"><div className="container brand">Mauru Practice</div></header>
      <div className="container hero">
        <section>
          <div className="eyebrow">Gratis, statis, dan tanpa akun</div>
          <h1>Kuasai materi asuransi, satu soal setiap waktu.</h1>
          <p className="lead">Soal dan pilihan jawaban diacak otomatis. Progres tersimpan hanya di browser perangkat ini, tanpa database dan tanpa mengirim data pribadi ke server.</p>
        </section>
        <form className="card" onSubmit={openConfig}>
          <h2>Mulai latihan</h2>
          <p className="muted">Tersedia {questions.length} soal dari {materials.length} materi.</p>
          <div className="field">
            <label htmlFor="participant-name">Nama Peserta</label>
            <input id="participant-name" className="input" value={name} minLength={2} maxLength={100}
              onChange={(event) => setName(event.target.value)} required autoFocus placeholder="Masukkan nama Anda" />
          </div>
          {error && <div className="notice error">{error}</div>}
          <button className="button full-width">Lanjutkan</button>
        </form>
      </div>
    </main>;
  }

  if (screen === "config") {
    const countOptions = [...new Set([...QUESTION_COUNT_OPTIONS.filter((count) => count <= availableQuestions.length), availableQuestions.length])]
      .filter((count) => count > 0)
      .sort((left, right) => left - right);
    return <main>
      <header className="topbar"><div className="container quiz-header"><div className="brand">Mauru Practice</div><button className="link-button" onClick={resetQuiz}>Mulai ulang</button></div></header>
      <div className="container content-narrow">
        <div className="eyebrow">Hai, {name.trim()}</div>
        <h1 className="page-title">Atur latihanmu</h1>
        <p className="lead">Pilih materi, jumlah soal, dan durasi. Sistem mengambil soal secara acak untuk setiap latihan baru.</p>
        <form className="card stack" onSubmit={startQuiz}>
          <div>
            <div className="label section-label">Materi</div>
            <div className="choices">{materials.map((material) =>
              <label className="choice" key={material}><input type="checkbox" checked={selectedMaterials.includes(material)}
                onChange={() => toggleMaterial(material)} />{material}</label>,
            )}</div>
          </div>
          <div className="grid-2">
            <div className="field"><label htmlFor="duration">Durasi</label><select id="duration" className="select" value={durationMinutes}
              onChange={(event) => setDurationMinutes(Number(event.target.value))}>{DURATION_OPTIONS.map((duration) =>
                <option key={duration} value={duration}>{duration} menit</option>,
              )}</select></div>
            <div className="field"><label htmlFor="question-count">Jumlah Soal</label><select id="question-count" className="select"
              value={Math.min(questionCount, availableQuestions.length || questionCount)}
              onChange={(event) => setQuestionCount(Number(event.target.value))}>{countOptions.map((count) =>
                <option key={count} value={count}>{count === availableQuestions.length ? "Semua (" + count + ")" : count + " soal"}</option>,
              )}</select></div>
          </div>
          <div className={"notice " + (availableQuestions.length === 0 ? "error" : "")}>Tersedia <strong>{availableQuestions.length} soal</strong> dari materi yang dipilih.</div>
          {error && <div className="notice error">{error}</div>}
          <button className="button" disabled={availableQuestions.length === 0}>Acak &amp; Mulai Latihan</button>
        </form>
      </div>
    </main>;
  }

  if (!session || session.questions.length === 0) {
    return <main className="center-screen"><div className="card stack"><p>Data latihan tidak ditemukan.</p><button className="button" onClick={resetQuiz}>Kembali ke awal</button></div></main>;
  }

  if (screen === "quiz") {
    const safeCurrent = Math.min(currentQuestion, session.questions.length - 1);
    const question = session.questions[safeCurrent];
    const answered = session.questions.filter((item) => item.selectedOptionId).length;
    const flagged = session.questions.filter((item) => item.flagged).length;
    const remainingSeconds = Math.max(0, Math.ceil((session.deadline - now) / 1_000));
    const time = String(Math.floor(remainingSeconds / 60)).padStart(2, "0") + ":" + String(remainingSeconds % 60).padStart(2, "0");

    return <main>
      <header className="topbar"><div className="container quiz-header"><div><div className="brand">Mauru Practice</div><small>{session.participantName}</small></div>
        <div className={"timer " + (remainingSeconds <= 300 ? "warning" : "")}><small className="timer-label">SISA WAKTU</small>{time}</div></div></header>
      <div className="container quiz-layout">
        <section className="card">
          <div className="muted">{question.material}{question.topic ? " ? " + question.topic : ""}</div>
          <h2 className="question-number">Soal {safeCurrent + 1} dari {session.questions.length}</h2>
          <p className="question-text">{question.text}</p>
          <div className="stack">{question.options.map((option) =>
            <label className="option" key={option.id}><input type="radio" name={question.id}
              checked={question.selectedOptionId === option.id} onChange={() => selectAnswer(question.id, option.id)} /><span>{option.text}</span></label>,
          )}</div>
          <div className="quiz-actions">
            <button type="button" className="button secondary" disabled={safeCurrent === 0} onClick={() => setCurrentQuestion(safeCurrent - 1)}>Sebelumnya</button>
            <button type="button" className="button secondary" onClick={() => toggleFlag(question.id)}>{question.flagged ? "Hapus Tanda" : "Tandai Soal"}</button>
            <button type="button" className="button" disabled={safeCurrent === session.questions.length - 1} onClick={() => setCurrentQuestion(safeCurrent + 1)}>Berikutnya</button>
          </div>
        </section>
        <aside className="card quiz-sidebar">
          <h3>Navigasi Soal</h3>
          <p className="muted">{answered} dijawab ? {session.questions.length - answered} belum ? {flagged} ditandai</p>
          <div className="navigator">{session.questions.map((item, index) =>
            <button type="button" key={item.id} aria-label={"Buka soal " + (index + 1)}
              className={"nav-number " + (item.selectedOptionId ? "answered " : "") + (item.flagged ? "flagged " : "") + (index === safeCurrent ? "current" : "")}
              onClick={() => setCurrentQuestion(index)}>{index + 1}</button>,
          )}</div>
          <button type="button" className="button danger full-width finish-button" onClick={finishQuiz}>Selesaikan Latihan</button>
        </aside>
      </div>
    </main>;
  }

  const result = calculateQuizResult(session);
  return <main>
    <header className="topbar"><div className="container quiz-header"><div className="brand">Mauru Practice</div><button className="link-button" onClick={resetQuiz}>Latihan baru</button></div></header>
    <div className="container result-container">
      <section className="card">
        <div className="eyebrow">Hasil latihan</div>
        <h1 className="result-title">Kerja bagus, {session.participantName}.</h1>
        <div className="result-score">{result.score} / 100</div>
        <div className="stats result-stats">
          <div className="stat"><span className="muted">Benar</span><strong>{result.correctCount}</strong></div>
          <div className="stat"><span className="muted">Salah</span><strong>{result.incorrectCount}</strong></div>
          <div className="stat"><span className="muted">Tidak dijawab</span><strong>{result.unansweredCount}</strong></div>
        </div>
        <h2 className="result-section-title">Breakdown materi</h2>
        <div className="stack">{result.breakdown.map((item) =>
          <div key={item.name} className="notice breakdown"><strong>{item.name}</strong><span>{item.correct} / {item.total} ? {Math.round(item.correct / item.total * 100)}%</span></div>,
        )}</div>
      </section>
      <section className="review-section">
        <h2>Review Jawaban</h2>
        <div className="stack">{session.questions.map((question, index) => {
          const selected = question.options.find((option) => option.id === question.selectedOptionId);
          const correct = question.options.find((option) => option.isCorrect);
          const status = !selected ? "Tidak dijawab" : selected.isCorrect ? "Benar" : "Salah";
          return <article className="card" key={question.id}>
            <div className="eyebrow">Soal {index + 1} ? {status}</div>
            <p className="review-question">{question.text}</p>
            <p><strong>Jawaban Anda:</strong> {selected?.text || "?"}</p>
            <p><strong>Jawaban Benar:</strong> {correct?.text || "?"}</p>
            {question.explanation && <div className="notice"><strong>Pembahasan:</strong> {question.explanation}</div>}
          </article>;
        })}</div>
      </section>
      <button className="button full-width" onClick={resetQuiz}>Mulai latihan baru</button>
    </div>
  </main>;
}
