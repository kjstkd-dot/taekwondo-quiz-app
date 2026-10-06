import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { DISCIPLINES, DISCIPLINE_KEYS } from '../../../lib/disciplines';
import { STUDENT_COOKIE_NAME, verifyStudentToken } from '../../../lib/studentAuth';

export const dynamic = 'force-dynamic';

const GEMINI_KEY = process.env.GEMINI_API_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const USE_GEMINI = !!GEMINI_KEY;
const MODEL = process.env.TUTOR_MODEL || (USE_GEMINI ? 'gemini-3.8-flash' : 'claude-haiku-4-5-20251001');

async function upstreamMessage(res) {
  const raw = await res.text().catch(() => '');
  let msg = raw;
  try {
    msg = JSON.parse(raw).error?.message || raw;
  } catch {}
  console.error('tutor upstream error', res.status, raw);
  return `${res.status} ${String(msg).slice(0, 160)}`;
}

async function callGemini(system, messages) {
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
    generationConfig: { maxOutputTokens: 2000, temperature: 0.3 },
  };
  const models = [MODEL, process.env.TUTOR_FALLBACK_MODEL || 'gemini-flash-lite-latest'].filter((m, i, a) => a.indexOf(m) === i);
  let lastError = null;

  for (const model of models) {
    const cfg = { ...body.generationConfig };
    if (model.startsWith('gemini-2.5')) cfg.thinkingConfig = { thinkingBudget: 0 };
    for (let attempt = 0; attempt < 3; attempt++) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': GEMINI_KEY },
        body: JSON.stringify({ ...body, generationConfig: cfg }),
      });
      if (res.ok) {
        const data = await res.json();
        const parts = data.candidates?.[0]?.content?.parts || [];
        const out = parts.map((p) => p.text || '').join('\n').trim();
        if (out) return out;
        lastError = new Error(`empty: ${data.promptFeedback?.blockReason || data.candidates?.[0]?.finishReason || 'no text'}`);
        break;
      }
      lastError = new Error(await upstreamMessage(res));
      if (![500, 503, 504].includes(res.status)) break;
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)));
    }
  }
  throw lastError || new Error('unknown error');
}

async function callAnthropic(system, messages) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: MODEL, max_tokens: 500, system, messages }),
  });
  if (!res.ok) {
    throw new Error(await upstreamMessage(res));
  }
  const data = await res.json();
  return (data.content || [])
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
}
const HOURLY_LIMIT = 40;
const MAX_MESSAGES = 8;
const MAX_CONTENT = 400;

const usage = new Map();

function overLimit(studentId) {
  const now = Date.now();
  const recent = (usage.get(studentId) || []).filter((t) => now - t < 60 * 60 * 1000);
  if (recent.length >= HOURLY_LIMIT) {
    usage.set(studentId, recent);
    return true;
  }
  recent.push(now);
  usage.set(studentId, recent);
  return false;
}

function buildSystem(disciplineKo, item, myAnswer) {
  const letters = ['A', 'B', 'C', 'D'];
  const choices = item.c.map((c, i) => `${letters[i]}. ${c}`).join('\n');
  return [
    "당신은 대학 수업 '태권도경기규칙및심판법'의 AI 튜터입니다. 학생이 퀴즈에서 푼 문제를 이해하도록 돕습니다.",
    '',
    '규칙:',
    '- 아래 [문제 자료]에 있는 내용만 근거로 설명합니다. 자료에 없는 조항 번호, 수치, 규정은 지어내지 말고 "경기규칙 원문에서 확인이 필요해요"라고 말합니다.',
    '- 이 문제와 태권도 경기규칙 학습에 관련 없는 요청은 정중히 거절하고 문제로 돌아오게 안내합니다.',
    '- 한국어 존댓말로, 대학생에게 말하듯 쉽고 간결하게 답합니다. 기본 답변은 6문장 이내입니다.',
    '- 학생이 오답을 골랐다면 왜 그 보기가 틀렸는지, 정답은 왜 맞는지를 설명합니다.',
    '- 자료에 근거해 외우기 쉬운 팁을 줄 수 있을 때만 마지막에 한 줄로 덧붙입니다.',
    '',
    `[문제 자료] 종목: ${disciplineKo}`,
    `문제: ${item.q}`,
    choices,
    `정답: ${letters[item.a]}. ${item.c[item.a]}`,
    `해설: ${item.note}`,
    `학생이 선택한 답: ${myAnswer ? myAnswer : '(미응답)'}`,
  ].join('\n');
}

export async function POST(request) {
  const token = cookies().get(STUDENT_COOKIE_NAME)?.value;
  const session = verifyStudentToken(token);
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  if (!GEMINI_KEY && !ANTHROPIC_KEY) return NextResponse.json({ error: 'not_configured' }, { status: 503 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { discipline, question, myAnswer, messages } = body || {};
  if (!DISCIPLINE_KEYS.includes(discipline) || typeof question !== 'string' || !Array.isArray(messages)) {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
  }

  const item = DISCIPLINES[discipline].bank.find((b) => b.q === question);
  if (!item) return NextResponse.json({ error: 'unknown_question' }, { status: 404 });

  const clean = messages
    .slice(-MAX_MESSAGES)
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CONTENT) }));
  while (clean.length && clean[0].role !== 'user') clean.shift();
  if (!clean.length || clean[clean.length - 1].role !== 'user') {
    return NextResponse.json({ error: 'invalid_messages' }, { status: 400 });
  }

  if (overLimit(session.studentId)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }

  const myText = typeof myAnswer === 'string' ? myAnswer.slice(0, 300) : '';

  try {
    const system = buildSystem(DISCIPLINES[discipline].ko, item, myText);
    const text = USE_GEMINI ? await callGemini(system, clean) : await callAnthropic(system, clean);
    if (text === null) return NextResponse.json({ error: 'upstream_error' }, { status: 502 });
    if (!text) return NextResponse.json({ error: 'empty' }, { status: 502 });
    return NextResponse.json({ reply: text });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'upstream_error', detail: String(e?.message || e).slice(0, 200) }, { status: 502 });
  }
}
