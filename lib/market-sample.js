// ⚠️ 상가정보 API 키가 없을 때 화면을 확인하려고 쓰는 "가짜" 데이터예요.
// 가게 이름, 개수, 위치 모두 지어낸 것이고 실제 상권과 관계없어요.
// .env.local 에 SEMAS_API_KEY 를 넣으면 이 파일은 쓰이지 않아요.

const REGIONS = {
  sido: [
    { code: "S11", name: "서울특별시" },
    { code: "S27", name: "대구광역시" },
    { code: "S28", name: "인천광역시" },
  ],
  sigungu: {
    S11: [
      { code: "S11440", name: "마포구" },
      { code: "S11680", name: "강남구" },
    ],
    S27: [
      { code: "S27110", name: "중구" },
      { code: "S27260", name: "수성구" },
    ],
    S28: [
      { code: "S28237", name: "부평구" },
      { code: "S28260", name: "서구" },
    ],
  },
  dong: {
    S11440: [
      { code: "S1144001", name: "서교동", center: [37.5551, 126.9198] },
      { code: "S1144002", name: "연남동", center: [37.5636, 126.9227] },
    ],
    S11680: [{ code: "S1168001", name: "역삼1동", center: [37.4954, 127.0333] }],
    S27110: [{ code: "S2711001", name: "성내1동", center: [35.8690, 128.5960] }],
    S27260: [{ code: "S2726001", name: "범어1동", center: [35.8592, 128.6262] }],
    S28237: [
      { code: "S2823701", name: "부평1동", center: [37.4917, 126.7238] },
      { code: "S2823702", name: "삼산1동", center: [37.5086, 126.7378] },
    ],
    S28260: [
      { code: "S2826001", name: "가좌1동", center: [37.4880, 126.6780] },
      { code: "S2826002", name: "가좌2동", center: [37.4930, 126.6830] },
      { code: "S2826003", name: "석남1동", center: [37.5060, 126.6760] },
      { code: "S2826004", name: "청라1동", center: [37.5360, 126.6510] },
    ],
  },
};

// 업종별 기본 개수 (동마다 조금씩 다르게 곱해요)
const CATEGORIES = [
  { small: "빵/도넛", path: "음식 > 제과제빵 > 빵/도넛", label: "샘플베이커리", base: 9 },
  { small: "카페", path: "음식 > 비알코올 > 카페", label: "샘플카페", base: 28 },
  { small: "헬스장", path: "예술·스포츠·여가 > 스포츠 서비스 > 헬스장", label: "샘플피트니스", base: 6 },
  { small: "미용실", path: "수리·개인 서비스 > 미용 > 미용실", label: "샘플헤어", base: 22 },
  { small: "편의점", path: "소매 > 종합 소매 > 편의점", label: "샘플편의점", base: 12 },
  { small: "치킨", path: "음식 > 기타 간이 > 치킨", label: "샘플치킨", base: 14 },
  { small: "백반/한정식", path: "음식 > 한식 > 백반/한정식", label: "샘플식당", base: 40 },
  { small: "입시·교과학원", path: "교육 > 일반 교육 > 입시·교과학원", label: "샘플학원", base: 18 },
  { small: "약국", path: "보건의료 > 약국 > 약국", label: "샘플약국", base: 5 },
  { small: "세탁소", path: "수리·개인 서비스 > 세탁 > 세탁소", label: "샘플세탁", base: 6 },
];

// 같은 동은 항상 같은 숫자가 나오도록, 코드에서 숫자를 만들어요 (진짜 랜덤 아님)
function seeded(str) {
  let h = 2166136261;
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

export function sampleRegions(level, parent) {
  if (level === "sido") return REGIONS.sido;
  if (level === "sigungu") return REGIONS.sigungu[parent] ?? [];
  if (level === "dong") return (REGIONS.dong[parent] ?? []).map(({ code, name }) => ({ code, name }));
  return [];
}

export function sampleStores(dongCode) {
  const dong = Object.values(REGIONS.dong).flat().find((d) => d.code === dongCode);
  if (!dong) return [];

  const rand = seeded(dongCode);
  const [lat0, lon0] = dong.center;
  const stores = [];

  CATEGORIES.forEach((cat) => {
    const count = Math.max(1, Math.round(cat.base * (0.5 + rand())));
    for (let i = 1; i <= count; i++) {
      const isChain = rand() < 0.3;
      stores.push({
        id: `${dongCode}-${cat.label}-${i}`,
        name: isChain ? `${cat.label}체인` : `${cat.label} ${i}`,
        branch: isChain ? `${dong.name}${i}호점` : "",
        category: cat.path,
        categorySmall: cat.small,
        address: `${dong.name} 샘플로 ${Math.floor(rand() * 200) + 1}`,
        floor: (() => {
          const r = rand();
          return r < 0.6 ? "1" : r < 0.88 ? "2" : "B1"; // 대부분 1층, 일부 2층·지하
        })(),
        lat: lat0 + (rand() - 0.5) * 0.012,
        lon: lon0 + (rand() - 0.5) * 0.014,
      });
    }
  });
  return stores;
}
