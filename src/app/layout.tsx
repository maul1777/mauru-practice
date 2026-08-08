import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Mauru Practice", description: "Latihan soal asuransi yang terukur dan mudah digunakan." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
