import React from 'react';

export default function CartGlassIcon({ count }) {
  const maxFill = 5;
  const fillPercent = Math.min(count / maxFill, 1) * 100;

  return (
    <svg width="26" height="26" viewBox="0 0 24 24">
      <defs>
        <clipPath id="glass-clip">
          <path d="M6 3 L18 3 L16 20 Q12 22 8 20 Z" />
        </clipPath>
      </defs>

      <path
        d="M6 3 L18 3 L16 20 Q12 22 8 20 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />

      <g clipPath="url(#glass-clip)">
        <rect
          x="4"
          y={22 - (fillPercent / 100) * 19}
          width="16"
          height="20"
          fill="#2E93C4"
          style={{ transition: 'y 0.4s ease' }}
        />
      </g>
    </svg>
  );
}