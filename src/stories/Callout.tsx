import React from 'react';

type CalloutProps = {
  tone?: 'info' | 'warning';
  children?: string;
};

const tones = {
  info: { background: '#e8f1ff', border: '#3b82f6', color: '#1e3a8a' },
  warning: { background: '#fff7e6', border: '#f59e0b', color: '#7c2d12' },
};

export function Callout({ tone = 'info', children }: CalloutProps) {
  const colors = tones[tone];
  return (
    <aside
      style={{
        background: colors.background,
        borderLeft: `4px solid ${colors.border}`,
        color: colors.color,
        fontFamily: 'sans-serif',
        fontSize: 14,
        lineHeight: 1.5,
        padding: '12px 16px',
      }}
    >
      {children}
    </aside>
  );
}
