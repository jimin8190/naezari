// 주소: / (첫 화면)
// 첫 화면은 "연봉 비교" 메뉴로 바로 보내요.
// 나중에 소개 페이지를 만들고 싶으면 이 파일에 화면을 그리면 돼요.

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/salary");
}
