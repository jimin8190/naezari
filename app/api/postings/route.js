// 주소: /api/postings
// 직군별·지역별 공고(구인) 수를 JSON으로 돌려줘요. 다른 페이지나 앱에서 쓰기 좋게 만들어둔 통로예요.

import { getPostingsData } from "@/lib/postings";

export const revalidate = 86400;

export function GET() {
  return Response.json(getPostingsData());
}
