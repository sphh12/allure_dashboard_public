import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Allure Dashboard",
  description: "테스트 실행 결과 대시보드",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* FOUC 방지: 테마 즉시 적용 + 새로고침 시 status 필터 초기화 */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            try {
              var t = localStorage.getItem("theme");
              if (t === "light" || t === "dark") {
                document.documentElement.setAttribute("data-theme", t);
              }
              var nav = performance.getEntriesByType("navigation")[0];
              if (nav && nav.type === "reload" && location.search.indexOf("status=") !== -1) {
                var url = new URL(location.href);
                url.searchParams.delete("status");
                location.replace(url.toString());
              }
            } catch(e) {}
          })();
        `}} />
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
