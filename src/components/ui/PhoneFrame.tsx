import React from 'react';
import { THEMES, TWEAK_DEFAULTS } from '../../context/AppContext';
import type { TweakSettings } from '../../types';

function now() {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
}

interface Props {
  children: React.ReactNode;
  tweaks?: TweakSettings;
}

export default function PhoneFrame({ children, tweaks = TWEAK_DEFAULTS }: Props) {
  const theme = THEMES[tweaks.colorTheme] || THEMES.mint;

  const cssVars: React.CSSProperties & Record<string, string> = {
    '--brand': theme.brand,
    '--brand-2': theme.brand2,
    '--brand-soft': theme.soft,
    '--brand-wash': theme.wash,
    '--brand-ink': theme.ink,
    '--bg': '#F7FAFB',
    '--card': '#FFFFFF',
    '--line': '#EDF1F3',
    '--ink': '#1A1E22',
    '--sub': '#929AA3',
  };

  return (
    <>
      {/* 모바일: 풀스크린 */}
      <div className="phone-mobile" style={{ ...cssVars, display: 'none' } as React.CSSProperties}>
        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
          {children}
        </div>
      </div>

      {/* 데스크톱: 폰 목업 */}
      <div className="phone-desktop" style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#E7EAEC', padding: 20,
      }}>
        <div style={{
          ...(cssVars as React.CSSProperties),
          position: 'relative',
          width: '390px',
          height: '844px',
          background: 'var(--bg)',
          borderRadius: '46px',
          overflow: 'hidden',
          boxShadow: '0 40px 90px -30px rgba(20,30,40,.45), 0 0 0 11px #1C1F24, 0 0 0 12px #2C3036',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Pretendard, -apple-system, sans-serif',
        }}>
          {/* status bar */}
          <div style={{
            height: 46, flexShrink: 0, display: 'flex', alignItems: 'flex-end',
            justifyContent: 'space-between', padding: '0 26px 8px',
            fontSize: 14, fontWeight: 700, color: 'var(--ink)',
            position: 'relative', zIndex: 5, pointerEvents: 'none',
          }}>
            <span>{now()}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="18" height="12" viewBox="0 0 18 12">
                <rect x="0" y="7" width="3" height="5" rx="1" fill="currentColor"/>
                <rect x="5" y="4" width="3" height="8" rx="1" fill="currentColor"/>
                <rect x="10" y="1.5" width="3" height="10.5" rx="1" fill="currentColor" opacity="0.4"/>
              </svg>
              <svg width="24" height="12" viewBox="0 0 24 12">
                <rect x="1" y="1" width="20" height="10" rx="3" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5"/>
                <rect x="2.5" y="2.5" width="14" height="7" rx="1.5" fill="currentColor"/>
                <rect x="22" y="4" width="1.6" height="4" rx="0.8" fill="currentColor" opacity="0.5"/>
              </svg>
            </div>
          </div>

          {/* screen */}
          <div style={{ flex: 1, minHeight: 0, position: 'relative', marginTop: -46, paddingTop: 46 }}>
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
