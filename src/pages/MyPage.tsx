import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/ui/PhoneFrame';
import NavBar from '../components/ui/NavBar';
import Toast from '../components/ui/Toast';
import { Coin, Plus, Minus, Chevron, UserTab, Bell, Shield, Gear, CategoryIcon, Fire } from '../components/icons';
import { inferCluster, profileCompleteness } from '../lib/ml';
import { CATS } from '../data';
import { useApp } from '../context/AppContext';
import { Api } from '../lib/api';
import type { Policy } from '../types';

function SectionHead({ title }: { title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <h3 style={{ fontSize: 16.5, fontWeight: 800, color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>{title}</h3>
    </div>
  );
}

function MiniPolicy({ pol, onClick }: { pol: Policy; onClick: () => void }) {
  const meta = CATS[pol.cat];
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', textAlign: 'left', background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 16, padding: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
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

const moreBtn: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, width: '100%', padding: '13px 0',
  background: 'none', border: 'none', borderTop: '1px solid var(--line)', cursor: 'pointer', fontFamily: 'inherit',
  fontSize: 13.5, fontWeight: 700, color: 'var(--sub)',
};

export default function MyPage() {
  const navigate = useNavigate();
  const { profile, points, history, sorted, unlocked, tweaks, setProfile, setPoints, setHistory, setUnlocked, setChecklists, setVisited, setQuizDone, toast } = useApp();
  const [showAllHist, setShowAllHist] = useState(false);
  const [showAllPol, setShowAllPol] = useState(false);

  const cl = inferCluster(profile);
  const comp = profileCompleteness(profile).score;
  const earnSum = history.filter((h) => h.delta > 0).reduce((a, h) => a + h.delta, 0);
  const useSum = history.filter((h) => h.delta < 0).reduce((a, h) => a + h.delta, 0);
  const visHistory = showAllHist ? history : history.slice(0, 3);
  const unlockedPolicies = sorted.filter((p) => unlocked.has(p.id));
  const visPolicies = showAllPol ? unlockedPolicies : unlockedPolicies.slice(0, 3);

  const openDetail = (pol: Policy) => navigate(`/policy/${pol.id}`);

  const handleReset = async () => {
    try { await Api.logout(); } catch { /* ignore */ }
    setProfile({ job: null, age: null, income: null, region: null, housing: null, interests: [], extra: {} });
    setPoints(() => 0);
    setHistory(() => []);
    setUnlocked(() => new Set());
    setChecklists(() => new Set());
    setVisited(() => new Set());
    setQuizDone(false);
    navigate('/login', { replace: true });
  };

  return (
    <PhoneFrame tweaks={tweaks}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <div style={{ padding: '18px 20px 6px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', margin: 0, letterSpacing: '-0.01em' }}>마이페이지</h1>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 96px' }}>
          {/* profile card */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 20, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
              <div style={{ width: 56, height: 56, borderRadius: 18, flexShrink: 0, background: cl.color + '1A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>{cl.emoji}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--ink)' }}>회원님</div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: cl.color, marginTop: 2 }}>{cl.name} · 유사도 {Math.round(cl.similarity * 100)}%</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
              {[profile.job, profile.age, profile.region].filter(Boolean).map((tg) => (
                <span key={tg} style={{ fontSize: 12, fontWeight: 600, color: 'var(--sub)', background: 'var(--bg)', border: '1px solid var(--line)', padding: '4px 9px', borderRadius: 999, whiteSpace: 'nowrap' }}>{tg}</span>
              ))}
            </div>
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)' }}>프로필 완성도 {comp}%</span>
                {comp < 100 && <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--brand)', whiteSpace: 'nowrap' }}>추가 정보 입력 시 추천 정확도 ↑</span>}
              </div>
              <div style={{ height: 7, borderRadius: 5, background: 'var(--line)', overflow: 'hidden' }}>
                <div style={{ width: comp + '%', height: '100%', background: 'linear-gradient(90deg, var(--brand-2), var(--brand))', transition: 'width .5s' }} />
              </div>
            </div>
          </div>

          {/* points card */}
          <div style={{ background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-2) 100%)', borderRadius: 20, padding: '18px 20px', color: '#fff', marginTop: 14, boxShadow: '0 16px 30px -16px var(--brand)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13.5, opacity: 0.9, fontWeight: 600 }}>보유 포인트</span>
              <Coin size={24} bg="#fff" ring="var(--brand)" />
            </div>
            <div style={{ fontSize: 36, fontWeight: 800, marginTop: 4 }}>{points.toLocaleString()}<span style={{ fontSize: 18, fontWeight: 700 }}> P</span></div>
            <div style={{ display: 'flex', gap: 18, marginTop: 12, fontSize: 12.5 }}>
              <span style={{ opacity: 0.9 }}>총 적립 <b>+{earnSum.toLocaleString()}</b></span>
              <span style={{ opacity: 0.9 }}>총 사용 <b>{useSum.toLocaleString()}</b></span>
            </div>
          </div>

          {/* history */}
          <div style={{ marginTop: 24 }}><SectionHead title="포인트 내역" /></div>
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: '4px 16px', marginBottom: 22 }}>
            {history.length === 0 && <div style={{ padding: '18px 0', fontSize: 13.5, color: 'var(--sub)', textAlign: 'center' }}>아직 내역이 없어요</div>}
            {visHistory.map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 0', borderBottom: i < visHistory.length - 1 ? '1px solid var(--line)' : 'none' }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: h.delta > 0 ? 'var(--brand-soft)' : '#FFF0F0', color: h.delta > 0 ? 'var(--brand)' : '#E2526A' }}>
                  {h.delta > 0 ? <Plus size={18} /> : <Minus size={18} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{h.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--sub)', marginTop: 1 }}>{h.time}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: h.delta > 0 ? 'var(--brand)' : '#E2526A', whiteSpace: 'nowrap' }}>{h.delta > 0 ? '+' : ''}{h.delta}P</div>
              </div>
            ))}
            {history.length > 3 && (
              <button onClick={() => setShowAllHist(!showAllHist)} style={moreBtn}>
                {showAllHist ? '접기' : `${history.length - 3}건 더보기`}
                <span style={{ display: 'inline-flex', transform: showAllHist ? 'rotate(-90deg)' : 'rotate(90deg)' }}><Chevron size={15} /></span>
              </button>
            )}
          </div>

          {/* unlocked policies */}
          {unlockedPolicies.length > 0 && (
            <>
              <SectionHead title="잠금 해제한 정책" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 12 }}>
                {visPolicies.map((p) => <MiniPolicy key={p.id} pol={p} onClick={() => openDetail(p)} />)}
              </div>
              {unlockedPolicies.length > 3 && (
                <button onClick={() => setShowAllPol(!showAllPol)} style={{ ...moreBtn, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 14, marginBottom: 22 }}>
                  {showAllPol ? '접기' : `${unlockedPolicies.length - 3}개 더보기`}
                  <span style={{ display: 'inline-flex', transform: showAllPol ? 'rotate(-90deg)' : 'rotate(90deg)' }}><Chevron size={15} /></span>
                </button>
              )}
            </>
          )}

          {/* settings */}
          <SectionHead title="설정" />
          <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, overflow: 'hidden' }}>
            {[
              { ic: <UserTab size={20} />, label: '개인정보 관리' },
              { ic: <Bell size={20} />, label: '알림 설정' },
              { ic: <Shield size={20} />, label: '이용약관 · 개인정보 처리방침' },
              { ic: <Gear size={20} />, label: '환경설정' },
            ].map((s, i, arr) => (
              <button key={i} style={{ display: 'flex', alignItems: 'center', gap: 13, width: '100%', padding: '15px 16px', background: 'none', border: 'none', borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', color: 'var(--sub)' }}>
                {s.ic}
                <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{s.label}</span>
                <Chevron size={18} />
              </button>
            ))}
          </div>

          <button onClick={handleReset} style={{ width: '100%', marginTop: 14, padding: '14px', borderRadius: 14, border: '1px solid var(--line)', background: 'var(--card)', color: 'var(--sub)', fontWeight: 600, fontSize: 14, fontFamily: 'inherit', cursor: 'pointer' }}>
            로그아웃
          </button>
        </div>

        <NavBar />
        {toast && <Toast msg={toast.msg} good={toast.good} />}
      </div>
    </PhoneFrame>
  );
}
