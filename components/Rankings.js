"use client";

// 페이지 아래쪽 순위표 (TOP 5)
// 어떤 순위표를 보여줄지는 lib/pages.js 의 boards 에서 정해요.

import { METRICS } from "@/lib/metrics";

// metrics: 지표 정의 묶음 (기본은 직업 지표, 채용공고 페이지는 POSTING_METRICS)
export default function Rankings({ jobs, boards, onSelect, selectedId, metrics = METRICS }) {
  return (
    <section className={`rankings rankings-${boards.length}`} aria-label="순위표">
      {boards.map((board) => {
        const metric = metrics[board.key];
        const top = jobs
          .filter((j) => j[board.key] != null) // 값 없는 직업은 순위에서 빼요
          .sort((a, b) => (board.order === "desc" ? b[board.key] - a[board.key] : a[board.key] - b[board.key]))
          .slice(0, 5);

        return (
          <div className="board" key={board.title}>
            <h3 className="board-title">{board.title}</h3>
            <ol className="board-list">
              {top.map((job, i) => (
                <li key={job.id}>
                  <button
                    type="button"
                    className={`board-item ${selectedId === job.id ? "board-item-selected" : ""}`}
                    onClick={() => onSelect(job.id)}
                  >
                    <span className="board-rank">{i + 1}</span>
                    <span className="board-name">{job.name}</span>
                    <span className="board-value">{metric.format(job[board.key])}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        );
      })}
    </section>
  );
}
