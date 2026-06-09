import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PhoneFrame from '../components/ui/PhoneFrame';
import PrimaryBtn from '../components/ui/PrimaryBtn';
import { Api } from '../lib/api';

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocus, setEmailFocus] = useState(false);
  const [pwFocus, setPwFocus] = useState(false);

  const fieldStyle = (focus: boolean, err?: boolean): React.CSSProperties => ({
    width: '100%', background: 'var(--card)',
    border: `1.5px solid ${err ? '#F1546B' : focus ? 'var(--brand)' : 'var(--line)'}`,
    borderRadius: 14, padding: '14px 16px', fontSize: 16,
    fontFamily: 'inherit', outline: 'none', color: 'var(--ink)',
    transition: 'border-color .15s', boxSizing: 'border-box',
  });

  const handleLogin = async () => {
    if (!email || !password) { setError('이메일과 비밀번호를 입력해주세요'); return; }
    setLoading(true); setError('');
    try {
      await Api.login({ email, password });
      const me = await Api.getMe();
      const profile = me as Record<string, unknown> | null;
      if (profile && (profile.job || profile.age)) {
        navigate('/home', { replace: true });
      } else {
        navigate('/onboarding', { replace: true });
      }
    } catch {
      setError('로그인에 실패했어요. 이메일과 비밀번호를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PhoneFrame>
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'radial-gradient(120% 60% at 50% 12%, var(--brand-soft) 0%, var(--bg) 52%)',
      }}>
        {/* 중앙 영역: 로고 + 필드 */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '0 28px', gap: 32,
        }}>
          {/* 로고 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'baseline', fontWeight: 800, fontSize: 40, letterSpacing: '-0.035em' }}>
              <span style={{ color: '#16403B' }}>Fin</span>
              <span style={{ background: 'linear-gradient(105deg, #2FD6BE 0%, #10A695 95%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Card</span>
            </div>
            <p style={{ fontSize: 15, color: 'var(--sub)', marginTop: 10 }}>청년 맞춤 금융정책 서비스</p>
          </div>

          {/* 필드 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocus(true)}
              onBlur={() => setEmailFocus(false)}
              style={fieldStyle(emailFocus)}
            />
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPwFocus(true)}
                onBlur={() => setPwFocus(false)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                style={{ ...fieldStyle(pwFocus), paddingRight: 48 }}
              />
              <button
                onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)', display: 'flex', padding: 0 }}
              >
                <EyeIcon open={showPw} />
              </button>
            </div>
            {error && <p style={{ fontSize: 13, color: '#F1546B', margin: 0 }}>{error}</p>}
          </div>
        </div>

        {/* 하단 고정: 버튼 */}
        <div style={{ padding: '0 28px 36px', flexShrink: 0 }}>
          <PrimaryBtn
            label={loading ? '로그인 중…' : '로그인'}
            onClick={handleLogin}
            disabled={loading}
          />
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--sub)', marginTop: 18 }}>
            아직 계정이 없으신가요?{' '}
            <Link to="/signup" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
