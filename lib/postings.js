// 채용공고 비교 메뉴의 데이터를 준비해요. (서버에서만 실행)
//
// data/postings/YYYY-MM.json 은 scripts/update-postings.mjs 가 고용행정통계 API에서 자동으로 만들어요.
// 가장 최근 달 → 공고 수, 그 전 달 → 전월 대비 증감 계산에 써요.
// 파일이 하나도 없으면 화면 확인용 샘플 숫자를 보여줘요.

import fs from "node:fs";
import path from "node:path";

const DIR = path.join(process.cwd(), "data", "postings");

// 고용24 직종 대분류 (API가 주는 코드와 이름)
const GROUPS = {
  "000000": "경영·사무·금융·보험직",
  100000: "연구직 및 공학 기술직",
  200000: "교육·법률·사회복지·경찰·소방직 및 군인",
  300000: "보건·의료직",
  400000: "예술·디자인·방송·스포츠직",
  500000: "미용·여행·숙박·음식·경비·청소직",
  600000: "영업·판매·운전·운송직",
  700000: "건설·채굴직",
  800000: "설치·정비·생산직",
  900000: "농림어업직",
};

function readMonths() {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => /^\d{4}-\d{2}\.json$/.test(f)) // 완성된 달만 (.partial-… 은 제외)
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8")));
}

// { "11|300000": {openings, validOpenings}, ... } + 전국("all") 합계
function index(monthData) {
  const map = {};
  const add = (key, row) => {
    const t = (map[key] ||= { openings: 0, validOpenings: 0 });
    t.openings += row.openings;
    t.validOpenings += row.validOpenings;
  };
  monthData.rows.forEach((row) => {
    add(`${row.region}|${row.group}`, row);
    add(`all|${row.group}`, row);
  });
  return map;
}

/**
 * 화면에 넘길 데이터
 * @returns {{ sample, month, previousMonth, regions: {code,name}[], groups: {code,name}[],
 *             values: { [region]: { [group]: { openings, validOpenings, openingsChange } } } }}
 */
export function getPostingsData() {
  const months = readMonths();
  if (months.length === 0) return sampleData();

  const latest = months[months.length - 1];
  const previous = months.length > 1 ? months[months.length - 2] : null;
  const now = index(latest);
  const before = previous ? index(previous) : null;

  const regions = [
    { code: "all", name: "전국" },
    ...Object.entries(latest.regions)
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.code.localeCompare(b.code)),
  ];
  const groups = Object.entries({ ...GROUPS, ...latest.groups })
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.code.localeCompare(b.code));

  const values = {};
  regions.forEach(({ code: r }) => {
    values[r] = {};
    groups.forEach(({ code: g }) => {
      const cur = now[`${r}|${g}`];
      if (!cur) return;
      const old = before?.[`${r}|${g}`];
      values[r][g] = {
        ...cur,
        openingsChange: old && old.openings > 0 ? ((cur.openings - old.openings) / old.openings) * 100 : null,
      };
    });
  });

  return { sample: false, month: latest.month, previousMonth: previous?.month ?? null, regions, groups, values };
}

// ⚠️ 데이터 파일이 없을 때만 쓰는 예시 숫자 (실제 통계 아님)
function sampleData() {
  const base = {
    "000000": 31000, 100000: 14000, 200000: 21000, 300000: 26000, 400000: 4000,
    500000: 36000, 600000: 24000, 700000: 12000, 800000: 41000, 900000: 1500,
  };
  const change = {
    "000000": -4.2, 100000: 2.1, 200000: 1.3, 300000: 3.8, 400000: -6.5,
    500000: 0.7, 600000: -1.9, 700000: -8.4, 800000: -2.6, 900000: 5.1,
  };
  const regions = [
    { code: "all", name: "전국" },
    { code: "11", name: "서울특별시" },
    { code: "27", name: "대구광역시" },
    { code: "28", name: "인천광역시" },
    { code: "41", name: "경기도" },
  ];
  const share = { all: 1, 11: 0.2, 27: 0.04, 28: 0.06, 41: 0.3 };
  const groups = Object.entries(GROUPS)
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.code.localeCompare(b.code));
  const values = {};
  regions.forEach(({ code: r }) => {
    values[r] = {};
    groups.forEach(({ code: g }, i) => {
      const openings = Math.round(base[g] * share[r] * (1 + ((i * 7) % 5) / 20));
      values[r][g] = { openings, validOpenings: Math.round(openings * 1.4), openingsChange: change[g] };
    });
  });
  return { sample: true, month: null, previousMonth: null, regions, groups, values };
}
