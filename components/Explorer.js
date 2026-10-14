"use client";

// 각 메뉴 페이지(연봉 비교, 채용공고 비교 ...)의 본문이에요.
//   왼쪽: Sidebar (필터)
//   가운데: BarList (막대그래프 목록)
//   아래: Rankings (순위표)
// 어떤 지표와 순위표를 보여줄지는 pageKey로 lib/pages.js 에서 찾아와요.

import { useMemo, useState } from "react";
import Sidebar from "./Sidebar";
import BarList from "./BarList";
import Rankings from "./Rankings";
import { METRICS } from "@/lib/metrics";
import { PRESETS, buildContext } from "@/lib/presets";
import { PAGES } from "@/lib/pages";

const ALL = "전체";


export default function Explorer({ data, pageKey }) {
  const page = PAGES[pageKey];
  const { jobs, isSample } = data;

  const [group, setGroup] = useState(ALL);
  const [metricKey, setMetricKey] = useState(page.metricKeys[0]);
  const [order, setOrder] = useState("desc");
  const [presetId, setPresetId] = useState("all");
  const [openId, setOpenId] = useState(null);

  // 직군 목록 (데이터에 나온 순서대로) + 직군별 직업 수
  const groups = useMemo(() => {
    const counts = {};
    jobs.forEach((j) => (counts[j.group] = (counts[j.group] || 0) + 1));
    return [{ name: ALL, count: jobs.length }, ...Object.entries(counts).map(([name, count]) => ({ name, count }))];
  }, [jobs]);

  const context = useMemo(() => buildContext(jobs), [jobs]);
  const preset = PRESETS.find((p) => p.id === presetId);
  const metric = METRICS[metricKey];

  // 직군 → 조합 필터 → 정렬 순서로 걸러내기
  //   값이 없는 직업(통계에 없는 직업, 지난달 파일이 없어서 증감을 못 구한 경우 등)은 목록에서 빼고 개수만 알려줘요
  const { visible, missing } = useMemo(() => {
    const inGroup = jobs.filter((j) => group === ALL || j.group === group).filter((j) => preset.test(j, context));
    const withValue = inGroup.filter((j) => j[metricKey] != null);
    withValue.sort((a, b) => (order === "desc" ? b[metricKey] - a[metricKey] : a[metricKey] - b[metricKey]));
    return { visible: withValue, missing: inGroup.length - withValue.length };
  }, [jobs, group, preset, context, metricKey, order]);


  // 같은 줄을 다시 누르면 접히게
  const toggle = (id) => setOpenId((cur) => (cur === id ? null : id));

  // 아래 순위표에서 직업을 누르면: 그 직업의 직군으로 이동 + 펼치기 + 목록으로 스크롤
  const openFromRanking = (id) => {
    const job = jobs.find((j) => j.id === id);
    setGroup(job.group);
    setPresetId("all");
    setOpenId(id);
    document.querySelector(".content")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <header className="page-head">
        <h1 className="page-title">{page.title}</h1>
        <p className="page-intro">{page.intro}</p>
        {isSample && (
          <div className="notice" role="note">
            <strong>샘플 데이터</strong>
            {" · 화면 구성을 보여주기 위한 예시 숫자예요. 실제 통계가 아니에요."}
          </div>
        )}
      </header>

      <div className="layout">
        <Sidebar
          groups={groups}
          group={group}
          setGroup={setGroup}
          metricKeys={page.metricKeys}
          metricKey={metricKey}
          setMetricKey={setMetricKey}
          order={order}
          setOrder={setOrder}
          presetId={presetId}
          setPresetId={setPresetId}
        />

        <section className="content" aria-live="polite">
          <div className="content-head">
            <h2 className="content-title">
              {group} <span className="content-metric">· {metric.label}</span>
            </h2>
            <p className="content-help">
              {metric.help}
              {presetId !== "all" && (
                <>
                  <br />
                  <strong>{preset.label}</strong>: {preset.description}
                </>
              )}
            </p>
            <p className="content-count">
              {visible.length}개 직업
              {missing > 0 && ` (데이터 없는 ${missing}개 제외)`} · 줄을 누르면 자세히 보여요
            </p>
          </div>

          <BarList
            jobs={visible}
            allJobs={jobs}
            metricKey={metricKey}
            openId={openId}
            onToggle={toggle}
            emptyMessage={missing > 0 ? "이 직군 직업들은 이 지표의 데이터가 아직 없어요." : undefined}
          />
        </section>
      </div>

      <Rankings jobs={jobs} boards={page.boards} onSelect={openFromRanking} selectedId={openId} />
    </>
  );
}
