import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PhoneFrame from '../components/ui/PhoneFrame';
import PrimaryBtn from '../components/ui/PrimaryBtn';
import { Api } from '../lib/api';
import { useApp } from '../context/AppContext';

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

function Field({
  label, type = 'text', value, onChange, onFocus, onBlur, focus, error, right,
}: {
  label: string; type?: string; value: string;
  onChange: (v: string) => void;
  onFocus: () => void; onBlur: () => void;
  focus: boolean; error?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        placeholder={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        style={{
          width: '100%', background: 'var(--card)',
          border: `1.5px solid ${error ? '#F1546B' : focus ? 'var(--brand)' : 'var(--line)'}`,
          borderRadius: 14, padding: right ? '14px 48px 14px 16px' : '14px 16px',
          fontSize: 16, fontFamily: 'inherit', outline: 'none',
          color: 'var(--ink)', transition: 'border-color .15s', boxSizing: 'border-box',
        }}
      />
      {right && (
        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
          {right}
        </div>
      )}
    </div>
  );
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { setNickname: saveNickname } = useApp();

  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [f1, setF1] = useState(false);
  const [f2, setF2] = useState(false);
  const [f3, setF3] = useState(false);
  const [f4, setF4] = useState(false);
  const [f5, setF5] = useState(false);

  const mismatch = confirm.length > 0 && password !== confirm;

  const handleSignup = async () => {
    if (!username || !nickname || !email || !password) {
      setError('모든 항목을 입력해주세요');
      return;
    }
    if (password !== confirm) { setError('비밀번호가 일치하지 않아요'); return; }
    setLoading(true); setError('');
    try {
      await Api.signup({ email, password });
      saveNickname(nickname);
      navigate('/onboarding', { replace: true });
    } catch {
      setError('회원가입에 실패했어요. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sub)', display: 'flex', padding: 0 }}>
      <EyeIcon open={show} />
    </button>
  );

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
          justifyContent: 'center', padding: '0 28px', gap: 28,
          overflowY: 'auto',
        }}>
          {/* 로고 */}
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'baseline', fontWeight: 800, fontSize: 36, letterSpacing: '-0.035em' }}>
              <span style={{ color: '#16403B' }}>Fin</span>
              <span style={{ background: 'linear-gradient(105deg, #2FD6BE 0%, #10A695 95%)', WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>Card</span>
            </div>
            <p style={{ fontSize: 14, color: 'var(--sub)', marginTop: 8 }}>3분 만에 맞춤 정책 찾기</p>
          </div>

          {/* 필드 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="아이디" value={username} onChange={setUsername}
              focus={f1} onFocus={() => setF1(true)} onBlur={() => setF1(false)} />
            <Field label="닉네임" value={nickname} onChange={setNickname}
              focus={f2} onFocus={() => setF2(true)} onBlur={() => setF2(false)} />
            <Field label="이메일" type="email" value={email} onChange={setEmail}
              focus={f3} onFocus={() => setF3(true)} onBlur={() => setF3(false)} />
            <Field label="비밀번호" type={showPw ? 'text' : 'password'} value={password} onChange={setPassword}
              focus={f4} onFocus={() => setF4(true)} onBlur={() => setF4(false)}
              right={eyeBtn(showPw, () => setShowPw(!showPw))} />
            <Field label="비밀번호 확인" type={showConfirm ? 'text' : 'password'} value={confirm} onChange={setConfirm}
              focus={f5} onFocus={() => setF5(true)} onBlur={() => setF5(false)}
              error={mismatch} right={eyeBtn(showConfirm, () => setShowConfirm(!showConfirm))} />

            {mismatch && <p style={{ fontSize: 13, color: '#F1546B', margin: 0 }}>비밀번호가 일치하지 않아요</p>}
            {error && <p style={{ fontSize: 13, color: '#F1546B', margin: 0 }}>{error}</p>}
          </div>
        </div>

        {/* 하단 고정: 버튼 */}
        <div style={{ padding: '0 28px 36px', flexShrink: 0 }}>
          <PrimaryBtn
            label={loading ? '가입 중…' : '회원가입'}
            onClick={handleSignup}
            disabled={loading || mismatch}
          />
          <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--sub)', marginTop: 18 }}>
            이미 계정이 있으신가요?{' '}
            <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 700, textDecoration: 'none' }}>
              로그인
            </Link>
          </p>
        </div>
      </div>
    </PhoneFrame>
  );
}
