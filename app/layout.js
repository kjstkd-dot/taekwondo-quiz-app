import './globals.css';
import Shell from '../components/Shell';

const SITE_URL = 'https://taekwondo-quiz-app.vercel.app';
const SITE_TITLE = '태권도경기규칙및심판법';
const SITE_DESCRIPTION = '겨루기·품새·격파 경기 규칙 퀴즈, 성찰노트, 내 결과 확인';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE,
    images: [
      {
        url: '/og-image.jpg',
        width: 630,
        height: 794,
        alt: '태권도 겨루기·품새·격파 경기규칙',
      },
    ],
    locale: 'ko_KR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Song+Myung&family=Do+Hyeon&family=Noto+Sans+KR:wght@400;500;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
