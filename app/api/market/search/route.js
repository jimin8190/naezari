// 주소: /api/market/search?dong=행정동코드&keyword=빵집
// 그 동에서 키워드에 맞는 가게 수와 목록을 돌려줘요.

import { searchMarket } from "@/lib/market";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dong = searchParams.get("dong") || "";
  const keyword = (searchParams.get("keyword") || "").trim();

  if (!/^[A-Za-z0-9]{1,12}$/.test(dong)) return Response.json({ error: "동을 선택해 주세요." }, { status: 400 });
  if (!keyword) return Response.json({ error: "찾을 키워드를 입력해 주세요." }, { status: 400 });
  if (keyword.length > 20) return Response.json({ error: "키워드는 20자 이내로 입력해 주세요." }, { status: 400 });

  try {
    return Response.json(await searchMarket(dong, keyword));
  } catch (err) {
    console.error("[상권] 조회 실패:", err);
    return Response.json({ error: "상가 정보를 불러오지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 502 });
  }
}
