// 모든 페이지가 공유하는 틀이에요.
//   맨 위: SiteHeader (로고 + 메뉴바)
//   가운데: 각 페이지 내용 (children)
//   맨 아래: SiteFooter (데이터 출처)

import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = {
  // 각 페이지 제목 뒤에 " — 내일의 자리"가 자동으로 붙어요 (예: "연봉 비교 — 내일의 자리")
  title: {
    default: "내일의 자리 — 직업과 상권을 데이터로 미리 보기",
    template: "%s — 내일의 자리",
  },
  description: "직업별 연봉·채용공고·AI 노출도와 우리 동네 상권(가게 수)을 비교하는 사이트",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        {/* 한글 웹폰트 Pretendard */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>
        <SiteHeader />
        <main className="page">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
