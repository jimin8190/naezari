// 메뉴(페이지)별 설정을 한 곳에 모았어요.
// 메뉴를 추가하고 싶으면:
//   1. 여기에 항목 하나 추가
//   2. app/<path>/page.js 파일 만들기 (다른 page.js를 복사해서 key만 바꾸면 돼요)

export const PAGES = {
  salary: {
    path: "/salary",
    menu: "연봉 비교",
    title: "직업별 연봉 비교",
    intro: "직군을 고르면 직업별 평균 연봉을 막대그래프로 비교할 수 있어요.",
    metricKeys: ["salary"], // 이 페이지에서 고를 수 있는 지표
    boards: [
      { title: "연봉 높은 직업", key: "salary", order: "desc" },
      { title: "연봉 낮은 직업", key: "salary", order: "asc" },
    ],
  },
  outlook: {
    path: "/outlook",
    menu: "AI·인력 전망",
    title: "AI 노출도와 인력 부족도",
    intro: "AI가 대신할 수 있는 업무 비중과, 사람을 못 구해서 비어 있는 자리 비율을 비교해요.",
    metricKeys: ["aiExposure", "shortageRate"],
    boards: [
      { title: "AI 노출 낮은 직업", key: "aiExposure", order: "asc" },
      { title: "AI 노출 높은 직업", key: "aiExposure", order: "desc" },
      { title: "사람 귀한 직업", key: "shortageRate", order: "desc" },
    ],
  },
};

// 메뉴바에 나오는 순서예요. 채용공고 비교와 상권 확인은 직업 페이지와 화면 구조가 달라서 PAGES에 없어요.
export const MENU = [
  { path: "/salary", menu: PAGES.salary.menu },
  { path: "/postings", menu: "채용공고 비교" },
  { path: "/outlook", menu: PAGES.outlook.menu },
  { path: "/market", menu: "상권 확인" },
];
