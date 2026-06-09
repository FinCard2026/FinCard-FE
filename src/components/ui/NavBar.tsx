import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeTab, CardTab, UserTab } from '../icons';

const items = [
  { key: 'home', label: '홈', path: '/home', Icon: HomeTab },
  { key: 'strategy', label: '금융상품', path: '/strategy', Icon: CardTab },
  { key: 'mypage', label: '마이', path: '/mypage', Icon: UserTab },
];

export default function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      flexShrink: 0, display: 'flex', background: 'var(--card)',
      borderTop: '1px solid var(--line)', padding: '9px 12px 26px',
    }}>
      {items.map((it) => {
        const active = location.pathname === it.path;
        return (
          <button
            key={it.key}
            onClick={() => navigate(it.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              color: active ? 'var(--brand)' : 'var(--sub)',
            }}
          >
            <it.Icon size={25} sw={active ? 2.4 : 2} />
            <span style={{ fontSize: 11, fontWeight: active ? 800 : 600 }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}
