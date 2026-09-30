-- Supabase SQL Editor 에서 이 파일 내용을 통째로 붙여넣고 실행하세요.

create extension if not exists "pgcrypto";

create table if not exists attempts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  student_id text not null,
  discipline text not null check (discipline in ('gyeorugi', 'pumsae', 'gyeokpa')),
  score int not null,
  total int not null,
  percentage int not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_attempts_student on attempts (student_id);
create index if not exists idx_attempts_created on attempts (created_at desc);
create index if not exists idx_attempts_discipline on attempts (discipline);

-- 학생 계정 (학번 + 비밀번호 로그인용). 비밀번호는 해시로만 저장됩니다.
create table if not exists students (
  student_id text primary key,
  name text not null,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- 이 앱의 서버 코드는 service_role 키로만 이 테이블들에 접근합니다(클라이언트에는
-- 절대 노출되지 않음). Row Level Security를 켜고 별도 정책을 주지 않으면
-- service_role만 접근 가능해져서 가장 안전합니다.
alter table attempts enable row level security;
alter table students enable row level security;
