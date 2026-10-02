'use client';

import { useEffect, useState } from 'react';

const SITE_URL = 'https://taekwondo-quiz-app.vercel.app';

function isIos() {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

export function InstallCard() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [hidden, setHidden] = useState(true);
  const [ios, setIos] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    setHidden(isStandalone());
    setIos(isIos());

    function onBeforeInstall(e) {
      e.preventDefault();
      setDeferredPrompt(e);
    }
    function onInstalled() {
      setHidden(true);
      setDeferredPrompt(null);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (hidden) return null;

  async function handleClick() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch (e) {
        // ignore cancellation
      }
      setDeferredPrompt(null);
      return;
    }
    setShowGuide(true);
  }

  return (
    <>
      <button type="button" className="navcard" onClick={handleClick}>
        <span className="badge" style={{ background: '#1447E6' }}>⬇</span>
        <span className="body">
          <span className="ttl">앱 설치</span>
          <span className="desc">홈 화면에 추가하면 앱처럼 바로 실행할 수 있어요</span>
        </span>
        <span className="chev">›</span>
      </button>

      {showGuide && (
        <div
          onClick={() => setShowGuide(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 100, display: 'flex', alignItems: 'flex-end' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--surface)',
              borderRadius: '18px 18px 0 0',
              padding: 20,
              width: '100%',
              maxWidth: 480,
              margin: '0 auto',
              boxSizing: 'border-box',
            }}
          >
            <h3 style={{ marginBottom: 12 }}>홈 화면에 앱 추가하기</h3>
            {ios ? (
              <ol style={{ paddingLeft: 18, lineHeight: 1.8, fontSize: 14, color: 'var(--text)' }}>
                <li>Safari 하단의 공유 버튼을 눌러요</li>
                <li>메뉴에서 <strong>홈 화면에 추가</strong>를 선택해요</li>
                <li><strong>추가</strong>를 누르면 완료!</li>
              </ol>
            ) : (
              <ol style={{ paddingLeft: 18, lineHeight: 1.8, fontSize: 14, color: 'var(--text)' }}>
                <li>브라우저 메뉴(⋮ 또는 ···)를 열어요</li>
                <li><strong>앱 설치</strong> 또는 <strong>홈 화면에 추가</strong>를 선택해요</li>
                <li>안내에 따라 설치를 완료해요</li>
              </ol>
            )}
            <button type="button" className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => setShowGuide(false)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export function ShareCard() {
  const [status, setStatus] = useState('idle');

  async function handleShare() {
    const shareData = {
      title: '태권도경기규칙및심판법',
      text: '겨루기·품새·격파 경기 규칙 퀴즈와 성찰노트를 한 곳에서!',
      url: SITE_URL,
    };
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (e) {
        // user cancelled — ignore
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(SITE_URL);
      setStatus('copied');
      setTimeout(() => setStatus('idle'), 2000);
    } catch (e) {
      setStatus('idle');
    }
  }

  return (
    <button type="button" className="navcard" onClick={handleShare}>
      <span className="badge" style={{ background: '#6B4FA0' }}>↗</span>
      <span className="body">
        <span className="ttl">{status === 'copied' ? '링크를 복사했어요!' : '친구에게 공유하기'}</span>
        <span className="desc">링크를 보내서 같이 퀴즈를 풀어보세요</span>
      </span>
      <span className="chev">›</span>
    </button>
  );
}
