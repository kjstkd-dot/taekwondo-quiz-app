'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const EXTERNAL_NOTES_URL = 'https://class-reflection-kjs.kjstkd.chatgpt.site/';

function titleFor(pathname) {
  if (pathname.startsWith('/quiz')) return '경기 규칙 퀴즈';
  if (pathname.startsWith('/my-results')) return '내 결과';
  if (pathname.startsWith('/guide')) return '사용 안내';
  if (pathname.startsWith('/scoring')) return '심판 채점실습';
  if (pathname.startsWith('/admin')) return '관리자';
  if (pathname.startsWith('/login')) return '학생 로그인';
  return '태권도경기규칙및심판법';
}

export default function Shell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const showBack = pathname !== '/';
  const [me, setMe] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  }, []);

  useEffect(() => {
    let alive = true;
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : { loggedIn: false }))
      .then((data) => {
        if (alive) setMe(data);
      })
      .catch(() => {
        if (alive) setMe({ loggedIn: false });
      });
    return () => {
      alive = false;
    };
  }, [pathname]);

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setMe({ loggedIn: false });
    router.push('/');
    router.refresh();
  }

  return (
    <div id="shell">
      <header id="topbar">
        {showBack ? (
          <Link href="/" className="back" aria-label="홈으로">
            ‹
          </Link>
        ) : null}
        <span className="ttl">{titleFor(pathname)}</span>
        {me?.loggedIn && (
          <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--on-ink-mute)' }}>
            {me.name}님
            <button
              type="button"
              onClick={logout}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--on-ink-mute)',
                fontSize: 11,
                cursor: 'pointer',
                textDecoration: 'underline',
                padding: 0,
                font: 'inherit',
              }}
            >
              로그아웃
            </button>
          </span>
        )}
      </header>
      <main id="screen">{children}</main>
      <nav id="tabbar">
        <Link href="/" className={pathname === '/' ? 'active' : ''}>
          <span className="ico">홈</span>홈
        </Link>
        <Link href="/quiz" className={pathname.startsWith('/quiz') ? 'active' : ''}>
          <span className="ico">퀴</span>퀴즈
        </Link>
        <a href={EXTERNAL_NOTES_URL} target="_blank" rel="noopener noreferrer">
          <span className="ico">노</span>성찰노트
        </a>
        <Link href="/my-results" className={pathname.startsWith('/my-results') ? 'active' : ''}>
          <span className="ico">결</span>내 결과
        </Link>
      </nav>
    </div>
  );
}
