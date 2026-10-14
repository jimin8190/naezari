"use client";

// 가운데 막대그래프 목록
//   일반 사무원   ████████████░░░░   3,600만원
//   회계 사무원   ██████████░░░░░░   3,700만원
// 줄을 누르면 그 아래에 다른 지표들이 펼쳐져요.

import { METRICS, METRIC_KEYS } from "@/lib/metrics";

export default function BarList({ jobs, allJobs, metricKey, openId, onToggle, emptyMessage }) {
  const metric = METRICS[metricKey];

  if (jobs.length === 0) {
    return <p className="empty">{emptyMessage || "조건에 맞는 직업이 없어요. 다른 직군이나 필터를 골라보세요."}</p>;
  }

  // 막대 길이 기준: 지금 보이는 목록에서 가장 큰 값 = 100%
  const values = jobs.map((j) => j[metricKey]);
  const max = Math.max(...values.map(Math.abs)) || 1;

  return (
    <ul className="bars">
      {jobs.map((job) => {
        const value = job[metricKey];
        const open = openId === job.id;

        return (
          <li key={job.id} className={open ? "bar-row bar-row-open" : "bar-row"}>
            <button
              type="button"
              className="bar-line"
              aria-expanded={open}
              onClick={() => onToggle(job.id)}
            >
              <span className="bar-name">{job.name}</span>

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

            {open && <JobDetail job={job} allJobs={allJobs} />}
          </li>
        );
      })}
    </ul>
  );
}

// 펼쳤을 때 나오는 상세: 모든 지표 + 전체 직업 중 몇 위
function JobDetail({ job, allJobs }) {
  return (
    <div className="detail">
      <p className="detail-sub">
        {job.group} · 종사자 약 {job.employment.toLocaleString("ko-KR")}천 명
      </p>
      <dl className="detail-grid">
        {METRIC_KEYS.map((key) => {
          // 값이 없으면 "데이터 없음"
          if (job[key] == null) {
            return (
              <div key={key} className="detail-item">
                <dt>{METRICS[key].label}</dt>
                <dd className="detail-none">데이터 없음</dd>
              </div>
            );
          }
          const withValue = allJobs.filter((j) => j[key] != null);
          const sorted = withValue.sort((a, b) => b[key] - a[key]);
          const rank = sorted.findIndex((j) => j.id === job.id) + 1;
          return (
            <div key={key} className="detail-item">
              <dt>{METRICS[key].label}</dt>
              <dd>
                {METRICS[key].format(job[key])}
              </dd>
              <span className="detail-rank">
                {sorted.length}개 중 {rank}위
              </span>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
