"use client";

// 상권 확인 화면
//   1. 시도 > 시군구 > 동 고르기
//   2. 키워드(빵집 등) 입력 → 조회
//   3. 결과: 가게 수, 동 안에서 비율, 프랜차이즈 추정, 업종·층별 막대, 지도, 가게 목록

import { useCallback, useEffect, useState } from "react";
import KakaoMap from "./KakaoMap";

const QUICK_KEYWORDS = ["빵집", "카페", "헬스장", "미용실", "편의점", "치킨"];

// 서버의 /api/market/... 를 부르는 작은 도우미
async function getJSON(url) {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "불러오기에 실패했어요.");
  return data;
}

export default function MarketExplorer() {
  // 선택 상자 목록
  const [sidoList, setSidoList] = useState([]);
  const [sigunguList, setSigunguList] = useState([]);
  const [dongList, setDongList] = useState([]);
  // 고른 값 (코드)
  const [sido, setSido] = useState("");
  const [sigungu, setSigungu] = useState("");
  const [dong, setDong] = useState("");
  const [keyword, setKeyword] = useState("");

  const [result, setResult] = useState(null);
  const [searched, setSearched] = useState(null); // 조회했을 때의 지역 이름 + 키워드
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sample, setSample] = useState(false);
  const [focusId, setFocusId] = useState(null);

  // 처음 열면 시도 목록 불러오기
  useEffect(() => {
    getJSON("/api/market/regions?level=sido")
      .then((d) => {
        setSidoList(d.items);
        setSample(d.sample);
      })
      .catch((e) => setError(e.message));
  }, []);

  // 시도를 바꾸면 → 시군구 목록 새로, 아래 단계는 초기화
  const changeSido = async (code) => {
    setSido(code);
    setSigungu("");
    setDong("");
    setSigunguList([]);
    setDongList([]);
    if (!code) return;
    try {
      setSigunguList((await getJSON(`/api/market/regions?level=sigungu&parent=${code}`)).items);
    } catch (e) {
      setError(e.message);
    }
  };

  // 시군구를 바꾸면 → 동 목록 새로
  const changeSigungu = async (code) => {
    setSigungu(code);
    setDong("");
    setDongList([]);
    if (!code) return;
    try {
      setDongList((await getJSON(`/api/market/regions?level=dong&parent=${code}`)).items);
    } catch (e) {
      setError(e.message);
    }
  };

  const nameOf = (list, code) => list.find((i) => i.code === code)?.name ?? "";
  const canSearch = dong && keyword.trim() && !loading;

  const search = async (e) => {
    e?.preventDefault();
    if (!canSearch) return;
    setLoading(true);
    setError("");
    setFocusId(null);
    try {
      const data = await getJSON(`/api/market/search?dong=${dong}&keyword=${encodeURIComponent(keyword.trim())}`);
      setResult(data);
      setSearched({
        area: [nameOf(sidoList, sido), nameOf(sigunguList, sigungu), nameOf(dongList, dong)].join(" "),
        dongName: nameOf(dongList, dong),
        keyword: keyword.trim(),
      });
    } catch (err) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const onFocus = useCallback((id) => setFocusId(id), []);

  return (
    <>
      <header className="page-head">
        <h1 className="page-title">우리 동네 상권 확인</h1>
        <p className="page-intro">동네를 고르고 업종을 입력하면, 그 동에 같은 가게가 몇 개 있는지 보여줘요.</p>
        {sample && (
          <div className="notice" role="note">
            <strong>샘플 데이터</strong> · 상가정보 API 키를 넣기 전이라 지어낸 가게로 보여주고 있어요. 지역도 일부만
            있어요.
          </div>
        )}
      </header>

      {/* ---------- 검색 상자 ---------- */}
      <form className="search-box" onSubmit={search}>
        <div className="region-row">
          <label className="field">
            <span className="field-label">시·도</span>
            <select value={sido} onChange={(e) => changeSido(e.target.value)}>
              <option value="">선택</option>
              {sidoList.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <span className="region-arrow" aria-hidden="true">›</span>
          <label className="field">
            <span className="field-label">시·군·구</span>
            <select value={sigungu} onChange={(e) => changeSigungu(e.target.value)} disabled={!sido}>
              <option value="">선택</option>
              {sigunguList.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
          <span className="region-arrow" aria-hidden="true">›</span>
          <label className="field">
            <span className="field-label">동</span>
            <select value={dong} onChange={(e) => setDong(e.target.value)} disabled={!sigungu}>
              <option value="">선택</option>
              {dongList.map((r) => (
                <option key={r.code} value={r.code}>
                  {r.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="keyword-row">
          <label className="field field-grow">
            <span className="field-label">업종 키워드</span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="예: 빵집, 카페, 헬스장"
              maxLength={20}
            />
          </label>
          <button type="submit" className="search-btn" disabled={!canSearch}>
            {loading ? "조회 중…" : "조회"}
          </button>
        </div>

        <div className="chips">
          {QUICK_KEYWORDS.map((k) => (
            <button
              key={k}
              type="button"
              className={keyword === k ? "chip chip-on" : "chip"}
              onClick={() => setKeyword(k)}
            >
              {k}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {!result && !error && (
        <p className="market-empty">위에서 동과 업종을 고르고 조회를 눌러보세요.</p>
      )}

      {result && searched && (
        <MarketResult result={result} searched={searched} focusId={focusId} onFocus={onFocus} />
      )}
    </>
  );
}

function MarketResult({ result, searched, focusId, onFocus }) {
  const naverLink = `https://map.naver.com/p/search/${encodeURIComponent(`${searched.dongName} ${searched.keyword}`)}`;

  return (
    <section className="market-result" aria-live="polite">
      <h2 className="result-title">
        {searched.area} <span className="content-metric">· &lsquo;{searched.keyword}&rsquo;</span>
      </h2>
      <p className="result-terms">
        찾은 말: {result.terms.join(", ")} (가게 이름이나 업종 이름에 들어 있으면 포함)
      </p>

      {/* ---------- 숫자 카드 ---------- */}
      <div className="stats">
        <Stat label="가게 수" value={`${result.count.toLocaleString("ko-KR")}개`} note={`동 전체 ${result.totalStores.toLocaleString("ko-KR")}개 중`} />
        <Stat label="동 안에서 비율" value={`${result.share.toFixed(1)}%`} note="전체 가게 중 이 업종 비중" />
        <Stat
          label="프랜차이즈 추정"
          value={`${result.chainCount.toLocaleString("ko-KR")}개`}
          note="지점명이 붙은 가게 수 (정확한 구분은 아님)"
        />
        <Stat
          label="방문자 수"
          value="공개 데이터 없음"
          muted
          note={
            <>
              리뷰·방문자 수는 공식 API가 없어요.{" "}
              <a href={naverLink} target="_blank" rel="noreferrer">
                네이버 지도에서 보기
              </a>
            </>
          }
        />
        <Stat
          label="추정 매출"
          value="공개 데이터 없음"
          muted
          note={
            <>
              무료 API로는 안 나와요.{" "}
              <a href="https://sg.sbiz.or.kr" target="_blank" rel="noreferrer">
                상권정보시스템에서 보기
              </a>
            </>
          }
        />
      </div>

      {result.count > 0 && (
        <>
          <div className="breakdowns">
            <Breakdown title="업종별" rows={result.byCategory} />
            <Breakdown title="층별" rows={result.floors} />
          </div>

          <div className="map-and-list">
            <KakaoMap stores={result.stores} focusId={focusId} onFocus={onFocus} />
            <div className="store-list-box">
              <h3 className="store-list-title">
                가게 목록 <span>{result.count.toLocaleString("ko-KR")}개</span>
              </h3>
              {result.truncated && <p className="store-list-note">처음 {result.stores.length}개만 보여줘요.</p>}
              <ul className="store-list">
                {result.stores.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      className={focusId === s.id ? "store store-on" : "store"}
                      onClick={() => onFocus(s.id)}
                    >
                      <span className="store-name">
                        {s.name}
                        {s.branch && <span className="store-branch"> {s.branch}</span>}
                      </span>
                      <span className="store-meta">
                        {s.categorySmall}
                        {s.floor && ` · ${floorLabel(s.floor)}`}
                      </span>
                      <span className="store-addr">{s.address}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {result.count === 0 && (
        <p className="market-empty">이 동에서는 &lsquo;{searched.keyword}&rsquo;에 맞는 가게를 찾지 못했어요.</p>
      )}

      <p className="market-source">
        출처: 소상공인시장진흥공단 상가(상권)정보. 분기마다 갱신되는 자료라 최근에 열거나 닫은 가게는 반영이 늦을 수
        있어요.
      </p>
    </section>
  );
}

// "B1" → "지하1층", "2" → "2층"
function floorLabel(floor) {
  const f = String(floor).trim();
  return /^b/i.test(f) ? `지하${f.slice(1)}층` : `${f}층`;
}

function Stat({ label, value, note, muted }) {
  return (
    <div className={muted ? "stat stat-muted" : "stat"}>
      <span className="stat-label">{label}</span>
      <strong className="stat-value">{value}</strong>
      <span className="stat-note">{note}</span>
    </div>
  );
}

// 업종별·층별 막대 (직업 페이지의 막대와 같은 모양)
function Breakdown({ title, rows }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  const total = rows.reduce((sum, r) => sum + r.count, 0);
  return (
    <div className="breakdown">
      <h3 className="breakdown-title">{title}</h3>
      <ul className="bars">
        {rows.map((r) => (
          <li key={r.name} className="bar-row">
            <div className="bar-line bar-line-static">
              <span className="bar-name">{r.name}</span>
              <span className="track" aria-hidden="true">
                <span className="fill" style={{ width: `${Math.max((r.count / max) * 100, 2)}%` }} />
              </span>
              <span className="bar-value">
                {r.count}개 <small>{((r.count / total) * 100).toFixed(0)}%</small>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
