import React from 'react';
import './PalmBackground.css';

function PalmTree({ className, style }) {
  return (
    <svg
      className={`palm-tree ${className || ''}`}
      style={style}
      viewBox="0 0 120 260"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Trunk */}
      <path
        d="M55 260 Q52 200 50 160 Q48 120 53 80 Q56 60 60 40"
        stroke="#4A2C0A"
        strokeWidth="10"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M65 260 Q62 200 60 160 Q58 120 63 80 Q66 60 60 40"
        stroke="#6B3F14"
        strokeWidth="7"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Trunk texture */}
      {[240, 220, 200, 180, 160, 140, 120, 100].map((y, i) => (
        <line
          key={i}
          x1={51 + i * 0.3}
          y1={y}
          x2={58 + i * 0.3}
          y2={y - 4}
          stroke="#3D2007"
          strokeWidth="1.5"
          opacity="0.4"
        />
      ))}

      {/* Frond 1 — top-left sweep */}
      <path
        d="M60 40 Q30 10 -5 20 Q10 35 30 32 Q45 30 60 40"
        fill="#2D6A2D"
        opacity="0.9"
      />
      <path
        d="M60 40 Q30 10 -5 20"
        stroke="#1E5C1E"
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />

      {/* Frond 2 — top-right sweep */}
      <path
        d="M60 40 Q90 10 125 18 Q110 33 90 32 Q75 30 60 40"
        fill="#2D6A2D"
        opacity="0.9"
      />
      <path
        d="M60 40 Q90 10 125 18"
        stroke="#1E5C1E"
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />

      {/* Frond 3 — left drooping */}
      <path
        d="M60 40 Q25 30 5 55 Q20 55 35 48 Q50 42 60 40"
        fill="#3A8A3A"
        opacity="0.85"
      />
      <path
        d="M60 40 Q25 30 5 55"
        stroke="#2A7A2A"
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />

      {/* Frond 4 — right drooping */}
      <path
        d="M60 40 Q95 30 115 55 Q100 55 85 48 Q70 42 60 40"
        fill="#3A8A3A"
        opacity="0.85"
      />
      <path
        d="M60 40 Q95 30 115 55"
        stroke="#2A7A2A"
        strokeWidth="1.5"
        fill="none"
        opacity="0.5"
      />

      {/* Frond 5 — upright center */}
      <path
        d="M60 40 Q55 5 60 -15 Q65 5 60 40"
        fill="#247A24"
        opacity="0.9"
      />

      {/* Frond 6 — upper-left */}
      <path
        d="M60 40 Q38 15 18 8 Q30 28 48 34 Q55 36 60 40"
        fill="#2D6A2D"
        opacity="0.8"
      />

      {/* Frond 7 — upper-right */}
      <path
        d="M60 40 Q82 15 102 8 Q90 28 72 34 Q65 36 60 40"
        fill="#2D6A2D"
        opacity="0.8"
      />

      {/* Coconuts */}
      <circle cx="57" cy="43" r="5" fill="#8B6914" />
      <circle cx="64" cy="46" r="4.5" fill="#7A5A10" />
      <circle cx="60" cy="49" r="4" fill="#6B4D0C" />
    </svg>
  );
}

export default function PalmBackground() {
  return (
    <div className="palm-background" aria-hidden="true">
      {/* Gradient sky overlay */}
      <div className="sky-gradient" />

      {/* Stars / sparkles */}
      <div className="stars">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              width: `${1 + Math.random() * 3}px`,
              height: `${1 + Math.random() * 3}px`,
            }}
          />
        ))}
      </div>

      {/* Floating orbs */}
      <div className="orb orb-gold" />
      <div className="orb orb-maroon" />
      <div className="orb orb-gold-2" />

      {/* Palm trees — left side */}
      <PalmTree className="palm-left-1" />
      <PalmTree className="palm-left-2" />

      {/* Palm trees — right side */}
      <PalmTree className="palm-right-1" />
      <PalmTree className="palm-right-2" />

      {/* Ground grass */}
      <div className="ground-left" />
      <div className="ground-right" />
    </div>
  );
}
