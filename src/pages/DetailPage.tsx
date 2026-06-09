import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PhoneFrame from '../components/ui/PhoneFrame';
import { ArrowLeft, Check, Pin, Doc, External, Coin } from '../components/icons';
import { reasonSentences, policyTags, TAG_TONE } from '../lib/ml';
import { CATS } from '../data';
import { useApp } from '../context/AppContext';
import type { CatKey } from '../types';

function ScoreRing({ score, color }: { score: number; color: string }) {
  const r = 30, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  return (
    <svg width="76" height="76" viewBox="0 0 76 76">
      <circle cx="38" cy="38" r={r} fill="none" stroke="var(--line)" strokeWidth="7" />
      <circle cx="38" cy="38" r={r} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 38 38)" style={{ transition: 'stroke-dashoffset .8s ease' }} />
      <text x="38" y="36" textAnchor="middle" fontSize="20" fontWeight="800" fill="var(--ink)">{score}</text>
      <text x="38" y="50" textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--sub)">적합도</text>
    </svg>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 18, padding: 18, marginBottom: 4 }}>{children}</div>;
}

function SecTitle({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)', margin: '22px 0 11px', letterSpacing: '-0.01em' }}>{children}</h3>;
}

function CatGlyphSvg({ cat }: { cat: CatKey }) {
  const glyphs: Record<string, React.ReactNode> = {
    housing: <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11l8-6 8 6" /><path d="M6 10v9h12v-9" /><path d="M10 19v-5h4v5" /></g>,
    job: <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="13" rx="2.2" /><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" /><path d="M3 12h18" /></g>,
    saving: <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12a7 6 0 0 1 14 0v4.5h2.2" /><circle cx="15.5" cy="11.5" r="0.9" fill="#fff" stroke="none" /><path d="M8 17v2M14 17v2" /></g>,
    living: <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5Z" /><path d="M4 9h12.5" /></g>,
    education: <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5 3 9l9 4 9-4-9-4Z" /><path d="M7 11v4c0 1 2.2 2.2 5 2.2s5-1.2 5-2.2v-4" /></g>,
  };
  return <>{glyphs[cat] || glyphs.housing}</>;
}

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, scores, policies, tweaks, checklists, genChecklist, visitSite, tryUnlock, unlocked } = useApp();
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  const pol = policies.find((p) => p.id === id);
  if (!pol) return <PhoneFrame tweaks={tweaks}><div style={{ padding: 40, textAlign: 'center', color: 'var(--sub)' }}>정책을 찾을 수 없어요</div></PhoneFrame>;

  if (!unlocked.has(pol.id)) {
    tryUnlock(pol);
    navigate(-1);
    return null;
  }

  const meta = CATS[pol.cat];
  const score = scores[pol.id] || 73;
  const hasChecklist = checklists.has(pol.id);
  const doneCount = Object.values(checked).filter(Boolean).length;
  const reasons = reasonSentences(pol, profile);
  const tags = policyTags(pol, profile);

  return (
    <PhoneFrame tweaks={tweaks}>
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 96 }}>
          {/* hero */}
          <div style={{ background: `linear-gradient(160deg, ${meta.color} 0%, ${meta.color}cc 100%)`, padding: '14px 20px 26px', color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={() => navigate(-1)} style={{ width: 38, height: 38, borderRadius: 11, border: 'none', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 }}>
                <ArrowLeft size={22} />
              </button>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 800, color: '#fff', background: 'rgba(255,255,255,.22)', padding: '6px 12px', borderRadius: 999 }}>★ 적합도 {score}%</span>
            </div>
            <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 13 }}>
              <div style={{ width: 52, height: 52, borderRadius: 15, background: 'rgba(255,255,255,.22)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="30" height="30" viewBox="0 0 24 24"><CatGlyphSvg cat={pol.cat} /></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, opacity: 0.9 }}>{meta.label} · {pol.agency}</div>
                <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-0.01em', marginTop: 3, lineHeight: 1.25 }}>{pol.title}</div>
              </div>
            </div>
            <div style={{ background: 'rgba(255,255,255,.16)', borderRadius: 14, padding: '12px 15px', marginTop: 16 }}>
              <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 600 }}>핵심 혜택</div>
              <div style={{ fontSize: 16.5, fontWeight: 800, marginTop: 3 }}>{pol.benefit}</div>
            </div>
          </div>

          <div style={{ padding: '18px 20px 0' }}>
            {/* report */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <ScoreRing score={score} color={meta.color} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>회원님께 잘 맞는 정책이에요</div>
                  <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 4, lineHeight: 1.5 }}>입력하신 {profile.job}·{profile.age} 조건을 분석한 결과예요.</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginTop: 14 }}>
                {reasons.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 9, fontSize: 13.5, color: 'var(--ink)', fontWeight: 600, lineHeight: 1.45 }}>
                    <span style={{ width: 20, height: 20, borderRadius: 999, background: 'var(--brand-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}><Check size={13} /></span>
                    <span style={{ flex: 1 }}>{r.text}</span>
                  </div>
                ))}
              </div>
            </Card>

            <SecTitle>한눈에 요약</SecTitle>
            <Card>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--ink)', lineHeight: 1.65 }}>{pol.summary}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
                {tags.map((tg, i) => {
                  const tone = TAG_TONE[tg.type] || TAG_TONE.category;
                  return <span key={i} style={{ fontSize: 11.5, fontWeight: 700, color: tone.fg, background: tone.bg, padding: '5px 10px', borderRadius: 8, whiteSpace: 'nowrap' }}>{tg.label}</span>;
                })}
              </div>
              <div style={{ borderTop: '1px solid var(--line)', marginTop: 14, paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 11 }}>
                {pol.eligible.map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13.5, color: 'var(--ink)' }}>
                    <span style={{ color: meta.color, flexShrink: 0, marginTop: 1, display: 'inline-flex' }}><Check size={17} /></span>
                    <span style={{ flex: 1 }}>{e}</span>
                  </div>
                ))}
              </div>
            </Card>

            <SecTitle>신청 방법</SecTitle>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ color: meta.color, flexShrink: 0, display: 'inline-flex' }}><Pin size={20} /></span>
                <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>{pol.howto}</span>
              </div>
            </Card>

            <SecTitle>필요 서류 체크리스트</SecTitle>
            {!hasChecklist ? (
              <div style={{ background: 'var(--card)', border: '1.5px dashed var(--line)', borderRadius: 18, padding: '22px 18px', textAlign: 'center' }}>
                <Doc size={28} />
                <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)', marginTop: 10 }}>내 조건에 맞는 서류 목록 만들기</div>
                <div style={{ fontSize: 13, color: 'var(--sub)', marginTop: 5, lineHeight: 1.5 }}>준비할 서류를 개인 맞춤으로 정리해드려요.<br />체크리스트로 빠짐없이 챙기세요.</div>
                <button onClick={() => genChecklist(pol)} style={{ marginTop: 16, display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--brand)', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 20px', fontWeight: 700, fontSize: 14.5, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 10px 20px -10px var(--brand)' }}>
                  <Coin size={17} /> 50P로 체크리스트 생성
                </button>
              </div>
            ) : (
              <Card>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--sub)' }}>{doneCount}/{pol.docs.length} 준비 완료</span>
                  <div style={{ flex: 1, height: 5, borderRadius: 4, background: 'var(--line)', marginLeft: 12, overflow: 'hidden' }}>
                    <div style={{ width: `${(doneCount / pol.docs.length) * 100}%`, height: '100%', background: meta.color, transition: 'width .3s' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {pol.docs.map((d, i) => {
                    const on = checked[i];
                    return (
                      <button key={i} onClick={() => setChecked({ ...checked, [i]: !on })} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 6px', background: 'none', border: 'none', borderBottom: i < pol.docs.length - 1 ? '1px solid var(--line)' : 'none', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', width: '100%' }}>
                        <span style={{ width: 22, height: 22, borderRadius: 7, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: on ? 'none' : '1.5px solid var(--line)', background: on ? meta.color : 'transparent', color: '#fff' }}>
                          {on && <Check size={14} />}
                        </span>
                        <span style={{ fontSize: 14.5, color: on ? 'var(--sub)' : 'var(--ink)', fontWeight: 600, textDecoration: on ? 'line-through' : 'none' }}>{d}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* sticky CTA */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px 22px', background: 'var(--bg)', borderTop: '1px solid var(--line)' }}>
          <button onClick={() => visitSite(pol)} style={{ width: '100%', padding: '15px', borderRadius: 14, border: 'none', background: 'var(--brand)', color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: 'inherit', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 12px 24px -12px var(--brand)' }}>
            <span>신청 홈페이지 바로가기</span> <External size={18} />
            <span style={{ fontSize: 12.5, background: 'rgba(255,255,255,.25)', padding: '3px 8px', borderRadius: 999 }}>+30P</span>
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
