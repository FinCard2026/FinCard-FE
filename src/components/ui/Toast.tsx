import React from 'react';
import { Coin, Close } from '../icons';

interface Props {
  msg: string;
  good: boolean;
}

export default function Toast({ msg, good }: Props) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, bottom: 96,
      display: 'flex', justifyContent: 'center', zIndex: 40, pointerEvents: 'none',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        background: good ? 'rgba(24,27,30,.92)' : 'rgba(210,75,90,.95)',
        color: '#fff', padding: '11px 18px', borderRadius: 999,
        fontSize: 14, fontWeight: 600, boxShadow: '0 10px 26px -8px rgba(0,0,0,.4)',
      }}>
        {good ? <Coin size={18} bg="#FFC94D" ring="#E8A317" /> : <Close size={16} />}
        {msg}
      </div>
    </div>
  );
}
