"use client";

// 왼쪽 필터 모음: 직군 / 볼 지표 / 정렬 / 조합 필터
// 버튼을 누르면 JobMap.js에 있는 상태(state)를 바꾸는 함수를 불러요.

import { METRICS } from "@/lib/metrics";
import { PRESETS } from "@/lib/presets";

export default function Sidebar({
  groups, // [{ name, count }]
  group,
  setGroup,
  metricKeys, // 이 페이지에서 고를 수 있는 지표들
  metricKey,
  setMetricKey,
  order,
  setOrder,
  presetId,
  setPresetId,
}) {
  return (
    <aside className="sidebar" aria-label="필터">
      <FilterSection title="직군">
        <div className="option-list option-list-scroll">
          {groups.map((g) => (
            <button
              key={g.name}
              type="button"
              className={group === g.name ? "option option-on" : "option"}
              aria-pressed={group === g.name}
              onClick={() => setGroup(g.name)}
            >
              <span>{g.name}</span>
              <span className="option-count">{g.count}</span>
            </button>
          ))}
        </div>
      </FilterSection>

      {/* 고를 지표가 하나뿐이면 (예: 연봉 비교) 이 칸은 숨겨요 */}
      {metricKeys.length > 1 && (
        <FilterSection title="볼 지표">
          <div className="option-list">
            {metricKeys.map((key) => (
              <button
                key={key}
                type="button"
                className={metricKey === key ? "option option-on" : "option"}
                aria-pressed={metricKey === key}
                onClick={() => setMetricKey(key)}
              >
                {METRICS[key].label}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="정렬">
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
      </FilterSection>

      <FilterSection title="조합 필터">
        <div className="option-list">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={presetId === p.id ? "option option-on" : "option"}
              aria-pressed={presetId === p.id}
              onClick={() => setPresetId(p.id)}
              title={p.description}
            >
              {p.label}
            </button>
          ))}
        </div>
      </FilterSection>
    </aside>
  );
}

function FilterSection({ title, children }) {
  return (
    <section className="filter">
      <h2 className="filter-title">{title}</h2>
      {children}
    </section>
  );
}
