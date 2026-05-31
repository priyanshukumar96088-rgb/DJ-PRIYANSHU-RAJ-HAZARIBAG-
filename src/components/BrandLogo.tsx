import React from 'react';

export default function BrandLogo({ className = 'w-16 h-16' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer Glow effect inside SVGs */}
      <circle cx="200" r="190" fill="#090909" stroke="url(#silverGrad)" strokeWidth="8"/>
      <circle cx="200" r="176" fill="none" stroke="#1c1c1c" strokeWidth="3"/>
      <circle cx="200" r="150" fill="#141414" stroke="url(#silverGrad)" strokeWidth="4"/>
      
      {/* Soundwave/Equalizer ticks in circle background */}
      <g opacity="0.15">
        {Array.from({ length: 36 }).map((_, i) => {
          const angle = (i * 10 * Math.PI) / 180;
          const x1 = 200 + Math.cos(angle) * 115;
          const y1 = 200 + Math.sin(angle) * 115;
          const x2 = 200 + Math.cos(angle) * 135;
          const y2 = 200 + Math.sin(angle) * 135;
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#10b981"
              strokeWidth="2.5"
            />
          );
        })}
      </g>

      {/* Circular Glowing Ring segments - replica of his channel logo markings */}
      <path
        d="M 334 150 A 140 140 0 0 1 334 250"
        fill="none"
        stroke="#ffffff"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M 334 150 A 140 140 0 0 1 334 250"
        fill="none"
        stroke="#ffffff"
        strokeWidth="12"
        strokeLinecap="round"
        opacity="0.35"
        filter="blur(5px)"
      />

      {/* Large Bold "PR" Logo monogram matching the image design */}
      <g transform="translate(100, 135)">
        {/* Letter P */}
        <path
          d="M 0 0 L 80 0 C 112 0 112 40 80 40 L 32 40 L 32 82 L 0 82 Z M 32 14 L 72 14 C 82 14 82 26 72 26 L 32 26 Z"
          fill="#ffffff"
        />
        {/* Letter R */}
        <path
          d="M 106 0 L 176 0 C 208 0 208 38 176 38 L 138 38 L 176 82 L 138 82 L 106 38 L 106 82 L 106 0 Z M 138 14 L 164 14 C 174 14 174 24 164 24 L 138 24 Z"
          fill="#ffffff"
        />
      </g>

      {/* Circular Branding text */}
      <text
        x="200"
        y="272"
        fill="#ffffff"
        fontSize="17.5"
        fontFamily="system-ui, -apple-system, sans-serif"
        fontWeight="800"
        textAnchor="middle"
        letterSpacing="0.25"
      >
        Dj Priyanshu Hazaribag
      </text>
      
      <text
        x="200"
        y="294"
        fill="#10b981"
        fontSize="12.5"
        fontFamily="monospace"
        fontWeight="bold"
        textAnchor="middle"
        letterSpacing="1.2"
      >
        exclusive drop mix
      </text>

      <defs>
        <linearGradient id="silverGrad" x1="0" y1="0" x2="400" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9e9e9e"/>
          <stop offset="20%" stopColor="#ffffff"/>
          <stop offset="40%" stopColor="#3a3a3a"/>
          <stop offset="60%" stopColor="#efefef"/>
          <stop offset="80%" stopColor="#1a1a1a"/>
          <stop offset="100%" stopColor="#b5b5b5"/>
        </linearGradient>
      </defs>
    </svg>
  );
}
