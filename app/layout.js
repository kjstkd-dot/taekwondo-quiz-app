import './globals.css';
import Shell from '../components/Shell';

export const metadata = {
  title: '태권도경기규칙및심판법',
  description: '겨루기·품새·격파 규칙 퀴즈, 성찰노트, 내 결과 확인',
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
