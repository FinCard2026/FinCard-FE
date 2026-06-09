import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PhoneFrame from '../components/ui/PhoneFrame';
import { Tokens } from '../lib/api';

export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      sessionStorage.setItem('splashShown', '1');
      navigate(Tokens.access ? '/home' : '/login', { replace: true });
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <PhoneFrame>
      <div style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0,
        background: 'radial-gradient(120% 60% at 50% 18%, var(--brand-soft) 0%, var(--bg) 55%)',
        padding: '0 32px',
        textAlign: 'center',
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', fontWeight: 800,
          fontSize: 56, letterSpacing: '-0.035em', marginBottom: 20,
        }}>
          <span style={{ color: '#16403B' }}>Fin</span>
          <span style={{
            background: 'linear-gradient(105deg, #2FD6BE 0%, #10A695 95%)',
            WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          }}>Card</span>
        </div>

        <h1 style={{
          fontSize: 22, fontWeight: 800, color: 'var(--ink)',
          lineHeight: 1.45, margin: 0, letterSpacing: '-0.02em',
        }}>
          흩어진 청년 정책,<br />한 곳에 모아드려요
        </h1>
        <p style={{
          fontSize: 14.5, color: 'var(--sub)', lineHeight: 1.7,
          marginTop: 14, maxWidth: 260,
        }}>
          주거·취업·저축·생활비 정책을<br />내 상황에 맞게 카드로 정리해드려요.
        </p>

        {/* 로딩 점 애니메이션 */}
        <div style={{ display: 'flex', gap: 7, marginTop: 52 }}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: 999,
              background: 'var(--brand)',
              animation: `splashDot .9s ease-in-out ${i * 0.18}s infinite alternate`,
            }} />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes splashDot {
          from { opacity: 0.25; transform: scale(0.75); }
          to   { opacity: 1;    transform: scale(1); }
        }
      `}</style>
    </PhoneFrame>
  );
}
