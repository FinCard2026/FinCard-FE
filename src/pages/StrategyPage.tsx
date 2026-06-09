import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/ui/PhoneFrame';
import NavBar from '../components/ui/NavBar';
import Toast from '../components/ui/Toast';
import { CategoryIcon, ArrowRight, Chevron, Lock, Coin, Sparkle } from '../components/icons';
import { policyTags, TAG_TONE, categoryScores } from '../lib/ml';
import { CATS } from '../data';
import { useApp } from '../context/AppContext';
import type { Policy } from '../types';

const TABS = [
  { key: 'all', label: '전체' },
  { key: 'housing', label: '주거' },
  { key: 'job', label: '취업' },
  { key: 'saving', label: '저축·적금' },
  { key: 'living', label: '생활비' },
  { key: 'education', label: '교육' },
];

function MatchBadge({ score }: { score: number }) {
  const color = score >= 90 ? 'var(--brand)' : score >= 80 ? '#3B82F6' : '#94A3B8';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11.5, fontWeight: 800, whiteSpace: 'nowrap', color, background: 'var(--brand-soft)', padding: '4px 9px', borderRadius: 999, flexShrink: 0 }}>
      <span style={{ width: 6, height: 6, borderRadius: 999, background: color }} /> 적합 {score}%
    </span>
  );
}

function LockOverlay({ onUnlock, compact }: { onUnlock: () => void; compact?: boolean }) {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: compact ? 6 : 10, background: 'rgba(255,255,255,.35)' }}>
      <div style={{ width: compact ? 34 : 40, height: compact ? 34 : 40, borderRadius: 999, background: 'var(--card)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sub)' }}>
        <Lock size={compact ? 18 : 20} />
      </div>
      <button onClick={onUnlock} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: '#fff', background: 'var(--brand)', padding: '9px 15px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 18px -8px var(--brand)' }}>
        <Coin size={16} /> 30P로 잠금 해제
      </button>
    </div>
  );
}

function SoftCard({ pol, score, locked, onOpen, onUnlock }: { pol: Policy; score: number; locked: boolean; onOpen: (p: Policy) => void; onUnlock: (p: Policy) => void }) {
  const meta = CATS[pol.cat];
  return (
    <div style={{ position: 'relative', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 22, padding: 17, overflow: 'hidden', boxShadow: '0 6px 22px -14px rgba(20,30,45,.22)' }}>
      <div style={{ filter: locked ? 'blur(5px)' : 'none', pointerEvents: locked ? 'none' : 'auto', opacity: locked ? 0.55 : 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 13 }}>
          <CategoryIcon cat={pol.cat} size={52} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: meta.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{meta.label} · {pol.agency}</span>
              <MatchBadge score={score} />
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)', marginTop: 5, letterSpacing: '-0.01em', lineHeight: 1.3 }}>{pol.title}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: meta.soft, borderRadius: 15, padding: '13px 15px', marginTop: 14 }}>
          <span style={{ fontSize: 11.5, fontWeight: 800, color: meta.color, whiteSpace: 'nowrap' }}>예상 혜택</span>
          <span style={{ fontSize: 14.5, fontWeight: 800, color: 'var(--ink)', lineHeight: 1.35 }}>{pol.benefit}</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 11 }}>
          {policyTags(pol).map((tg, i) => {
            const tone = TAG_TONE[tg.type] || TAG_TONE.category;
            return <span key={i} style={{ fontSize: 11.5, fontWeight: 700, color: tone.fg, background: tone.bg, padding: '4px 9px', borderRadius: 8, whiteSpace: 'nowrap' }}>{tg.label}</span>;
          })}
        </div>
        <button onClick={() => onOpen(pol)} style={{ marginTop: 12, width: '100%', padding: '13px', borderRadius: 14, border: 'none', background: meta.soft, color: meta.color, fontWeight: 800, fontSize: 14.5, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <span>상세 리포트 보기</span> <ArrowRight size={16} />
        </button>
      </div>
      {locked && <LockOverlay onUnlock={() => onUnlock(pol)} />}
    </div>
  );
}

function ListCard({ pol, score, locked, onOpen, onUnlock }: { pol: Policy; score: number; locked: boolean; onOpen: (p: Policy) => void; onUnlock: (p: Policy) => void }) {
  const meta = CATS[pol.cat];
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'stretch', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, overflow: 'hidden' }}>
      <div style={{ width: 5, background: meta.color, flexShrink: 0 }} />
      <button onClick={() => !locked && onOpen(pol)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 13, padding: '13px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: locked ? 'default' : 'pointer', fontFamily: 'inherit', filter: locked ? 'blur(4px)' : 'none', opacity: locked ? 0.5 : 1 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: meta.color }}>{meta.label}</span>
            <MatchBadge score={score} />
          </div>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--ink)' }}>{pol.title}</div>
          <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 3 }}>{pol.benefit}</div>
        </div>
        <Chevron size={18} />
      </button>
      {locked && <LockOverlay onUnlock={() => onUnlock(pol)} compact />}
    </div>
  );
}

export default function StrategyPage() {
  const navigate = useNavigate();
  const { sorted, scores, unlocked, tweaks, profile, policies, tryUnlock, toast } = useApp();
  const [cat, setCat] = useState('all');

  const list = cat === 'all' ? sorted : sorted.filter((p) => p.cat === cat);
  const CardComp = tweaks.cardStyle === 'list' ? ListCard : SoftCard;

  const openDetail = (pol: Policy) => navigate(`/policy/${pol.id}`);
  const handleUnlock = (pol: Policy) => tryUnlock(pol);

  return (
    <PhoneFrame tweaks={tweaks}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <div style={{ padding: '18px 20px 6px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>맞춤 전략 카드</h1>
          <p style={{ fontSize: 13.5, color: 'var(--sub)', marginTop: 5 }}>회원님 조건에 맞춰 적합도순으로 정리했어요</p>
        </div>

        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '10px 20px 12px', flexShrink: 0 }}>
          {TABS.map((tb) => {
            const active = cat === tb.key;
            return (
              <button key={tb.key} onClick={() => setCat(tb.key)} style={{ flexShrink: 0, padding: '9px 16px', borderRadius: 999, fontSize: 14, fontWeight: 700, fontFamily: 'inherit', cursor: 'pointer', transition: 'all .15s ease', border: active ? '1.5px solid var(--brand)' : '1.5px solid var(--line)', background: active ? 'var(--brand)' : 'var(--card)', color: active ? '#fff' : 'var(--sub)' }}>{tb.label}</button>
            );
          })}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 20px 96px' }}>
          {cat === 'all' && (() => {
            const ranks = categoryScores(policies, scores).slice(0, 4);
            return (
              <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '15px 16px', marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--ink)', marginBottom: 12 }}>카테고리 적합도</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
                  {ranks.map((r) => {
                    const m = CATS[r.cat];
                    return (
                      <div key={r.cat} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 18, fontSize: 12, fontWeight: 800, color: r.rank === 1 ? m.color : 'var(--sub)' }}>{r.rank}</span>
                        <span style={{ width: 56, fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap' }}>{r.label}</span>
                        <div style={{ flex: 1, height: 8, borderRadius: 5, background: 'var(--bg)', overflow: 'hidden' }}>
                          <div style={{ width: r.score + '%', height: '100%', borderRadius: 5, background: m.color, transition: 'width .5s' }} />
                        </div>
                        <span style={{ width: 30, textAlign: 'right', fontSize: 12.5, fontWeight: 800, color: m.color }}>{r.score}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 12.5, color: 'var(--sub)', marginBottom: 14 }}>
            <Sparkle size={14} fill="var(--brand)" />
            <span><b style={{ color: 'var(--ink)' }}>{list.length}건</b>의 정책 · 무료 3건 + 포인트로 더 보기</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: tweaks.cardStyle === 'list' ? 10 : 14 }}>
            {list.map((p) => {
              const isLocked = !unlocked.has(p.id);
              return (
                <CardComp key={p.id} pol={p} score={scores[p.id] || 73} locked={isLocked} onOpen={openDetail} onUnlock={handleUnlock} />
              );
            })}
          </div>
        </div>

        <NavBar />
        {toast && <Toast msg={toast.msg} good={toast.good} />}
      </div>
    </PhoneFrame>
  );
}
