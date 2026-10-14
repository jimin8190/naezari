// 주소: /market  (상권 확인 메뉴)
// 이 페이지는 사용자가 지역을 고르고 "조회"를 눌러야 데이터가 생겨서,
// 화면은 전부 MarketExplorer(브라우저)에서 그리고 데이터는 /api/market/... 에서 받아와요.

import MarketExplorer from "@/components/MarketExplorer";

export const metadata = { title: "상권 확인" };

export default function MarketPage() {
  return <MarketExplorer />;
}
