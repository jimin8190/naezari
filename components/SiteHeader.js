"use client";

// 모든 페이지 맨 위에 나오는 로고 + 메뉴바
// 지금 보고 있는 메뉴는 usePathname()으로 주소를 읽어서 진하게 표시해요.

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MENU } from "@/lib/pages";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="logo" aria-label="내일의 자리 홈">
          <Image src="/logo-mark.png" alt="" width={69} height={48} className="logo-mark" priority />
          <span className="logo-text">내일의 자리</span>
        </Link>
        <p className="logo-tagline">직업과 상권을 데이터로 미리 보기</p>
      </div>

      <nav className="menubar" aria-label="메뉴">
        <ul className="menubar-inner">
          {MENU.map((item) => {
            const active = pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={active ? "menu-link menu-link-on" : "menu-link"}
                  aria-current={active ? "page" : undefined}
                >
                  {item.menu}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

