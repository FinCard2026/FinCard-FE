import React from 'react';

interface Props {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
}

export default function PrimaryBtn({ label, onClick, disabled }: Props) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', padding: '16px', borderRadius: 15, border: 'none', fontFamily: 'inherit',
        fontSize: 16.5, fontWeight: 700, color: '#fff', cursor: disabled ? 'not-allowed' : 'pointer',
        background: disabled ? 'var(--line)' : 'var(--brand)', transition: 'all .2s ease',
        boxShadow: disabled ? 'none' : '0 10px 22px -10px var(--brand)',
      }}
    >
      {label}
    </button>
  );
}
