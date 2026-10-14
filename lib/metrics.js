// 화면에서 고를 수 있는 "지표" 목록이에요.
// 새 지표를 추가하고 싶으면 여기에 항목을 하나 추가하면 왼쪽 필터, 막대그래프, 순위표에 자동으로 반영돼요.

export const METRICS = {
  salary: {
    label: "평균 연봉",
    format: (v) => `${v.toLocaleString("ko-KR")}만원`,
    // bar: "bar" = 0부터 오른쪽으로 뻗는 막대
    //      "diverging" = 가운데(0)를 기준으로 늘면 오른쪽, 줄면 왼쪽
    bar: "bar",
    help: "직종별 평균 연봉(세전)",
  },
  shortageRate: {
    label: "인력 부족도",
    format: (v) => `${v}%`,
    bar: "bar",
    help: "미충원율: 뽑으려 했지만 못 뽑은 비율. 높을수록 사람이 귀한 직업",
  },
  aiExposure: {
    label: "AI 노출도",
    format: (v) => `${v}점`,
    bar: "bar",
    help: "업무 중 지금 AI로 할 수 있는 비중(0~100). 높다고 사라진다는 뜻은 아니에요",
  },
};

export const METRIC_KEYS = Object.keys(METRICS);

// 채용공고 비교(직군 단위) 메뉴에서 쓰는 지표
export const POSTING_METRICS = {
  openings: {
    label: "신규 공고",
    format: (v) => `${Math.round(v).toLocaleString("ko-KR")}명`,
    bar: "bar",
    help: "한 달 동안 고용24에 새로 등록된 구인인원",
  },
  openingsChange: {
    label: "공고 증감",
    format: (v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}%`,
    bar: "diverging",
    help: "전월 대비 신규 구인인원 변화율. +면 늘어나는 중, -면 줄어드는 중",
  },
  validOpenings: {
    label: "유효 공고",
    format: (v) => `${Math.round(v).toLocaleString("ko-KR")}명`,
    bar: "bar",
    help: "그달 말 기준으로 아직 마감되지 않은 구인인원 (지금 뽑고 있는 규모)",
  },
};
