// "조합 필터"예요. 다른 사이트에서는 못 보는 질문들을 버튼 하나로 볼 수 있게 해줘요.
// 조건을 바꾸거나 새 필터를 추가하려면 여기에 항목을 추가하면 돼요.

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export const PRESETS = [
  {
    id: "all",
    label: "전체",
    description: "모든 직업",
    test: () => true,
  },
  {
    id: "opportunity",
    label: "연봉 높고 사람 귀한",
    description: "연봉이 중간값 이상이면서 인력 부족도도 중간값 이상인 직업",
    test: (job, ctx) => job.salary >= ctx.median.salary && job.shortageRate >= ctx.median.shortageRate,
  },
  {
    id: "ai-safe",
    label: "AI 안전 + 연봉 괜찮은",
    description: "AI 노출도 30점 미만이면서 연봉이 중간값 이상인 직업",
    test: (job, ctx) => job.aiExposure < 30 && job.salary >= ctx.median.salary,
  },
  {
    id: "caution",
    label: "주의 신호",
    description: "AI 노출도가 60점 이상이면서 인력 부족도는 중간값보다 낮은 직업 (사람이 남는 편)",
    test: (job, ctx) => job.aiExposure >= 60 && job.shortageRate < ctx.median.shortageRate,
  },
];

// 필터 계산에 필요한 중간값들을 한 번에 구해요
export function buildContext(jobs) {
  return {
    median: {
      salary: median(jobs.map((j) => j.salary)),
      shortageRate: median(jobs.map((j) => j.shortageRate)),
    },
  };
}
