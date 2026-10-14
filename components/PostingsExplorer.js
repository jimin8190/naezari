"use client";

// 채용공고 비교 화면 (직군 단위)
//   왼쪽: 지역(전국/시도), 볼 지표, 정렬
//   가운데: 직군별 막대그래프 (줄을 누르면 자세히)
//   아래: 늘어난 직군 / 줄어든 직군 순위

import { useMemo, useState } from "react";
import Rankings from "./Rankings";
import { POSTING_METRICS } from "@/lib/metrics";

const METRIC_KEYS = Object.keys(POSTING_METRICS);
const BOARDS = [
  { title: "공고 많은 직군", key: "openings", order: "desc" },
  { title: "공고 늘어난 직군", key: "openingsChange", order: "desc" },
  { title: "공고 줄어든 직군", key: "openingsChange", order: "asc" },
];

// "2026-09" → "2026년 9월"
const monthLabel = (m) => (m ? `${m.slice(0, 4)}년 ${Number(m.slice(5))}월` : "");

export default function PostingsExplorer({ data }) {
  const { sample, month, previousMonth, regions, groups, values } = data;

  const [region, setRegion] = useState("all");
  const [metricKey, setMetricKey] = useState("openings");
  const [order, setOrder] = useState("desc");
  const [openId, setOpenId] = useState(null);

  const metric = POSTING_METRICS[metricKey];
  const regionName = regions.find((r) => r.code === region)?.name;

  // 지금 고른 지역의 직군 목록 → { id, name, openings, openingsChange, validOpenings, share }
  const items = useMemo(() => {
    const v = values[region] || {};
    const total = Object.values(v).reduce((sum, x) => sum + x.openings, 0) || 1;
    return groups
      .filter((g) => v[g.code])
      .map((g) => ({ id: g.code, name: g.name, ...v[g.code], share: (v[g.code].openings / total) * 100 }));
  }, [values, region, groups]);

  const visible = useMemo(() => {
    const withValue = items.filter((i) => i[metricKey] != null);
    return withValue.sort((a, b) => (order === "desc" ? b[metricKey] - a[metricKey] : a[metricKey] - b[metricKey]));
  }, [items, metricKey, order]);
  const missing = items.length - visible.length;

  const max = Math.max(...visible.map((i) => Math.abs(i[metricKey])), 1);
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  // 기준 월 표시
  const basis = sample
    ? null
    : metricKey === "openingsChange"
      ? previousMonth
        ? `${monthLabel(previousMonth)} → ${monthLabel(month)}`
        : "전달 데이터가 모이면 증감이 나와요"
      : `${monthLabel(month)} 기준`;

  return (
    <>
      <header className="page-head">
        <h1 className="page-title">직군별 채용공고 비교</h1>
        <p className="page-intro">어떤 분야가 사람을 많이 구하는지, 공고가 늘고 있는지 줄고 있는지 지역별로 볼 수 있어요.</p>
        {sample ? (
          <div className="notice" role="note">
            <strong>샘플 데이터</strong> · 아직 고용행정통계 자료를 받기 전이라 예시 숫자를 보여주고 있어요.
          </div>
        ) : (
          <p className="data-basis">
            고용노동부 고용행정통계 · <strong>{monthLabel(month)}</strong> 기준 · 고용24에 등록된 구인 기준이라 민간
            채용사이트 공고는 포함되지 않아요.
          </p>
        )}
      </header>

      <div className="layout">
        <aside className="sidebar" aria-label="필터">
          <section className="filter">
            <h2 className="filter-title">지역</h2>
            <div className="option-list option-list-scroll">
              {regions.map((r) => (
                <button
                  key={r.code}
                  type="button"
                  className={region === r.code ? "option option-on" : "option"}
                  aria-pressed={region === r.code}
                  onClick={() => setRegion(r.code)}
                >
                  {r.name}
                </button>
              ))}
            </div>
          </section>

          <section className="filter">
            <h2 className="filter-title">볼 지표</h2>
            <div className="option-list">
              {METRIC_KEYS.map((key) => (
                <button
                  key={key}
                  type="button"
                  className={metricKey === key ? "option option-on" : "option"}
                  aria-pressed={metricKey === key}
                  onClick={() => setMetricKey(key)}
                >
                  {POSTING_METRICS[key].label}
                </button>
              ))}
            </div>
          </section>

          <section className="filter">
            <h2 className="filter-title">정렬</h2>
            <div className="toggle">
              <button
                type="button"
                className={order === "desc" ? "toggle-btn toggle-on" : "toggle-btn"}
                onClick={() => setOrder("desc")}
              >
                높은 순
              </button>
              <button
                type="button"
                className={order === "asc" ? "toggle-btn toggle-on" : "toggle-btn"}
                onClick={() => setOrder("asc")}
              >
                낮은 순
              </button>
            </div>
          </section>
        </aside>

        <section className="content" aria-live="polite">
          <div className="content-head">
            <h2 className="content-title">
              {regionName} <span className="content-metric">· {metric.label}</span>
            </h2>
            <p className="content-help">{metric.help}</p>
            <p className="content-count">
              {basis && <span className="basis">{basis}</span>}
              {visible.length}개 직군{missing > 0 && ` (데이터 없는 ${missing}개 제외)`} · 줄을 누르면 자세히 보여요
            </p>
          </div>

          {visible.length === 0 ? (
            <p className="empty">
              {metricKey === "openingsChange" ? "전달 데이터가 모이면 증감이 나와요." : "이 지역 데이터가 없어요."}
            </p>
          ) : (
            <ul className="bars">
              {visible.map((item) => {
                const value = item[metricKey];
                const open = openId === item.id;
                return (
                  <li key={item.id} className={open ? "bar-row bar-row-open" : "bar-row"}>
                    <button type="button" className="bar-line bar-line-wide" aria-expanded={open} onClick={() => toggle(item.id)}>
                      <span className="bar-name">{item.name}</span>
                      {metric.bar === "diverging" ? (
                        <span className="track track-diverging" aria-hidden="true">
                          <span className="track-center" />
                          <span
                            className={value >= 0 ? "fill fill-up" : "fill fill-down"}
                            style={
                              value >= 0
                                ? { left: "50%", width: `${(value / max) * 50}%` }
                                : { right: "50%", width: `${(-value / max) * 50}%` }
                            }
                          />
                        </span>
                      ) : (
                        <span className="track" aria-hidden="true">
                          <span className="fill" style={{ width: `${Math.max((value / max) * 100, 1.5)}%` }} />
                        </span>
                      )}
                      <span className="bar-value">{metric.format(value)}</span>
                    </button>

                    {open && (
                      <div className="detail">
                        <dl className="detail-grid">
                          {METRIC_KEYS.map((key) => (
                            <div key={key} className="detail-item">
                              <dt>{POSTING_METRICS[key].label}</dt>
                              <dd className={item[key] == null ? "detail-none" : ""}>
                                {item[key] == null ? "데이터 없음" : POSTING_METRICS[key].format(item[key])}
                              </dd>
                            </div>
                          ))}
                          <div className="detail-item">
                            <dt>{regionName} 전체 공고 중 비중</dt>
                            <dd>{item.share.toFixed(1)}%</dd>
                          </div>
                        </dl>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <Rankings
        jobs={items}
        boards={previousMonth || sample ? BOARDS : BOARDS.slice(0, 1)}
        metrics={POSTING_METRICS}
        onSelect={(id) => {
          setOpenId(id);
          document.querySelector(".content")?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        selectedId={openId}
      />
    </>
  );
}
