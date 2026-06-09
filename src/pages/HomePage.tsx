import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/ui/PhoneFrame';
import NavBar from '../components/ui/NavBar';
import Toast from '../components/ui/Toast';
import { CategoryIcon, Coin, Fire, Bell, Chevron, ArrowRight, Sparkle, QuizIcon, Check, Shield } from '../components/icons';
import { inferCluster, profileCompleteness, categoryScores } from '../lib/ml';
import { CATS, CARDNEWS, POLICIES } from '../data';
import { useApp } from '../context/AppContext';
import type { Policy } from '../types';

function fmtAmt(v: number) {
  return v >= 10000 ? (v / 10000).toFixed(1).replace(/\.0$/, '') + '억' : v.toLocaleString() + '만원';
}

function MiniPolicy({ pol, onClick }: { pol: Policy; onClick: () => void }) {
  const meta = CATS[pol.cat];
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 13, width: '100%',
      textAlign: 'left', background: 'var(--card)', border: '1px solid var(--line)',
      borderRadius: 16, padding: 13, cursor: 'pointer', fontFamily: 'inherit',
    }}>
      <CategoryIcon cat={pol.cat} size={46} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: meta.color }}>{meta.label}</span>
          {pol.hot && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, fontWeight: 700, color: '#FB7A3C' }}><Fire size={12} />인기</span>}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pol.title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pol.tag}</div>
      </div>
      <Chevron size={18} />
    </button>
  );
}

function SectionHead({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h3 style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>
      {action && <button onClick={onAction} style={{ fontSize: 13, fontWeight: 600, color: 'var(--sub)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 2 }}>{action} <Chevron size={14} /></button>}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { profile, points, sorted, scores, policies, tweaks, quizDone, setQuizDone, addPoints, toast, showToast } = useApp();
  const [quizLoading, setQuizLoading] = useState(false);

  const sumAmt = policies.reduce((a, p) => a + (p.amount || 0), 0);
  const top3 = sorted.slice(0, 3);
  const cl = inferCluster(profile);
  const cmp = profileCompleteness(profile);
  const comp = cmp.score;
  const layout = tweaks.homeLayout;
  const quizWhite = tweaks.quizBg === 'white';

  const openDetail = (pol: Policy) => navigate(`/policy/${pol.id}`);

  const openQuiz = async () => {
    setQuizLoading(true);
    navigate('/quiz');
    setQuizLoading(false);
  };

  const statTile: React.CSSProperties = {
    textAlign: 'left', background: 'var(--card)', border: '1px solid var(--line)',
    borderRadius: 18, padding: '16px 16px 18px', cursor: 'pointer',
    fontFamily: 'inherit', color: 'var(--brand)', display: 'block',
  };

  return (
    <PhoneFrame tweaks={tweaks}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px 10px' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--sub)', fontWeight: 600 }}>{profile.region ? profile.region + ' · ' : ''}{profile.job || '청년'}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.01em' }}>회원님, 안녕하세요 👋</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={() => navigate('/mypage')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 999, padding: '6px 12px 6px 8px', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Coin size={20} />
              <b style={{ fontSize: 15, color: 'var(--ink)', fontWeight: 800 }}>{points.toLocaleString()}</b>
              <span style={{ fontSize: 13, color: 'var(--sub)', fontWeight: 600 }}>P</span>
            </button>
            <button style={{ width: 38, height: 38, borderRadius: 11, border: '1px solid var(--line)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--sub)', flexShrink: 0 }}>
              <Bell size={20} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '6px 20px 96px' }}>
          {/* cluster card */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20, padding: '16px 18px', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: cl.color + '1A', fontSize: 24 }}>{cl.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--sub)' }}>AI가 분석한 내 금융 유형</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <span style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{cl.name}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: cl.color, background: cl.color + '16', padding: '2px 7px', borderRadius: 999 }}>유사도 {Math.round(cl.similarity * 100)}%</span>
                </div>
              </div>
            </div>
            <div style={{ fontSize: 12.5, color: 'var(--sub)', lineHeight: 1.5, marginTop: 9 }}>{cl.desc}</div>
            <div style={{ marginTop: 13, paddingTop: 13, borderTop: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>추천 정확도 {comp}%</span>
                <span style={{ fontSize: 11.5, fontWeight: 700, whiteSpace: 'nowrap', color: comp >= 80 ? '#1F8F4E' : comp >= 60 ? 'var(--brand)' : '#E0892A' }}>
                  {comp >= 80 ? '추천 정확도 높음' : comp >= 60 ? '추천 가능' : '추가 정보 입력 필요'}
                </span>
              </div>
              <div style={{ height: 7, borderRadius: 5, background: 'var(--line)', overflow: 'hidden' }}>
                <div style={{ width: comp + '%', height: '100%', transition: 'width .5s', background: comp >= 60 ? 'linear-gradient(90deg, var(--brand-2), var(--brand))' : 'linear-gradient(90deg, #FFC368, #F0992A)' }} />
              </div>
              {comp < 60 && cmp.missing.length > 0 && (
                <button onClick={() => navigate('/mypage')} style={{ marginTop: 11, width: '100%', textAlign: 'left', background: '#FFF7EC', border: '1px solid #FAE2BD', borderRadius: 12, padding: '10px 12px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <div style={{ fontSize: 12, color: '#A86A12', fontWeight: 700, lineHeight: 1.5 }}>{cmp.missing.slice(0, 2).join(', ')} 입력 시 추천 정확도가 올라요</div>
                  <div style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 800, marginTop: 4 }}>추가 정보 입력하기 ›</div>
                </button>
              )}
            </div>
          </div>

          {/* policy count card */}
          {layout === 'stack' ? (
            <div style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)', borderRadius: 22, padding: '20px 22px', color: '#fff', boxShadow: '0 18px 34px -18px var(--brand)', marginBottom: 14 }}>
              <div style={{ fontSize: 13.5, opacity: 0.9, fontWeight: 600 }}>회원님이 지원받을 수 있는 정책</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
                  <span style={{ fontSize: 46, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1 }}>{policies.length}</span>
                  <span style={{ fontSize: 19, fontWeight: 700 }}>건</span>
                </div>
                <span style={{ fontSize: 12, opacity: 0.85, fontWeight: 600, marginBottom: 3 }}>맞춤 분석 완료</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,.22)' }}>
                <span style={{ fontSize: 13.5, opacity: 0.9, fontWeight: 600 }}>예상 받을 혜택</span>
                <span style={{ fontSize: 21, fontWeight: 800 }}>최대 {fmtAmt(sumAmt)}</span>
              </div>
              <button onClick={() => navigate('/strategy')} style={{ marginTop: 16, width: '100%', padding: '13px', borderRadius: 13, border: 'none', background: 'rgba(255,255,255,.95)', color: 'var(--brand-ink)', fontWeight: 800, fontSize: 15, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span>내 맞춤 전략 카드 보기</span> <ArrowRight size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <button onClick={() => navigate('/strategy')} style={statTile}>
                <Shield size={22} />
                <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--ink)', marginTop: 10, lineHeight: 1 }}>{policies.length}<span style={{ fontSize: 15, fontWeight: 700 }}> 건</span></div>
                <div style={{ fontSize: 12.5, color: 'var(--sub)', marginTop: 5, fontWeight: 600 }}>지원 가능한 정책</div>
              </button>
              <button onClick={() => navigate('/strategy')} style={{ ...statTile, background: 'var(--brand)', color: '#fff', border: 'none' }}>
                <Sparkle size={22} fill="#fff" />
                <div style={{ fontSize: 26, fontWeight: 800, marginTop: 10, lineHeight: 1 }}>최대 {fmtAmt(sumAmt)}</div>
                <div style={{ fontSize: 12.5, opacity: 0.9, marginTop: 5, fontWeight: 600 }}>예상 받을 혜택</div>
              </button>
            </div>
          )}

          {/* quiz card */}
          <div style={{ marginTop: 22, marginBottom: 18 }}>
            <button onClick={quizDone ? undefined : openQuiz} style={{
              display: 'flex', alignItems: 'center', gap: 15, width: '100%', textAlign: 'left',
              background: quizDone ? 'var(--card)' : (quizWhite ? 'var(--card)' : '#FFFBEA'),
              border: quizDone ? '1px solid var(--line)' : (quizWhite ? '1px solid var(--line)' : 'none'),
              borderRadius: 20, padding: '20px 18px', cursor: quizDone ? 'default' : 'pointer', fontFamily: 'inherit',
            }}>
              <div style={{ width: 54, height: 54, borderRadius: 16, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: quizDone ? '#FFF6D6' : 'linear-gradient(150deg, #FFD95C, #FBC52E)', color: quizDone ? '#D99908' : '#fff', boxShadow: quizDone ? 'none' : '0 8px 16px -7px #F3C13E' }}>
                {quizDone ? <Check size={28} /> : <QuizIcon size={28} />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--ink)' }}>오늘의 금융 퀴즈</div>
                <div style={{ fontSize: 13.5, color: 'var(--sub)', marginTop: 3 }}>
                  {quizDone ? '내일 새 문제로 다시 만나요 👋' : <><b style={{ color: '#CE9606' }}>+20P</b> · 하루 한 문제</>}
                </div>
              </div>
              {!quizDone && <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1E22', background: '#fff', padding: '11px 18px', borderRadius: 13, boxShadow: '0 4px 10px -4px rgba(20,30,40,.25)' }}>풀기</span>}
            </button>
          </div>

          {/* top match banner */}
          {(() => {
            const top = sorted[0];
            if (!top) return null;
            const m = CATS[top.cat];
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: m.soft, border: '1px solid ' + m.color + '22', borderRadius: 14, padding: '11px 14px', marginBottom: 12 }}>
                <Sparkle size={16} fill={m.color} />
                <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600, lineHeight: 1.4 }}>지금 입력 기준 <b style={{ color: m.color }}>{m.label}</b> 분야가 가장 잘 맞아요</span>
              </div>
            );
          })()}

          <SectionHead title="회원님께 추천하는 정책" action="전체보기" onAction={() => navigate('/strategy')} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 22 }}>
            {top3.map((p) => <MiniPolicy key={p.id} pol={p} onClick={() => openDetail(p)} />)}
          </div>

          <SectionHead title="카드뉴스" />
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4, margin: '0 -20px', padding: '0 20px 4px', alignItems: 'stretch' }}>
            {CARDNEWS.map((c) => {
              const meta = CATS[c.cat];
              const pol = POLICIES.find((p) => p.cat === c.cat);
              return (
                <button key={c.id} onClick={() => pol && openDetail(pol)} style={{ flexShrink: 0, width: 190, textAlign: 'left', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', fontFamily: 'inherit', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: '100%', height: 100, flexShrink: 0, background: `linear-gradient(160deg, ${meta.soft} 0%, ${meta.soft} 60%, #fff 160%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CategoryIcon cat={c.cat} size={50} />
                  </div>
                  <div style={{ flex: 1, padding: '12px 13px 14px', display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: meta.color }}>{c.tag}</span>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginTop: 4, lineHeight: 1.35 }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 'auto', paddingTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Coin size={14} /> +{c.reward}P · {c.read}
                    </div>
                  </div>
                </button>
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
