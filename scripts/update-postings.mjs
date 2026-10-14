// 고용행정통계 Open API에서 "직군별 신규 구인인원"을 자동으로 모아
// data/postings/YYYY-MM.json 으로 저장하는 스크립트예요. (인증키 필요 없음)
//
// 사용법 (프로젝트 폴더에서):
//   npm run update:postings            ← 가장 최근 달 + 그 전 달을 알아서 채워요
//   npm run update:postings -- 2026-09 ← 특정 달만
//
// 알아둘 점
//   - API가 시·군·구 단위로만 답을 줘서, 270곳을 한 곳씩 물어보고 시도별로 더해요.
//   - IP마다 하루 조회 횟수 한도가 있어요. 한도에 걸리면 지금까지 모은 걸 저장하고 멈춰요.
//     다음 날 같은 명령을 다시 실행하면 멈춘 곳부터 이어서 해요. (GitHub Actions가 매일 대신 실행)
//   - 구인은 성별·연령 구분이 없어서 성별 "N(무관)", 연령 "12"로 물어봐야 나와요.

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { AREAS } from "./eis-areas.mjs";

const API = "https://eis.work24.go.kr/opi/joApi.do";
const DIR = path.join(process.cwd(), "data", "postings");
const DELAY_MS = 400; // 서버에 부담 주지 않도록 요청 사이에 쉬는 시간

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ym = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
const monthBefore = (m) => {
  const [y, mo] = m.split("-").map(Number);
  return ym(new Date(y, mo - 2, 1));
};

class LimitReached extends Error {}

// ---------- API 한 번 부르기 ----------
async function fetchArea(areaCode, month, fetchImpl = fetch) {
  const params = new URLSearchParams({
    apiSecd: "OPIA",
    rsdAreaCd: areaCode,
    sxdsCd: "N", // 성별 무관 (구인은 여기에 들어 있어요)
    ageCd: "12", // 연령 무관
    rernSecd: "XML",
    closStdrYm: month.replace("-", ""),
    bgnPage: "1",
    display: "1000",
  });
  const res = await fetchImpl(`${API}?${params}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  // 응답이 EUC-KR 한글이라서 직접 풀어요
  const xml = new TextDecoder("euc-kr").decode(await res.arrayBuffer());

  const error = xml.match(/<error>([^<]*)<\/error>/)?.[1];
  if (error) {
    if (error.startsWith("HITS_EXCEEDED")) throw new LimitReached(error);
    throw new Error(error);
  }
  return parseRecords(xml);
}

// <rqst>...</rqst> 하나하나를 { 태그: 값 } 으로
export function parseRecords(xml) {
  return [...xml.matchAll(/<rqst>([\s\S]*?)<\/rqst>/g)].map(([, body]) => {
    const rec = {};
    for (const [, tag, value] of body.matchAll(/<(\w+)>([^<]*)<\/\1>/g)) rec[tag] = value;
    return rec;
  });
}

// ---------- 한 달 치 모으기 (중간 저장 + 이어하기) ----------
export async function collectMonth(month, { fetchImpl = fetch, delay = DELAY_MS, log = console.log } = {}) {
  fs.mkdirSync(DIR, { recursive: true });
  const finalFile = path.join(DIR, `${month}.json`);
  const partialFile = path.join(DIR, `.partial-${month}.json`);
  if (fs.existsSync(finalFile)) {
    log(`✔ ${month}: 이미 있어요`);
    return "done";
  }

  // 이어하기: 지난번에 멈춘 지점부터
  const state = fs.existsSync(partialFile)
    ? JSON.parse(fs.readFileSync(partialFile, "utf8"))
    : { month, done: [], regions: {}, groups: {}, totals: {} };
  const doneSet = new Set(state.done);
  const todo = AREAS.filter(([code]) => !doneSet.has(code));
  log(`… ${month}: ${AREAS.length}곳 중 ${doneSet.size}곳 완료, ${todo.length}곳 남음`);

  const save = () => fs.writeFileSync(partialFile, JSON.stringify(state));

  for (const [code, name] of todo) {
    let records;
    try {
      records = await fetchArea(code, month, fetchImpl);
    } catch (err) {
      save();
      if (err instanceof LimitReached) {
        log(`⏸ 오늘 조회 한도에 걸렸어요 (${name}에서 멈춤). 내일 다시 실행하면 이어서 해요.`);
        return "limit";
      }
      log(`⚠ ${name}(${code}) 조회 실패: ${err.message}. 다음 실행 때 다시 시도해요.`);
      return "error";
    }

    // 시도 × 직군으로 더하기
    for (const r of records) {
      const region = r.ctpvCd;
      const group = r.wnetJsfcLrclCd;
      if (!region || !group) continue;
      state.regions[region] = r.ctpvCdNm;
      state.groups[group] = r.wnetJsfcLrclCdNm;
      const key = `${region}|${group}`;
      const t = (state.totals[key] ||= { openings: 0, validOpenings: 0 });
      t.openings += Number(r.newJoNmpr) || 0;
      t.validOpenings += Number(r.valdJoNmpr) || 0;
    }
    state.done.push(code);
    if (state.done.length % 20 === 0) save(); // 20곳마다 중간 저장
    await sleep(delay);
  }

  // 다 모았으면 최종 파일로
  const rows = Object.entries(state.totals).map(([key, v]) => {
    const [region, group] = key.split("|");
    return { region, group, ...v };
  });
  if (rows.length === 0) {
    fs.rmSync(partialFile, { force: true });
    log(`✖ ${month}: 데이터가 하나도 없어요. 아직 발표 전인 달일 수 있어요.`);
    return "empty";
  }
  fs.writeFileSync(
    finalFile,
    JSON.stringify(
      {
        month,
        source: "고용노동부 고용행정통계 Open API (구인·구직 현황)",
        fetchedAt: new Date().toISOString(),
        regions: state.regions,
        groups: state.groups,
        rows,
      },
      null,
      2
    ) + "\n"
  );
  fs.rmSync(partialFile, { force: true });
  log(`✅ ${month}: 저장 완료 → data/postings/${month}.json (${rows.length}줄)`);
  return "done";
}

// ---------- 가장 최근에 발표된 달 찾기 ----------
// 통계는 보통 한두 달 늦게 나와요. 지난달부터 거꾸로 확인해요.
async function latestPublishedMonth(fetchImpl = fetch) {
  let m = monthBefore(ym(new Date()));
  for (let i = 0; i < 3; i++) {
    const records = await fetchArea("11680", m, fetchImpl); // 서울 강남구로 확인
    if (records.length > 0) return m;
    m = monthBefore(m);
  }
  throw new Error("최근 3개월 안에 발표된 달을 찾지 못했어요.");
}

// ---------- 실행 ----------
async function main() {
  const arg = process.argv[2];
  if (arg && !/^\d{4}-\d{2}$/.test(arg)) {
    console.log("사용법: npm run update:postings [-- YYYY-MM]");
    process.exit(1);
  }

  let months;
  if (arg) {
    months = [arg];
  } else {
    let latest;
    try {
      latest = await latestPublishedMonth();
    } catch (err) {
      if (err instanceof LimitReached) {
        console.log("⏸ 오늘 조회 한도에 이미 걸려 있어요. 내일 다시 실행해 주세요.");
        return;
      }
      throw err;
    }
    console.log(`가장 최근 발표: ${latest}`);
    months = [latest, monthBefore(latest)]; // 증감 계산하려면 전달도 필요해요
  }

  for (const m of months) {
    const result = await collectMonth(m);
    if (result === "limit" || result === "error") break; // 다음 실행 때 이어서
  }
}

// 이 파일을 직접 실행했을 때만 main() 실행 (테스트에서 불러올 때는 실행 안 함)
// pathToFileURL 을 써야 윈도우 경로(C:\...)도 제대로 비교돼요
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    if (err.message === "fetch failed") {
      console.error("오류: 고용행정통계 서버에 연결하지 못했어요. 인터넷 연결을 확인하고 다시 실행해 주세요.");
      console.error("      (자세한 원인:", err.cause?.message ?? "알 수 없음", ")");
      process.exit(1);
    }
    console.error("오류:", err.message);
    process.exit(1);
  });
}
