import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Latihan Test AAPAI | Mauru Practice", description: "Latihan soal AAPAI dengan soal acak, penilaian, dan review jawaban untuk membantu persiapan test." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
