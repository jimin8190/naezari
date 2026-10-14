// 모든 페이지 맨 아래 "데이터 출처"
// 공공데이터는 출처 표시가 필수라서 모든 페이지에 나오게 layout.js 에 넣었어요.

import { SOURCES } from "@/lib/jobs";

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <h3>데이터 출처</h3>
        <ul>
          {SOURCES.map((s) => (
            <li key={s.name}>
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.name}
              </a>
            </li>
          ))}
        </ul>
        <p>AI 노출도는 &lsquo;AI가 할 수 있는 업무 비중&rsquo;이에요. 점수가 높다고 그 직업이 사라진다는 뜻은 아니에요.</p>
      </div>
    </footer>
  );
}
