'use client';
import type { CSSProperties, ReactNode } from 'react';
import { C, FONT } from '@/lib/tokens';

interface Props {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'dark' | 'ghost';
  style?: CSSProperties;
  type?: 'button' | 'submit';
}

export function PillButton({
  children,
  onClick,
  disabled,
  variant = 'dark',
  style = {},
  type = 'button',
}: Props) {
  const bg = variant === 'dark' ? C.ink : 'transparent';
  const fg = variant === 'dark' ? '#fff' : C.ink;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        all: 'unset',
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: FONT,
        fontSize: 17,
        fontWeight: 600,
        letterSpacing: '-0.01em',
        padding: '18px 28px',
        borderRadius: 999,
        background: bg,
        color: fg,
        opacity: disabled ? 0.35 : 1,
        border: variant === 'ghost' ? `1.5px solid ${C.line}` : 'none',
        boxShadow:
          variant === 'dark' && !disabled ? '0 6px 14px rgba(21,20,15,0.18)' : 'none',
        ...style,
      }}
    >
      {children}
    </button>
  );
}
