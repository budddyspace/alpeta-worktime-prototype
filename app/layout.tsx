import "./globals.css";
import { Nanum_Gothic } from "next/font/google";

const nanum = Nanum_Gothic({
  weight: ["400", "700", "800"],
  subsets: ["latin"],
  variable: "--font-nanum",
});

export const metadata = {
  title: "Alpeta X · 근무시간 관리 프로토타입",
  description: "근무시간 기준 관리/생성 프로토타입 (데모용)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={nanum.variable}>
      <body className="font-sans bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
