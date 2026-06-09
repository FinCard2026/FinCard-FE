import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PhoneFrame from '../components/ui/PhoneFrame';
import { Check } from '../components/icons';
import { Api } from '../lib/api';
import { useApp } from '../context/AppContext';
import type { Profile } from '../types';

const stages = ['사용자 유형 분석 중', '카테고리 적합도 계산 중', '추천 정책 정리 중'];

export default function AnalyzingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setProfile, setPolicies, setPoints, setHistory, setUnlocked } = useApp();
  const [stageIdx, setStageIdx] = useState(0);

  const profile: Profile = (location.state as { profile: Profile })?.profile || {
    job: null, age: null, income: null, region: null, housing: null, interests: [], extra: {},
  };

  useEffect(() => {
    const t = setInterval(() => setStageIdx((x) => Math.min(x + 1, stages.length - 1)), 650);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const started = Date.now();

    async function run() {
      let coin = 100;
      try {
        const res = await Api.createMe(profile);
        if (res && typeof (res as { coin?: number }).coin === 'number') coin = (res as { coin: number }).coin;
      } catch { /* mock fallback */ }

      let list;
      try {
        const r = await Api.getRecommendations('all', profile);
        if (Array.isArray(r) && r.length) list = r;
      } catch { /* keep local */ }

      if (list) setPolicies(list);
      setProfile(profile);
      setPoints(coin);
      setHistory([{ label: '온보딩 정보 입력 완료', delta: 100, time: '방금 전' }]);

      if (list) {
        const sc: Record<string, number> = {};
        list.forEach((p) => { sc[p.id] = p.score != null ? p.score : 73; });
        const top3 = [...list].sort((a, b) => (sc[b.id] || 0) - (sc[a.id] || 0)).slice(0, 3).map((x) => x.id);
        setUnlocked(new Set(top3));
      }

      const elapsed = Date.now() - started;
      const wait = Math.max(0, 2100 - elapsed);
      setTimeout(() => navigate('/home', { replace: true }), wait);
    }

    run();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <PhoneFrame>
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', padding: '0 30px',
        background: 'radial-gradient(120% 55% at 50% 18%, var(--brand-soft) 0%, var(--bg) 55%)',
      }}>
        <div style={{
          width: 58, height: 58, borderRadius: 999,
          border: '4px solid var(--brand-soft)', borderTopColor: 'var(--brand)',
          animation: 'finspin .8s linear infinite', marginBottom: 22,
        }} />
        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', textAlign: 'center', lineHeight: 1.45, letterSpacing: '-0.01em' }}>
          내 상황에 맞는<br />금융·지원 정책을 분석하고 있어요
        </div>
        <div style={{ width: '100%', maxWidth: 280, marginTop: 26, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {stages.map((s, idx) => {
            const passed = idx < stageIdx, active = idx === stageIdx;
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 11, opacity: idx <= stageIdx ? 1 : 0.4, transition: 'opacity .3s' }}>
                <span style={{
                  width: 22, height: 22, borderRadius: 999, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: passed ? 'var(--brand)' : (active ? 'var(--brand-soft)' : 'var(--line)'),
                  color: passed ? '#fff' : 'var(--brand)',
                }}>
                  {passed ? <Check size={13} /> : active ? (
                    <span style={{ width: 9, height: 9, borderRadius: 999, border: '2px solid var(--brand)', borderTopColor: 'transparent', animation: 'finspin .7s linear infinite' }} />
                  ) : null}
                </span>
                <span style={{ fontSize: 14, fontWeight: passed || active ? 700 : 600, color: passed || active ? 'var(--ink)' : 'var(--sub)', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
            );
          })}
        </div>
      </div>
    </PhoneFrame>
  );
}
