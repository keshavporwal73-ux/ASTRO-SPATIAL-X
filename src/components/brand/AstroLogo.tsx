import React from 'react';

interface AstroLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  glow?: boolean;
}

export const AstroLogo: React.FC<AstroLogoProps> = ({
  size = 'md',
  showText = true,
  showTagline = false,
  className = '',
  glow = true,
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-sm', badge: 'text-[9px]', tag: 'text-[8px]' },
    md: { icon: 40, text: 'text-base', badge: 'text-[10px]', tag: 'text-[9px]' },
    lg: { icon: 54, text: 'text-xl', badge: 'text-xs', tag: 'text-[10px]' },
    hero: { icon: 84, text: 'text-3xl md:text-4xl', badge: 'text-xs md:text-sm', tag: 'text-xs md:text-sm' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Animated SVG Scientific Mark */}
      <div
        className="relative shrink-0 flex items-center justify-center group"
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        {/* Outer Glow Halo */}
        {glow && (
          <div
            className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 via-indigo-500/25 to-purple-500/20 blur-md animate-pulse"
            style={{ transform: 'scale(1.2)' }}
          />
        )}

        <svg
          viewBox="0 0 100 100"
          className="w-full h-full relative z-10 overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="astroRingGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#6366F1" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#A855F7" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="astroRingGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#818CF8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.3" />
            </linearGradient>

            <radialGradient id="astroCoreGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#38BDF8" />
              <stop offset="70%" stopColor="#6366F1" />
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="astroCoronaGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#818CF8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#030712" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Coordinate Precision Ticks */}
          <circle cx="50" cy="50" r="46" stroke="#1E293B" strokeWidth="1" strokeDasharray="2 6" />
          <line x1="50" y1="2" x2="50" y2="7" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="50" y1="93" x2="50" y2="98" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="2" y1="50" x2="7" y2="50" stroke="#38BDF8" strokeWidth="1.5" />
          <line x1="93" y1="50" x2="98" y2="50" stroke="#38BDF8" strokeWidth="1.5" />

          {/* Precision Crosshairs */}
          <line x1="25" y1="50" x2="75" y2="50" stroke="#334155" strokeWidth="0.75" strokeDasharray="3 3" />
          <line x1="50" y1="25" x2="50" y2="75" stroke="#334155" strokeWidth="0.75" strokeDasharray="3 3" />

          {/* Outer Orbital Ellipse 1 (Inclined 45deg) - Rotates Clockwise */}
          <g className="origin-center animate-[spin_24s_linear_infinite]">
            <ellipse
              cx="50"
              cy="50"
              rx="42"
              ry="18"
              stroke="url(#astroRingGrad1)"
              strokeWidth="1.5"
              strokeDasharray="90 30"
              transform="rotate(-28 50 50)"
            />
            {/* Orbiting Satellite Particle 1 */}
            <circle cx="86" cy="36" r="2.8" fill="#38BDF8" className="shadow-lg shadow-cyan-400">
              <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Middle Orbital Ellipse 2 (Inclined -35deg) - Rotates Counter-Clockwise */}
          <g className="origin-center animate-[spin_18s_linear_infinite_reverse]">
            <ellipse
              cx="50"
              cy="50"
              rx="34"
              ry="14"
              stroke="url(#astroRingGrad2)"
              strokeWidth="1.25"
              strokeDasharray="60 20"
              transform="rotate(38 50 50)"
            />
            {/* Orbiting Satellite Particle 2 */}
            <circle cx="22" cy="62" r="2.2" fill="#818CF8" />
          </g>

          {/* Inner Orbital Circle 3 */}
          <circle
            cx="50"
            cy="50"
            r="20"
            stroke="#475569"
            strokeWidth="0.75"
            strokeDasharray="4 4"
            className="origin-center animate-[spin_32s_linear_infinite]"
          />

          {/* Central Luminous Pulsar Core / Celestial Body */}
          <circle cx="50" cy="50" r="16" fill="url(#astroCoronaGrad)" />
          <circle cx="50" cy="50" r="8" fill="url(#astroCoreGrad)">
            <animate attributeName="r" values="7.5;9;7.5" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="50" r="3" fill="#FFFFFF" />

          {/* Micro Lens Flare horizontal spike */}
          <line x1="32" y1="50" x2="68" y2="50" stroke="#FFFFFF" strokeWidth="0.75" opacity="0.65" />
          <line x1="50" y1="32" x2="50" y2="68" stroke="#FFFFFF" strokeWidth="0.75" opacity="0.65" />
        </svg>
      </div>

      {/* Typography & Tagline */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black font-mono tracking-wider ${currentSize.text} bg-gradient-to-r from-slate-100 via-cyan-200 to-indigo-300 bg-clip-text text-transparent`}
            >
              ASTRO
            </span>
            <span
              className={`font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/50 text-cyan-300 ${currentSize.badge} tracking-widest`}
            >
              SPATIAL-X
            </span>
          </div>

          {showTagline && (
            <span className={`text-slate-400 font-mono tracking-widest uppercase mt-1 ${currentSize.tag}`}>
              ASK • CALCULATE • INVESTIGATE • EXPLORE
            </span>
          )}
        </div>
      )}
    </div>
  );
};
