// 주소: /salary  (연봉 비교 메뉴)
// 서버에서 데이터를 준비해서 Explorer에 넘겨요. 어떤 지표를 보여줄지는 lib/pages.js 의 "salary" 설정을 따라요.

import { getJobData } from "@/lib/jobs";
import { PAGES } from "@/lib/pages";
import Explorer from "@/components/Explorer";

export const revalidate = 86400; // 하루에 한 번 새로 만들기

export const metadata = { title: PAGES.salary.menu };

export default async function Page() {
  const data = await getJobData();
  return <Explorer data={data} pageKey="salary" />;
}
