// 소상공인시장진흥공단 「상가(상권)정보」 OPEN API를 부르는 코드예요. (서버에서만 실행)
//
// 인증키 발급: 공공데이터포털(data.go.kr)에서 "소상공인시장진흥공단_상가(상권)정보" 검색 → 활용신청
// 발급받은 "일반 인증키(Decoding)"를 .env.local 에 SEMAS_API_KEY=... 로 저장하세요.
//
// ⚠️ API 주소나 응답 모양이 바뀔 수 있어요. 결과가 안 나오면 공공데이터포털의 "참고문서"와
//    아래 ENDPOINT / 필드 이름을 비교해 보세요.

const BASE = "https://apis.data.go.kr/B553077/api/open/sdsc2";
const ONE_DAY = 86400;

export function hasSemasKey() {
  return Boolean(process.env.SEMAS_API_KEY);
}

// 공통 호출 함수: 결과의 body.items 배열과 totalCount 를 돌려줘요
async function call(path, params) {
  const query = new URLSearchParams({
    serviceKey: process.env.SEMAS_API_KEY,
    type: "json",
    ...params,
  });
  const res = await fetch(`${BASE}/${path}?${query}`, { next: { revalidate: ONE_DAY } });
  if (!res.ok) throw new Error(`상가정보 API 오류 (HTTP ${res.status})`);

  const json = await res.json();
  const code = json?.header?.resultCode;
  // "03" = 데이터 없음 → 빈 결과로 처리
  if (code === "03") return { items: [], totalCount: 0 };
  if (code && code !== "00") throw new Error(`상가정보 API 오류: ${json.header.resultMsg || code}`);

  const items = json?.body?.items ?? [];
  return { items: Array.isArray(items) ? items : [items], totalCount: Number(json?.body?.totalCount ?? items.length) };
}

/**
 * 지역 목록
 *   level "sido"    → 시도 목록           (parent 없음)
 *   level "sigungu" → 시군구 목록         (parent = 시도 코드)
 *   level "dong"    → 행정동 목록         (parent = 시군구 코드)
 * @returns {Promise<{code: string, name: string}[]>}
 */
export async function fetchRegions(level, parent) {
  if (level === "sido") {
    const { items } = await call("baroApi", { resId: "dong", catId: "mega" });
    return items.map((i) => ({ code: String(i.ctprvnCd), name: i.ctprvnNm }));
  }
  if (level === "sigungu") {
    const { items } = await call("baroApi", { resId: "dong", catId: "cty", ctprvnCd: parent });
    return items.map((i) => ({ code: String(i.signguCd), name: i.signguNm }));
  }
  if (level === "dong") {
    const { items } = await call("baroApi", { resId: "dong", catId: "admi", signguCd: parent });
    return items.map((i) => ({ code: String(i.adongCd), name: i.adongNm }));
  }
  throw new Error(`알 수 없는 지역 단계: ${level}`);
}

/**
 * 행정동 안의 모든 상가업소 (한 번에 1000개씩, 끝까지 넘겨가며 모아요)
 * @param {string} dongCode 행정동 코드 (10자리)
 */
export async function fetchStoresInDong(dongCode) {
  const PAGE_SIZE = 1000;
  const MAX_PAGES = 10; // 혹시 모를 무한 반복 방지 (최대 1만 개)

  const first = await call("storeListInDong", { divId: "adongCd", key: dongCode, numOfRows: PAGE_SIZE, pageNo: 1 });
  let items = first.items;
  const pages = Math.min(Math.ceil(first.totalCount / PAGE_SIZE), MAX_PAGES);

  for (let page = 2; page <= pages; page++) {
    const next = await call("storeListInDong", { divId: "adongCd", key: dongCode, numOfRows: PAGE_SIZE, pageNo: page });
    items = items.concat(next.items);
  }

  // 화면에서 쓰기 편한 모양으로 바꿔요
  return items.map((s) => ({
    id: s.bizesId,
    name: s.bizesNm,
    branch: s.brchNm || "", // 지점명 (있으면 프랜차이즈일 가능성이 높아요)
    category: [s.indsLclsNm, s.indsMclsNm, s.indsSclsNm].filter(Boolean).join(" > "),
    categorySmall: s.indsSclsNm || "",
    address: s.rdnmAdr || s.lnoAdr || "",
    floor: s.flrNo || "",
    lat: Number(s.lat),
    lon: Number(s.lon),
  }));
}
