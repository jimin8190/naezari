// 상권 확인 메뉴의 "두뇌"예요. (서버에서만 실행)
// 키가 있으면 진짜 상가정보 API, 없으면 샘플 데이터를 써서 같은 모양의 결과를 만들어요.

import { hasSemasKey, fetchRegions, fetchStoresInDong } from "./semas";
import { sampleRegions, sampleStores } from "./market-sample";
import { expandKeyword, matchStore } from "./keywords";

const MAX_STORES_SHOWN = 300; // 목록·지도에 보여줄 최대 가게 수

/** 시도 / 시군구 / 행정동 목록 */
export async function getRegions(level, parent) {
  if (!hasSemasKey()) return { sample: true, items: sampleRegions(level, parent) };
  const items = await fetchRegions(level, parent);
  items.sort((a, b) => a.name.localeCompare(b.name, "ko"));
  return { sample: false, items };
}

/** 행정동 + 키워드로 가게 찾기 */
export async function searchMarket(dongCode, keyword) {
  const sample = !hasSemasKey();
  const allStores = sample ? sampleStores(dongCode) : await fetchStoresInDong(dongCode);

  const terms = expandKeyword(keyword);
  const matched = allStores.filter((s) => matchStore(s, terms));

  // 업종(소분류)별로 몇 개씩인지
  const byCategory = {};
  matched.forEach((s) => {
    const key = s.categorySmall || "기타";
    byCategory[key] = (byCategory[key] || 0) + 1;
  });

  // 층별: 1층 / 지하 / 2층 이상 / 모름
  const floors = { "1층": 0, "2층 이상": 0, 지하: 0, "정보 없음": 0 };
  matched.forEach((s) => {
    const f = String(s.floor).trim();
    if (!f) floors["정보 없음"]++;
    else if (/^(B|b|지하)/.test(f)) floors["지하"]++;
    else if (f === "1") floors["1층"]++;
    else floors["2층 이상"]++;
  });

  return {
    sample,
    keyword,
    terms,
    totalStores: allStores.length,
    count: matched.length,
    // 이 동 전체 가게 중 몇 %인지
    share: allStores.length ? (matched.length / allStores.length) * 100 : 0,
    // 지점명이 있는 가게 = 프랜차이즈일 가능성이 높아요 (정확한 구분은 아님)
    chainCount: matched.filter((s) => s.branch).length,
    byCategory: Object.entries(byCategory)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
    floors: Object.entries(floors)
      .map(([name, count]) => ({ name, count }))
      .filter((f) => f.count > 0),
    stores: matched.slice(0, MAX_STORES_SHOWN),
    truncated: matched.length > MAX_STORES_SHOWN,
  };
}
