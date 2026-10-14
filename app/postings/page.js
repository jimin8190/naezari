// 주소: /postings  (채용공고 비교 메뉴)
// 데이터는 data/postings/ 의 월별 파일(고용행정통계 API에서 자동 수집)에서 읽어요.

import { getPostingsData } from "@/lib/postings";
import PostingsExplorer from "@/components/PostingsExplorer";

export const revalidate = 86400; // 하루에 한 번 새로 만들기

export const metadata = { title: "채용공고 비교" };

export default function Page() {
  return <PostingsExplorer data={getPostingsData()} />;
}
