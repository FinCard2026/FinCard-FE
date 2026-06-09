import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/ui/PhoneFrame';
import PrimaryBtn from '../components/ui/PrimaryBtn';
import { CategoryIcon, Check, ArrowLeft, Gift } from '../components/icons';
import { extraQuestions } from '../lib/ml';
import { JOBS, AGES, INCOMES, HOUSING, REGIONS, INTERESTS, CATS } from '../data';
import type { Profile, CatKey } from '../types';
import { useApp } from '../context/AppContext';

const iconBtn: React.CSSProperties = {
  width: 38, height: 38, borderRadius: 11, border: 'none', background: 'transparent',
  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
  color: 'var(--ink)', flexShrink: 0,
};

function ProgressDots({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          height: 4, borderRadius: 4, flex: i === step ? 2.2 : 1,
          background: i <= step ? 'var(--brand)' : 'var(--line)', transition: 'all .35s ease',
        }} />
      ))}
    </div>
  );
}

function OptionChip({ label, active, onClick, sub }: { label: string; active: boolean; onClick: () => void; sub?: string }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 2,
      width: '100%', textAlign: 'left', padding: '16px 18px', borderRadius: 16,
      border: active ? '1.5px solid var(--brand)' : '1.5px solid var(--line)',
      background: active ? 'var(--brand-soft)' : 'var(--card)', cursor: 'pointer',
      transition: 'all .18s ease', fontFamily: 'inherit',
    }}>
      <span style={{ fontSize: 16, fontWeight: active ? 700 : 600, color: active ? 'var(--brand-ink)' : 'var(--ink)' }}>{label}</span>
      {sub && <span style={{ fontSize: 13, color: 'var(--sub)' }}>{sub}</span>}
    </button>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { setProfile: setCtxProfile } = useApp();
  const [step, setStep] = useState(-1);
  const [p, setP] = useState<Profile>({
    job: null, age: null, income: null, region: null, housing: null, interests: [], extra: {},
  });

  const baseSteps = [
    { key: 'job', title: '현재 어떤 일을 하고 계신가요?', sub: '맞는 청년 정책을 먼저 찾아드릴게요', type: 'single', opts: JOBS },
    { key: 'age', title: '나이대를 알려주세요', sub: '연령 요건에 맞는 정책만 골라드려요', type: 'single', opts: AGES },
    { key: 'income', title: '연 소득 구간은 어떻게 되시나요?', sub: '소득 기준에 따라 지원 규모가 달라져요', type: 'single', opts: INCOMES },
    { key: 'housing', title: '주거 형태는 어떻게 되시나요?', sub: '주거 지원 정책 적합도에 영향을 줘요', type: 'single', opts: HOUSING },
    { key: 'region', title: '어느 지역에 거주하시나요?', sub: '지자체 청년 정책도 함께 찾아드려요', type: 'region', opts: REGIONS },
    { key: 'interests', title: '관심 있는 분야를 골라주세요', sub: '여러 개 선택할 수 있어요', type: 'multi', opts: INTERESTS },
  ];

  const exQs = extraQuestions(p);
  const hasExtra = exQs.length > 0;
  const total = baseSteps.length + (hasExtra ? 1 : 0);
  const isExtra = step === baseSteps.length;

  if (step === -1) {
    return (
      <PhoneFrame>
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 28px',
          background: 'radial-gradient(120% 60% at 50% 12%, var(--brand-soft) 0%, var(--bg) 52%)',
        }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: 0 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', fontWeight: 800, fontSize: 50, letterSpacing: '-0.035em', marginBottom: 30 }}>
              <span style={{ color: '#16403B' }}>Fin</span>
              <span style={{ background: 'linear-gradient(105deg, #2FD6BE 0%, #10A695 95%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Card</span>
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.4, margin: 0, color: 'var(--ink)', letterSpacing: '-0.02em' }}>
              흩어진 청년 정책,<br />한 곳에 모아드려요
            </h1>
            <p style={{ fontSize: 15, color: 'var(--sub)', lineHeight: 1.65, marginTop: 16, maxWidth: 280 }}>
              몇 가지만 입력하면 나에게 꼭 맞는<br />주거·취업·저축 정책을 카드로 정리해드려요.
            </p>
          </div>
          <div style={{ width: '100%', paddingBottom: 30 }}>
            <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 14 }}>
              <Gift size={19} />
              <span style={{ fontSize: 13.5, color: 'var(--ink)', fontWeight: 600 }}>정보 입력 완료 시 <b style={{ color: 'var(--brand)' }}>100P</b> 즉시 적립</span>
            </div>
            <PrimaryBtn label="3분 만에 시작하기" onClick={() => setStep(0)} />
          </div>
        </div>
      </PhoneFrame>
    );
  }

  const cur = isExtra
    ? { key: 'extra', type: 'extra', title: '몇 가지만 더 여쭤볼게요', sub: '프로필 완성도를 높여 추천 정확도를 올려요', opts: [] }
    : baseSteps[step];

  const val = cur.type === 'extra' ? null : p[cur.key as keyof Profile];
  const filled = cur.type === 'extra' ? true : (cur.type === 'multi' ? (p.interests.length > 0) : !!val);

  const choose = (opt: string | { key: CatKey; label: string }) => {
    if (cur.type === 'multi') {
      const key = (opt as { key: CatKey }).key;
      const has = p.interests.includes(key);
      setP({ ...p, interests: has ? p.interests.filter((k) => k !== key) : [...p.interests, key] });
    } else if (cur.type === 'region') {
      setP({ ...p, region: opt as string });
    } else {
      setP({ ...p, [cur.key]: opt as string });
    }
  };

  const next = () => {
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      setCtxProfile(p);
      navigate('/analyzing', { state: { profile: p } });
    }
  };

  return (
    <PhoneFrame>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <div style={{ padding: '14px 20px 8px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => (step === 0 ? setStep(-1) : setStep(step - 1))} style={iconBtn}>
            <ArrowLeft size={22} />
          </button>
          <div style={{ flex: 1 }}><ProgressDots step={step} total={total} /></div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sub)' }}>{step + 1}/{total}</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 12px' }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: 0, lineHeight: 1.35, letterSpacing: '-0.01em' }}>{cur.title}</h2>
          <p style={{ fontSize: 14, color: 'var(--sub)', marginTop: 8, marginBottom: 22 }}>{cur.sub}</p>

          {cur.type === 'extra' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {exQs.map((q) => {
                const v = p.extra[q.key];
                return (
                  <div key={q.key} style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: '14px 16px' }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 11 }}>{q.label}</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {([['예', true], ['아니요', false]] as [string, boolean][]).map(([lab, bv]) => {
                        const on = v === bv;
                        return (
                          <button key={lab} onClick={() => setP({ ...p, extra: { ...p.extra, [q.key]: bv } })} style={{
                            flex: 1, padding: '11px', borderRadius: 11, fontFamily: 'inherit', fontSize: 14.5, fontWeight: 700, cursor: 'pointer',
                            border: on ? '1.5px solid var(--brand)' : '1.5px solid var(--line)',
                            background: on ? 'var(--brand-soft)' : 'var(--bg)', color: on ? 'var(--brand-ink)' : 'var(--sub)', transition: 'all .15s ease',
                          }}>{lab}</button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : cur.type === 'region' ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 9 }}>
              {cur.opts.map((o) => {
                const active = p.region === o;
                return (
                  <button key={o as string} onClick={() => choose(o as string)} style={{
                    padding: '13px 8px', borderRadius: 13, fontFamily: 'inherit', cursor: 'pointer',
                    fontSize: 14.5, fontWeight: active ? 700 : 600,
                    border: active ? '1.5px solid var(--brand)' : '1.5px solid var(--line)',
                    background: active ? 'var(--brand-soft)' : 'var(--card)',
                    color: active ? 'var(--brand-ink)' : 'var(--ink)', transition: 'all .15s ease',
                  }}>{o as string}</button>
                );
              })}
            </div>
          ) : cur.type === 'multi' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(cur.opts as { key: CatKey; label: string }[]).map((o) => {
                const active = p.interests.includes(o.key);
                const meta = CATS[o.key];
                return (
                  <button key={o.key} onClick={() => choose(o)} style={{
                    display: 'flex', alignItems: 'center', gap: 14, width: '100%', textAlign: 'left',
                    padding: '12px 14px', borderRadius: 16, cursor: 'pointer', fontFamily: 'inherit',
                    border: active ? '1.5px solid var(--brand)' : '1.5px solid var(--line)',
                    background: active ? 'var(--brand-soft)' : 'var(--card)', transition: 'all .15s ease',
                  }}>
                    <CategoryIcon cat={o.key} size={42} />
                    <span style={{ flex: 1, fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{meta.label}</span>
                    <span style={{ width: 22, height: 22, borderRadius: 999, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: active ? 'none' : '1.5px solid var(--line)', background: active ? 'var(--brand)' : 'transparent', color: '#fff' }}>
                      {active && <Check size={15} />}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {(cur.opts as string[]).map((o) => (
                <OptionChip key={o} label={o} active={val === o} onClick={() => choose(o)} />
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '10px 20px 24px', background: 'var(--bg)', borderTop: '1px solid var(--line)' }}>
          <PrimaryBtn label={step === total - 1 ? '완료하고 100P 받기' : '다음'} onClick={next} disabled={!filled} />
        </div>
      </div>
    </PhoneFrame>
  );
}
