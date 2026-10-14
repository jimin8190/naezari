"use client";

// 카카오 지도에 가게 위치를 핀으로 찍어요.
//
// 필요한 것: 카카오 개발자(developers.kakao.com)에서 앱 만들기 → "JavaScript 키" 복사
//            → .env.local 에 NEXT_PUBLIC_KAKAO_MAP_KEY=키 저장
//            → 카카오 앱 설정의 [플랫폼 > Web]에 사이트 주소(예: http://localhost:3000) 등록
// 키가 없으면 지도 대신 안내 문구를 보여줘요.
// (NEXT_PUBLIC_ 으로 시작하는 값은 브라우저에 공개돼요. JavaScript 키는 원래 공개용이라 괜찮아요.)

import { useEffect, useRef, useState } from "react";

const KAKAO_KEY = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;

// 카카오 지도 스크립트를 한 번만 불러오기
let loader;
function loadKakao() {
  if (loader) return loader;
  loader = new Promise((resolve, reject) => {
    if (window.kakao?.maps) return window.kakao.maps.load(() => resolve(window.kakao));
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_KEY}&autoload=false`;
    script.onload = () => window.kakao.maps.load(() => resolve(window.kakao));
    script.onerror = () => reject(new Error("카카오 지도 스크립트를 불러오지 못했어요."));
    document.head.appendChild(script);
  });
  return loader;
}

export default function KakaoMap({ stores, focusId, onFocus }) {
  const boxRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({}); // id → { marker, info }
  const [error, setError] = useState("");

  // 가게 목록이 바뀌면 핀을 다시 찍어요
  useEffect(() => {
    if (!KAKAO_KEY || !boxRef.current) return;
    let cancelled = false;

    loadKakao()
      .then((kakao) => {
        if (cancelled) return;
        const { maps } = kakao;
        if (!mapRef.current) {
          mapRef.current = new maps.Map(boxRef.current, { center: new maps.LatLng(37.5665, 126.978), level: 5 });
        }
        const map = mapRef.current;

        // 이전 핀 지우기
        Object.values(markersRef.current).forEach(({ marker, info }) => {
          marker.setMap(null);
          info.close();
        });
        markersRef.current = {};

        const bounds = new maps.LatLngBounds();
        stores.forEach((s) => {
          if (!s.lat || !s.lon) return;
          const pos = new maps.LatLng(s.lat, s.lon);
          const marker = new maps.Marker({ map, position: pos, title: s.name });
          const info = new maps.InfoWindow({ content: infoHtml(s) });
          maps.event.addListener(marker, "click", () => onFocus?.(s.id));
          markersRef.current[s.id] = { marker, info };
          bounds.extend(pos);
        });
        if (!bounds.isEmpty()) map.setBounds(bounds);
      })
      .catch((err) => setError(err.message));

    return () => {
      cancelled = true;
    };
  }, [stores, onFocus]);

  // 목록에서 가게를 누르면 그 핀으로 이동 + 말풍선
  useEffect(() => {
    const map = mapRef.current;
    Object.entries(markersRef.current).forEach(([id, { marker, info }]) => {
      if (id === focusId) {
        info.open(map, marker);
        map.panTo(marker.getPosition());
      } else {
        info.close();
      }
    });
  }, [focusId]);

  if (!KAKAO_KEY) {
    return (
      <div className="map-placeholder">
        <strong>지도를 보려면 카카오 지도 키가 필요해요</strong>
        <span>
          카카오 지도 웹 API는 무료로 쓸 수 있어요. README의 &lsquo;카카오 지도 켜기&rsquo;를 따라 키를 넣으면 이
          자리에 가게 위치가 핀으로 표시돼요.
        </span>
      </div>
    );
  }
  if (error) return <div className="map-placeholder">{error}</div>;
  return <div className="map" ref={boxRef} role="region" aria-label="가게 위치 지도" />;
}

// 말풍선 안에 들어갈 내용 (가게 이름은 특수문자를 안전하게 바꿔서 넣어요)
function infoHtml(s) {
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  return `<div style="padding:6px 10px;font-size:13px;line-height:1.4;white-space:nowrap;color:#1c1b19">
    <strong>${esc(s.name)}${s.branch ? " " + esc(s.branch) : ""}</strong><br/>${esc(s.categorySmall)}</div>`;
}
