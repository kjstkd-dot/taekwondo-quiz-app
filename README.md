# 태권도경기규칙및심판법 퀴즈 웹앱 

겨루기/품새/격파 규칙 퀴즈 + **학번·비밀번호 학생 로그인** + 학생별 응시 기록(내 결과) +
관리자 대시보드(전체 학생 시계열 모니터링)를 갖춘 실제 웹앱입니다. Claude Artifact가 아니라
진짜 서버(데이터베이스 포함)를 쓰기 때문에, 학생이 어떤 기기로 접속하든 로그인만 하면 기록이
서버에 쌓이고 교수자가 한 화면에서 전체 현황을 볼 수 있습니다.

학생은 처음 접속 시 학번+이름+비밀번호로 계정을 만들고(비밀번호는 암호화 저장), 이후에는
학번+비밀번호로 로그인합니다. 로그인해야만 퀴즈를 풀 수 있고, 퀴즈 결과는 로그인한 본인
계정으로만 저장되므로 다른 사람 이름으로 응시하거나 남의 기록을 조회할 수 없습니다.

이 컴퓨터에는 Node.js가 설치되어 있지 않아서, 이 대화에서는 로컬로 실행/빌드 테스트를 하지 못했습니다.
아래 순서대로 하면 **내 컴퓨터에 아무것도 설치하지 않고** 클라우드에서 바로 빌드·배포됩니다
(GitHub과 Vercel이 알아서 설치·빌드해줍니다). 만약 배포 중 오류가 나면, 오류 메시지를 그대로
저에게 붙여넣어 주시면 고쳐드리겠습니다.

## 1단계 — Supabase(데이터베이스) 만들기

1. https://supabase.com 에서 무료 계정을 만듭니다(GitHub 계정으로 가입 가능).
2. "New project"로 새 프로젝트를 만듭니다. 이름은 아무거나(`taekwondo-quiz` 등), 데이터베이스 비밀번호는
   따로 저장해두세요(나중에 안 씁니다).
3. 프로젝트가 만들어지면 왼쪽 메뉴 **SQL Editor** 로 들어갑니다.
4. 이 폴더의 [`supabase/schema.sql`](supabase/schema.sql) 파일을 열어서 내용 전체를 복사하고,
   SQL Editor에 붙여넣은 뒤 **Run** 을 누릅니다. (응시 기록 테이블과 학생 계정 테이블, 총 2개가
   만들어집니다.)
5. 왼쪽 메뉴 **Project Settings → API** 로 들어가서 아래 두 값을 복사해둡니다.
   - **Project URL** (예: `https://xxxxx.supabase.co`)
   - **service_role** 키 (`anon` 키가 아니라 **service_role** 키입니다 — 절대 외부에 공개하지 마세요)

## 2단계 — GitHub에 이 폴더 올리기

1. https://github.com 에서 무료 계정을 만듭니다(이미 있으면 생략).
2. 오른쪽 위 **+ → New repository** 로 새 저장소를 만듭니다. 이름은 `taekwondo-quiz-app` 등 원하는 대로,
   Public/Private 아무거나 상관없습니다. "Add a README" 체크는 끄세요.
3. 저장소 페이지에서 **uploading an existing file** 링크를 클릭합니다.
4. 이 `quiz-webapp` 폴더 안의 모든 파일/폴더를 웹 화면으로 통째로 드래그해서 올립니다
   (폴더 구조가 그대로 유지되어 업로드됩니다). `node_modules`는 애초에 없으니 신경 쓰지 않아도 됩니다.
5. 커밋 메시지를 아무거나 입력하고 **Commit changes** 를 누릅니다.

## 3단계 — Vercel에 배포하기

1. https://vercel.com 에서 **Continue with GitHub** 로 가입/로그인합니다.
2. **Add New → Project** 를 누르고, 방금 만든 GitHub 저장소를 선택해 **Import** 합니다.
3. Framework는 자동으로 "Next.js"로 잡힙니다. 그대로 두고, **Environment Variables** 항목을 펼쳐서
   아래 네 가지를 입력합니다 (`.env.example` 파일 참고):

   | Key | Value |
   |---|---|
   | `SUPABASE_URL` | 1단계에서 복사한 Project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | 1단계에서 복사한 service_role 키 |
   | `ADMIN_PASSWORD` | 교수님이 정하는 관리자 비밀번호 (원하는 문자열) |
   | `COOKIE_SECRET` | 아무 긴 임의의 문자열 (예: 키보드를 막 눌러 30자 이상) |

4. **Deploy** 를 누릅니다. 1~2분 정도면 빌드가 끝나고 `https://프로젝트이름.vercel.app` 링크가 생깁니다.
   이 링크가 학생들에게 공유할 최종 주소입니다.

## 배포 후 확인해볼 것

- 링크 접속 → 홈 화면이 뜨는지
- **학생 로그인 / 시작하기** → "처음이신가요? 비밀번호 설정하기"로 학번/이름/비밀번호를 등록 →
  자동으로 로그인되고 퀴즈 화면으로 이동하는지
- **퀴즈** 탭 → 아무 종목이나 골라 20문항을 끝까지 풀어보기 → 결과 화면에서 "결과가 저장되었습니다"
  메시지가 뜨는지
- **내 결과** 탭 → 방금 푼 기록이 로그인 없이 바로 나오는지, 클릭하면 오답까지 펼쳐지는지
- 로그아웃 후 같은 학번/비밀번호로 다시 로그인해서 내 결과가 그대로 남아있는지 (다른 기기/브라우저로
  로그인해도 동일하게 보이면 정상)
- 홈 화면 맨 아래 **관리자 로그인** → 위에서 정한 `ADMIN_PASSWORD` 입력 → 대시보드에서 방금 응시 기록이
  보이는지 (겨루기/품새/격파 시계열 그래프, 학생별 요약, 전체 로그)

## 이후에 문항을 수정/추가하고 싶다면

`lib/banks/gyeorugi.js`, `pumsae.js`, `gyeokpa.js` 파일 안의 배열을 수정한 뒤, 같은 파일을
GitHub 저장소에 다시 업로드(덮어쓰기)하면 Vercel이 자동으로 재배포합니다. 코드를 몰라도
`{q:"...", c:["...","...","...","..."], a:0, note:"..."}` 형식만 그대로 지키면 됩니다
(`a`는 정답 보기의 번호, 0부터 시작).

## 로컬에서 직접 실행해보고 싶다면 (선택 사항)

Node.js 20 버전 이상을 설치한 뒤, 이 폴더에서:

```bash
npm install
cp .env.example .env.local   # 값을 채워넣기
npm run dev
```

`http://localhost:3000` 으로 접속하면 됩니다. 다만 이 과정은 필수가 아니며, 위 GitHub+Vercel
방법만으로도 배포·운영에 아무 문제 없습니다.

## 구조 참고

- `app/` — 페이지들 (Next.js App Router)
- `app/login` — 학생 로그인 / 최초 비밀번호 설정 화면
- `app/api/auth/*` — 학생 회원가입/로그인/로그아웃/로그인 상태 확인 API
- `app/api/attempts` — 퀴즈 결과 저장 API (로그인한 본인 계정으로만 저장됨)
- `app/api/admin/*` — 관리자 로그인/로그아웃/전체 조회 API (비밀번호 필요)
- `lib/banks/*.js` — 겨루기/품새/격파 문제 은행 (기존 아티팩트에서 그대로 이식)
- `lib/studentAuth.js` — 학생 로그인 쿠키를 서명/검증하는 로직 (HMAC, 30일 유지)
- `lib/adminAuth.js` — 관리자 로그인 쿠키를 서명/검증하는 로직 (HMAC, 12시간 유지)
- `components/QuizRunner.js` — 퀴즈 진행 UI (클라이언트)
- `components/MyResultsClient.js` — 내 결과 화면 UI (클라이언트)
- `components/AdminDashboardClient.js` — 관리자 대시보드 UI (시계열 그래프는 recharts 사용)
- `supabase/schema.sql` — Supabase에 한 번 실행할 테이블 생성 SQL (attempts, students)

## 알아두면 좋은 점 / 한계

- 비밀번호를 잊어버린 학생은 지금 버전에서는 스스로 재설정할 방법이 없습니다. 관리자가 Supabase
  대시보드의 `students` 테이블에서 해당 학번 행을 삭제하면 그 학번으로 다시 등록(비밀번호 재설정)할
  수 있습니다. (기존 응시 기록은 `attempts` 테이블에 그대로 남아있어요.)
- 이미 예전 버전(로그인 없이 이름/학번을 직접 입력하던 방식)으로 응시한 기록이 있다면, 그 기록의
  `student_id`가 실제 학번과 다르게 입력되어 있을 수 있습니다. 필요하면 Supabase SQL Editor에서
  `attempts` 테이블을 직접 확인/수정해주세요.
