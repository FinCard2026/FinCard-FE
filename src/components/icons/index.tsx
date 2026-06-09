import React from 'react';
import type { CatKey } from '../../types';

interface SvgProps {
  size?: number;
  sw?: number;
  fill?: string;
  bg?: string;
  ring?: string;
}

const Glyphs: Record<string, React.ReactNode> = {
  housing: (
    <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 11l8-6 8 6" />
      <path d="M6 10v9h12v-9" />
      <path d="M10 19v-5h4v5" />
    </g>
  ),
  job: (
    <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="2.2" />
      <path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7" />
      <path d="M3 12h18" />
    </g>
  ),
  saving: (
    <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12a7 6 0 0 1 14 0v4.5h2.2" />
      <path d="M4 12.5c-.7-.4-1.2-1.1-1.2-1.9 0-.7.6-1.3 1.4-1.1" />
      <path d="M11 6.2c.6-1.4 2.3-2 3.6-1.3" />
      <circle cx="15.5" cy="11.5" r="0.9" fill="#fff" stroke="none" />
      <path d="M8 17v2M14 17v2" />
      <path d="M8.5 8.5h5" />
    </g>
  ),
  living: (
    <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H18a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8.5Z" />
      <path d="M4 9h12.5" />
      <circle cx="16.5" cy="13.5" r="1.3" fill="#fff" stroke="none" />
    </g>
  ),
  education: (
    <g fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5 3 9l9 4 9-4-9-4Z" />
      <path d="M7 11v4c0 1 2.2 2.2 5 2.2s5-1.2 5-2.2v-4" />
      <path d="M21 9v4.5" />
    </g>
  ),
};

export const CATS = {
  housing:   { label: '주거',      color: '#3B82F6', g1: '#5DA0FF', g2: '#3E86F7', soft: '#ECF3FF' },
  job:       { label: '취업',      color: '#8466F5', g1: '#B097FF', g2: '#9277FF', soft: '#F1ECFF' },
  saving:    { label: '저축·적금', color: '#0FB6A6', g1: '#3BE3D2', g2: '#14C8B8', soft: '#DEFAF5' },
  living:    { label: '생활비',    color: '#EF8E12', g1: '#FFC257', g2: '#FFA630', soft: '#FFF4DC' },
  education: { label: '교육',      color: '#F5556B', g1: '#FF8C9B', g2: '#FF6378', soft: '#FFEAEE' },
};

export function CategoryIcon({ cat, size = 44, radius }: { cat: CatKey; size?: number; radius?: number }) {
  const meta = CATS[cat] || CATS.housing;
  const r = radius != null ? radius : Math.round(size * 0.32);
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: size, height: size, borderRadius: r,
      background: `linear-gradient(150deg, ${meta.g1} 0%, ${meta.g2} 100%)`, alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 8px 16px -7px ${meta.g2}88, inset 0 1.5px 1px rgba(255,255,255,.45)`, overflow: 'hidden', flexShrink: 0 }}>
      <span style={{ position: 'absolute', top: '-30%', left: '-10%', width: '80%', height: '70%', borderRadius: '50%',
        background: 'rgba(255,255,255,.28)', filter: 'blur(2px)' }} />
      <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" style={{ position: 'relative' }}>{Glyphs[cat]}</svg>
    </span>
  );
}

export function CatGlyph(cat: CatKey): React.ReactNode {
  return Glyphs[cat] || Glyphs.housing;
}

const I = (p: SvgProps) => ({
  width: p.size || 22, height: p.size || 22, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', strokeWidth: p.sw || 2,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
});

export const HomeTab = (p: SvgProps) => (
  <svg {...I(p)}><path d="M4 11l8-6 8 6" /><path d="M6 10v9h12v-9" /></svg>
);
export const CardTab = (p: SvgProps) => (
  <svg {...I(p)}><rect x="3" y="6" width="18" height="12" rx="2.4" /><path d="M3 10h18" /><path d="M7 14h4" /></svg>
);
export const UserTab = (p: SvgProps) => (
  <svg {...I(p)}><circle cx="12" cy="8.5" r="3.5" /><path d="M5 19c.8-3.4 3.6-5 7-5s6.2 1.6 7 5" /></svg>
);
export const Coin = (p: SvgProps) => (
  <svg width={p.size || 22} height={p.size || 22} viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9.5" fill={p.bg || '#FFC94D'} />
    <circle cx="12" cy="12" r="7.2" fill="none" stroke={p.ring || '#F2A93B'} strokeWidth="1.4" />
    <path d="M9.3 8.5l2.7 4 2.7-4M12 12.5V16M9.7 13.4h4.6M9.7 11.4h4.6" fill="none"
      stroke={p.ring || '#F2A93B'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
export const QuizIcon = (p: SvgProps) => (
  <svg {...I(p)}><circle cx="11" cy="11" r="6.5" /><path d="M15.8 15.8L20.5 20.5" /></svg>
);
export const Lock = (p: SvgProps) => (
  <svg {...I(p)}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
    <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    <circle cx="12" cy="15" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
export const Check = (p: SvgProps) => (
  <svg {...I(p)}><path d="M5 12.5l4.5 4.5L19 7" /></svg>
);
export const Gear = (p: SvgProps) => (
  <svg {...I(p)}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M12 3.5v2.2M12 18.3v2.2M4.8 7.5l1.9 1.1M17.3 15.4l1.9 1.1M4.8 16.5l1.9-1.1M17.3 8.6l1.9-1.1" />
  </svg>
);
export const Bell = (p: SvgProps) => (
  <svg {...I(p)}>
    <path d="M6 9a6 6 0 0 1 12 0c0 5 1.5 6 1.5 6h-15S6 14 6 9Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);
export const Chevron = (p: SvgProps) => (
  <svg {...I(p)}><path d="M9 6l6 6-6 6" /></svg>
);
export const ArrowRight = (p: SvgProps) => (
  <svg {...I(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ArrowLeft = (p: SvgProps) => (
  <svg {...I(p)}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const Close = (p: SvgProps) => (
  <svg {...I(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const Sparkle = (p: SvgProps) => (
  <svg width={p.size || 22} height={p.size || 22} viewBox="0 0 24 24" fill={p.fill || 'currentColor'}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
  </svg>
);
export const Shield = (p: SvgProps) => (
  <svg {...I(p)}>
    <path d="M12 3l7 2.5v5.5c0 4.4-3 7.6-7 9-4-1.4-7-4.6-7-9V5.5L12 3Z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);
export const Doc = (p: SvgProps) => (
  <svg {...I(p)}>
    <path d="M7 3h7l4 4v14H7Z" />
    <path d="M14 3v4h4" />
    <path d="M10 13h5M10 16.5h5" />
  </svg>
);
export const Pin = (p: SvgProps) => (
  <svg {...I(p)}>
    <path d="M12 21s6-5.3 6-10a6 6 0 1 0-12 0c0 4.7 6 10 6 10Z" />
    <circle cx="12" cy="11" r="2.3" />
  </svg>
);
export const Plus = (p: SvgProps) => (
  <svg {...I(p)}><path d="M12 5v14M5 12h14" /></svg>
);
export const Minus = (p: SvgProps) => (
  <svg {...I(p)}><path d="M5 12h14" /></svg>
);
export const Fire = (p: SvgProps) => (
  <svg width={p.size || 22} height={p.size || 22} viewBox="0 0 24 24" fill={p.fill || '#FB923C'}>
    <path d="M12 2.5c.4 3-1.6 4.2-2.8 5.6-1.4 1.6-2.7 3.2-2.7 6A5.5 5.5 0 0 0 17.5 14c0-2.3-1-3.8-1.8-4.6.2 1.2-.3 2.2-1 2.6.4-2.3-.7-4.6-2.7-9.5Z" />
  </svg>
);
export const External = (p: SvgProps) => (
  <svg {...I(p)}>
    <path d="M14 4h6v6M20 4l-8 8" />
    <path d="M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" />
  </svg>
);
export const Gift = (p: SvgProps) => (
  <svg {...I(p)}>
    <rect x="4" y="9" width="16" height="11" rx="1.5" />
    <path d="M4 13h16M12 9v11" />
    <path d="M12 9S10.5 5 8.3 5.6C6.8 6 7.2 9 9 9h3Zm0 0s1.5-4 3.7-3.4C17.2 6 16.8 9 15 9h-3Z" />
  </svg>
);
