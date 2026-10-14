// 직업 데이터(연봉, 인력 부족도, AI 노출도 등)를 준비하는 파일이에요. (서버에서만 실행)
// 실제 데이터로 바꿀 때는 jobs.sample.json 대신 jobs.json 을 만들어서 아래 import 경로만 바꾸면 돼요.
// (채용공고 데이터는 직군 단위라서 lib/postings.js 에서 따로 준비해요)

import baseData from "@/data/jobs.sample.json";

// 데이터 출처 목록 (화면 맨 아래에 표시)
export const SOURCES = baseData.sources;

export async function getJobData() {
  return {
    jobs: baseData.jobs.map((job) => ({ ...job })),
    isSample: baseData.isSample,
    updatedAt: baseData.updatedAt,
  };
}
