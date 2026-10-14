// 주소: /api/market/regions?level=sido
//       /api/market/regions?level=sigungu&parent=시도코드
//       /api/market/regions?level=dong&parent=시군구코드
// 화면의 지역 선택 상자에 들어갈 목록을 돌려줘요.

import { getRegions } from "@/lib/market";

const LEVELS = ["sido", "sigungu", "dong"];

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const level = searchParams.get("level");
  const parent = searchParams.get("parent") || "";

  // 이상한 값이 들어오면 바로 돌려보내요
  if (!LEVELS.includes(level)) return Response.json({ error: "level 값이 올바르지 않아요." }, { status: 400 });
  if (level !== "sido" && !/^[A-Za-z0-9]{1,12}$/.test(parent))
    return Response.json({ error: "parent 코드가 올바르지 않아요." }, { status: 400 });

  try {
    return Response.json(await getRegions(level, parent));
  } catch (err) {
    console.error("[상권] 지역 목록 실패:", err);
    return Response.json({ error: "지역 목록을 불러오지 못했어요." }, { status: 502 });
  }
}
