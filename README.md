# 내일의 자리

직업별 **연봉 · 채용공고 수 · 인력 부족도 · AI 노출도**를 막대그래프로 비교하고,
우리 동네 **상권(같은 업종 가게 수)**을 확인하는 사이트예요.

> ⚠️ 지금 들어 있는 숫자는 **샘플 데이터**예요. 화면이 어떻게 생겼는지 보여주기 위한 예시이고, 실제 통계가 아니에요. 아래 "실제 데이터로 바꾸기"를 따라 교체하세요.

---

## 1. 실행하는 법

컴퓨터에 [Node.js](https://nodejs.org) (20 이상)가 설치돼 있어야 해요.

```bash
cd job-map
npm install      # 처음 한 번만: 필요한 라이브러리 설치
npm run dev      # 개발 서버 켜기
```

브라우저에서 http://localhost:3000 을 열면 돼요. 코드를 고치고 저장하면 화면이 바로 바뀌어요.

---

## 2. 폴더 구조 (어디를 보면 되나)

메뉴(주소)는 4개예요.

| 메뉴 | 주소 | 보여주는 것 |
|---|---|---|
| 연봉 비교 | `/salary` | 평균 연봉 (첫 화면 `/`도 여기로 이동) |
| 채용공고 비교 | `/postings` | 직군별·지역별 신규 공고, 공고 증감, 유효 공고 (매달 자동 수집) |
| AI·인력 전망 | `/outlook` | AI 노출도, 인력 부족도 |
| 상권 확인 | `/market` | 시도 > 시군구 > 동 + 키워드로 가게 수, 업종·층별, 지도, 목록 |

```
job-map/
├─ app/
│  ├─ layout.js            모든 페이지 공통 틀 (로고·메뉴바 / 내용 / 데이터 출처)
│  ├─ page.js              첫 화면 → /salary 로 보냄
│  ├─ salary/page.js       연봉 비교 페이지
│  ├─ postings/page.js     채용공고 비교 페이지
│  ├─ outlook/page.js      AI·인력 전망 페이지
│  ├─ market/page.js       상권 확인 페이지
│  ├─ globals.css          디자인(색, 크기). 색 바꾸려면 맨 위 :root 부분만 수정
│  ├─ api/postings/route.js        /api/postings 주소로 직군별 공고 JSON 제공
│  ├─ api/market/regions/route.js  지역 목록 (시도/시군구/동)
│  └─ api/market/search/route.js   동 + 키워드로 가게 찾기
├─ components/
│  ├─ SiteHeader.js        맨 위 로고 + 메뉴바
│  ├─ SiteFooter.js        맨 아래 데이터 출처
│  ├─ Explorer.js          각 페이지 본문 조립 + 상태 관리 (어떤 직군/지표를 골랐는지)
│  ├─ Sidebar.js           왼쪽 필터 (직군 / 볼 지표 / 정렬 / 조합 필터)
│  ├─ BarList.js           가운데 막대그래프 목록 + 줄 눌렀을 때 펼쳐지는 상세
│  ├─ Rankings.js          아래 TOP 5 순위표
│  ├─ MarketExplorer.js    상권 확인 화면 전체 (지역 선택, 조회, 결과)
│  └─ KakaoMap.js          카카오 지도에 가게 핀 찍기
├─ lib/
│  ├─ pages.js             ⭐ 메뉴별 설정 (메뉴 이름, 보여줄 지표, 순위표)
│  ├─ jobs.js              데이터 모으는 곳 (JSON + 월별 공고 통계)
│  ├─ postings.js          data/postings/ 월별 공고 통계 읽기 (직군 × 시도)
│  ├─ metrics.js           지표 목록 (연봉, 공고 수 ...) + 표시 형식
│  ├─ presets.js           조합 필터 ("AI 안전 + 연봉 괜찮은" 등)
│  ├─ market.js            상권 조회 두뇌 (키 있으면 진짜 API, 없으면 샘플)
│  ├─ semas.js             소상공인 상가(상권)정보 OPEN API 호출
│  ├─ keywords.js          키워드 비슷한 말 묶음 (빵집 → 빵, 제과, 베이커리, 도넛)
│  └─ market-sample.js     키 없을 때 쓰는 가짜 지역·가게 데이터
├─ scripts/
│  ├─ update-postings.mjs  고용행정통계 API → data/postings/YYYY-MM.json 자동 수집
│  └─ eis-areas.mjs        수집할 시·군·구 코드 목록
└─ data/
   ├─ jobs.sample.json     직업 데이터 (지금은 샘플)
   └─ postings/            월별 공고 통계 (자동 수집 결과)
```

**처음 읽기 좋은 순서:** `lib/pages.js` → `app/salary/page.js` → `components/Explorer.js` → `components/BarList.js`

### 메뉴 추가하는 법
1. `lib/pages.js`의 `PAGES`에 항목 추가 (예: `newpage: { path: "/newpage", menu: "새 메뉴", ... }`)
2. `app/salary` 폴더를 복사해서 `app/newpage`로 이름 바꾸고, 안의 `"salary"`를 `"newpage"`로 수정
3. 메뉴바에는 자동으로 추가돼요

### 알아두면 좋은 개념 2개
- **`"use client"`** 가 맨 위에 있는 파일은 **브라우저**에서 실행돼요 (클릭, 화면 변화 담당).
  없는 파일(`app/page.js`, `lib/*`)은 **서버**에서 실행돼요 (데이터 준비, API 키 사용).
- API 키는 서버 쪽 코드(`lib/semas.js`)에서만 쓰기 때문에 방문자에게 보이지 않아요.
  예외: 카카오 지도 키(`NEXT_PUBLIC_...`)는 원래 브라우저에서 쓰는 공개용 키예요.

---

## 3. 실제 데이터로 바꾸기

`data/jobs.sample.json`의 각 직업은 이런 모양이에요.

```json
{
  "id": "nurse",            // 영어 고유값 (아무거나, 겹치지만 않게)
  "name": "간호사",
  "group": "의료·보건",      // 지도에서 묶이는 직군
  "keco": "",               // 한국고용직업분류 코드 (통계 연결용)
  "employment": 290,        // 종사자 수 (천 명) → 상세 정보에 표시
  "salary": 4700,           // 평균 연봉 (만원)
  "shortageRate": 22,       // 미충원율 (%)
  "aiExposure": 35          // AI 노출도 (0~100)
}
```

| 항목 | 어디서 구하나 | 갱신 |
|---|---|---|
| `salary`, `employment` | 고용형태별근로실태조사 — [wage.go.kr](https://www.wage.go.kr), [KOSIS](https://kosis.kr) | 1년 |
| `shortageRate` | 직종별사업체노동력조사 — [고용노동통계](https://laborstat.moel.go.kr) | 반년 |
| `aiExposure` | 한국은행 BOK 이슈노트 「AI와 노동시장 변화」 직업별 AI 노출지수 | 보고서 |

교체 방법:
1. `data/jobs.sample.json`을 복사해서 `data/jobs.json`으로 저장
2. 숫자를 실제 통계로 바꾸고, `"isSample": false`, `"updatedAt": "2026-10"`처럼 수정
3. `lib/jobs.js` 맨 위의 `@/data/jobs.sample.json`을 `@/data/jobs.json`으로 변경

⚠️ 공공데이터를 쓸 때는 데이터마다 붙어 있는 **공공누리 유형**을 확인하세요. 광고를 붙일 계획이면 상업적 이용이 허용된 1유형/3유형 데이터인지 봐야 해요. 사이트 아래 "데이터 출처"는 유형과 상관없이 꼭 남겨두세요.

---

## 4. 채용공고 데이터 (자동 수집)

채용공고 비교 메뉴는 고용노동부 **고용행정통계 Open API**에서 데이터를 자동으로 가져와요. **인증키가 필요 없어요.**

```bash
npm run update:postings            # 가장 최근 발표된 달 + 그 전 달을 채워요
npm run update:postings -- 2026-09 # 특정 달만
```

### 어떻게 동작하나
- API가 **시·군·구 단위**로만 답을 줘서, `scripts/eis-areas.mjs`의 270곳을 한 곳씩 물어보고 **시도 × 직군**으로 더해요.
- 직군은 고용24 **직종 대분류 10개**예요 (경영·사무, 보건·의료, 건설·채굴 …). 개별 직업 단위는 API에 없어요.
- 결과는 `data/postings/2026-09.json` 같은 파일로 저장돼요. 지난달 파일과 비교해서 **공고 증감**을 계산해요.
- 통계는 보통 **한 달 늦게** 나와요 (10월 중순이면 9월 자료).

### ⚠️ 하루 조회 한도
- 같은 IP에서 하루에 조회할 수 있는 횟수에 **한도**가 있어요. (정확한 숫자는 공개돼 있지 않아요. 수백 번 정도에서 걸렸어요)
- 한 달 치를 모으려면 270번 조회가 필요해서, 한도에 걸리면 **모은 데까지 저장하고 멈춰요** (`data/postings/.partial-2026-09.json`).
- 다음 날 같은 명령을 다시 실행하면 **멈춘 곳부터 이어서** 해요.

### 매달 손대지 않게: GitHub Actions
`.github/workflows/update-postings.yml`이 들어 있어서, 프로젝트를 GitHub에 올리면 **매일 아침 6시쯤 자동으로 실행**돼요.
- 이미 다 모은 달이면 조회 몇 번만 하고 바로 끝나요.
- 새 데이터가 생기면 저장소에 자동으로 커밋 → Vercel이 사이트를 자동으로 다시 배포해요.
- GitHub 저장소 → Settings → Actions → General → **Workflow permissions**를 "Read and write"로 바꿔야 커밋할 수 있어요.
- Actions 탭에서 "채용공고 데이터 업데이트"를 골라 **Run workflow**로 바로 실행해 볼 수도 있어요.

### 행정구역이 바뀌면
새로 생긴 구·군 코드는 `scripts/eis-areas.mjs`에 추가하세요. 빠진 지역의 공고는 합계에서 빠져요.
(현재 인천 영종구·검단구 코드는 확인하지 못해서 빠져 있어요)

---

## 5. 상권 확인 연결하기

### 5-1. 가게 데이터 (무료)
1. [공공데이터포털](https://www.data.go.kr)에서 **"소상공인시장진흥공단_상가(상권)정보"** 검색 → 오픈API **활용신청**
2. 마이페이지에서 **일반 인증키(Decoding)** 복사 → `.env.local`에 `SEMAS_API_KEY=키`
3. 개발 서버 껐다 켜기 → 상권 확인의 지역 목록이 전국으로 바뀌어요

- 활용신청 페이지에서 **이용허락범위(공공누리 유형)**를 꼭 확인하세요. 광고를 붙일 거라면 상업적 이용이 되는지 봐야 해요.
- 응답이 이상하면 활용신청 페이지의 참고문서와 `lib/semas.js`의 주소·필드 이름을 비교해 보세요. (API가 개편되면 이름이 바뀔 수 있어요)
- 이 자료는 **분기마다** 갱신돼요. 최근에 열거나 닫은 가게는 늦게 반영돼요.

### 5-2. 카카오 지도 켜기 (무료)
1. [카카오 개발자](https://developers.kakao.com) 로그인 → 내 애플리케이션 → 앱 만들기
2. 앱 설정 → **카카오맵 활성화**, 플랫폼 → **Web**에 `http://localhost:3000` (배포 후엔 사이트 주소도) 등록
3. **JavaScript 키** 복사 → `.env.local`에 `NEXT_PUBLIC_KAKAO_MAP_KEY=키`

카카오 지도 웹 API는 첫 번째 앱은 무료예요. 무료 사용량을 넘기거나 앱을 여러 개 쓰면 유료 설정(비즈월렛)이 필요해요.

### 5-3. 방문자 수, 매출은?
- **방문자 수·리뷰 수**: 네이버·카카오가 공식 API로 주지 않아요. 크롤링은 약관 위반 소지가 있어서, 화면에는 "네이버 지도에서 보기" 링크만 달아뒀어요.
- **추정 매출**: 무료 공개 API가 없어요. 소상공인 상권정보시스템(sg.sbiz.or.kr) 링크로 연결해 뒀어요. 서울은 「서울시 상권분석서비스」 추정매출 데이터(행정동·업종별)를 따로 붙일 수 있어요.

---

## 6. 고쳐보기 좋은 곳 (연습용)

- **색 바꾸기:** `app/globals.css` 맨 위 `--accent` 값
- **조합 필터 추가:** `lib/presets.js`의 `PRESETS` 배열에 항목 추가
- **순위표 추가:** `lib/pages.js`에서 원하는 페이지의 `boards`에 `{ title: "인력 부족한 직업", key: "shortageRate", order: "desc" }` 같은 항목 추가
- **상권 키워드 추가:** `lib/keywords.js`의 `SYNONYMS`에 `"꽃집": ["꽃", "화원"]`처럼 추가
- **빠른 키워드 버튼:** `components/MarketExplorer.js` 맨 위 `QUICK_KEYWORDS`
- **새 지표 추가:** `lib/metrics.js`의 `METRICS`에 항목 추가 + JSON에 같은 이름의 값 넣기

---

## 7. 배포 (공개 사이트로)

[Vercel](https://vercel.com)에 깃허브 저장소를 연결하면 무료로 바로 올라가요.
Vercel 프로젝트 설정 → Environment Variables에 `.env.local`과 같은 키 2개를 넣어주세요.
채용공고 데이터는 위 4번의 GitHub Actions가 매일 자동으로 갱신해요.
카카오 개발자 앱의 Web 플랫폼에 배포된 사이트 주소도 추가해야 지도가 떠요.
