import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/ui/PhoneFrame';
import PrimaryBtn from '../components/ui/PrimaryBtn';
import { Close, QuizIcon, Check, Coin } from '../components/icons';
import { Api } from '../lib/api';
import { QUIZ } from '../data';
import { useApp } from '../context/AppContext';
import type { QuizQuestion } from '../types';

interface ServerResult {
  correct: boolean;
  answerIndex: number;
  reward: number;
  explanation: string;
}

export default function QuizPage() {
  const navigate = useNavigate();
  const { tweaks, addPoints, setQuizDone } = useApp();
  const [quizQ, setQuizQ] = useState<QuizQuestion | null>(null);
  const [sel, setSel] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [earned, setEarned] = useState(0);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<ServerResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await Api.getQuizToday() as Record<string, unknown>;
        setQuizQ({
          id: (data.id as number) ?? 0,
          q: (data.question as string) || (data.q as string),
          choices: data.choices as string[],
          answer: data.answer as number,
          explain: (data.explanation as string) || (data.explain as string),
          reward: (data.reward as number) ?? 20,
        });
      } catch {
        const idx = new Date().getDate() % QUIZ.length;
        setQuizQ(QUIZ[idx]);
      }
    }
    load();
  }, []);

  if (!quizQ) {
    return (
      <PhoneFrame tweaks={tweaks}>
        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, background: 'linear-gradient(180deg, var(--brand-soft), var(--brand-wash) 55%)' }}>
          <div style={{ width: 34, height: 34, borderRadius: 999, border: '3px solid var(--brand-soft)', borderTopColor: 'var(--brand)', animation: 'finspin .8s linear infinite' }} />
          <span style={{ fontSize: 14, color: 'var(--sub)', fontWeight: 600 }}>오늘의 퀴즈를 불러오는 중…</span>
        </div>
      </PhoneFrame>
    );
  }

  const answerIdx = result ? result.answerIndex : quizQ.answer;
  const isCorrect = result ? !!result.correct : sel === quizQ.answer;
  const explainText = result ? (result.explanation || quizQ.explain) : quizQ.explain;

  const submit = async () => {
    if (sel == null || submitting) return;
    setSubmitting(true);
    try {
      const r = await Api.submitQuiz(quizQ.id, sel) as ServerResult;
      setResult(r);
      setRevealed(true);
      if (r?.correct) {
        setCorrect(true);
        setEarned(r.reward || 0);
        addPoints('오늘의 금융 퀴즈 정답', r.reward || 0);
      }
    } catch {
      setRevealed(true);
      if (sel === quizQ.answer) {
        setCorrect(true);
        setEarned(quizQ.reward || 0);
        addPoints('오늘의 금융 퀴즈 정답', quizQ.reward || 0);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const finish = () => {
    setDone(true);
    setQuizDone(true);
  };

  const goHome = () => navigate('/home', { replace: true });

  if (done) {
    return (
      <PhoneFrame tweaks={tweaks}>
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, var(--brand-soft), var(--brand-wash) 55%)', padding: '0 24px' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 8 }}>
            <div style={{ width: 88, height: 88, borderRadius: 999, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 18px 36px -12px var(--brand)', marginBottom: 8 }}>
              <Coin size={46} bg="#fff" ring="var(--brand)" />
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.01em', lineHeight: 1.3 }}>퀴즈 완료!</div>
            <div style={{ fontSize: 15, color: 'var(--sub)', lineHeight: 1.4 }}>1문제 중 <b style={{ color: 'var(--ink)' }}>{correct ? 1 : 0}개</b> 정답</div>
            <div style={{ marginTop: 18, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '18px 28px', width: '100%' }}>
              <div style={{ fontSize: 13, color: 'var(--sub)', fontWeight: 600 }}>획득 포인트</div>
              <div style={{ fontSize: 38, fontWeight: 800, color: 'var(--brand)', marginTop: 4 }}>+{earned}P</div>
            </div>
          </div>
          <div style={{ paddingBottom: 26 }}>
            <PrimaryBtn label="포인트 받고 홈으로" onClick={goHome} />
          </div>
        </div>
      </PhoneFrame>
    );
  }

  return (
    <PhoneFrame tweaks={tweaks}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, var(--brand-soft) 0%, var(--brand-wash) 38%, var(--brand-wash) 100%)' }}>
        <div style={{ padding: '14px 20px 8px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={goHome} style={{ width: 38, height: 38, borderRadius: 11, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--ink)', flexShrink: 0 }}>
            <Close size={22} />
          </button>
          <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'var(--line)', overflow: 'hidden' }}>
            <div style={{ width: revealed ? '100%' : '0%', height: '100%', background: 'var(--brand)', transition: 'width .35s ease' }} />
          </div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sub)' }}>1/1</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 22px 12px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 700, color: 'var(--brand)', background: 'var(--brand-soft)', padding: '5px 11px', borderRadius: 999 }}>
            <QuizIcon size={14} /> 금융 상식 · +{quizQ.reward}P
          </div>
          <h2 style={{ fontSize: 21, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.45, marginTop: 16, letterSpacing: '-0.01em' }}>{quizQ.q}</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 22 }}>
            {quizQ.choices.map((c, idx) => {
              const isAns = idx === answerIdx, isSel = idx === sel;
              let bd = '1.5px solid var(--line)', bg = 'var(--card)', fg = 'var(--ink)';
              if (revealed) {
                if (isAns) { bd = '1.5px solid var(--brand)'; bg = 'var(--brand-soft)'; fg = 'var(--brand-ink)'; }
                else if (isSel) { bd = '1.5px solid #F1546B'; bg = '#FFEef0'; fg = '#D33B53'; }
              } else if (isSel) { bd = '1.5px solid var(--brand)'; bg = 'var(--brand-soft)'; }
              return (
                <button key={idx} disabled={revealed} onClick={() => setSel(idx)} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left', padding: '15px 16px', borderRadius: 15, border: bd, background: bg, color: fg, fontSize: 15.5, fontWeight: 600, fontFamily: 'inherit', cursor: revealed ? 'default' : 'pointer', transition: 'all .15s ease' }}>
                  <span style={{ width: 26, height: 26, borderRadius: 999, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, border: '1.5px solid currentColor', opacity: revealed && !isAns && !isSel ? 0.4 : 1 }}>
                    {revealed && isAns ? <Check size={15} /> : String.fromCharCode(65 + idx)}
                  </span>
                  <span style={{ flex: 1 }}>{c}</span>
                </button>
              );
            })}
          </div>

          {revealed && (
            <div style={{ marginTop: 18, background: isCorrect ? 'var(--brand-soft)' : '#FFF3F4', borderRadius: 15, padding: '15px 16px' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: isCorrect ? 'var(--brand-ink)' : '#D33B53', marginBottom: 5 }}>
                {isCorrect ? '정답이에요! 🎉' : '아쉬워요'}
              </div>
              <div style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.6 }}>{explainText}</div>
            </div>
          )}
        </div>

        <div style={{ padding: '10px 20px 24px', borderTop: '1px solid var(--line)' }}>
          {!revealed
            ? <PrimaryBtn label={submitting ? '채점 중…' : '정답 확인'} onClick={submit} disabled={sel == null || submitting} />
            : <PrimaryBtn label="결과 보기" onClick={finish} />}
        </div>
      </div>
    </PhoneFrame>
  );
}
