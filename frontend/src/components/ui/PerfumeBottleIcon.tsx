interface Props {
  width?: number;
  height?: number;
  idPrefix?: string;
}

export function PerfumeBottleIcon({ width = 36, height = 46, idPrefix = "pb" }: Props) {
  const g1 = `${idPrefix}-g1`;
  const g2 = `${idPrefix}-g2`;
  const g3 = `${idPrefix}-g3`;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 36 46"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Metallic gold — horizontal */}
        <linearGradient id={g1} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#7A5E28"/>
          <stop offset="30%"  stopColor="#E8D080"/>
          <stop offset="58%"  stopColor="#C9A96E"/>
          <stop offset="100%" stopColor="#7A5E28"/>
        </linearGradient>
        {/* Amber liquid */}
        <linearGradient id={g2} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="rgba(201,169,110,0.07)"/>
          <stop offset="60%"  stopColor="rgba(175,110,30,0.22)"/>
          <stop offset="100%" stopColor="rgba(120,75,10,0.34)"/>
        </linearGradient>
        {/* Glass shine */}
        <linearGradient id={g3} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="rgba(255,255,255,0.22)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0)"/>
        </linearGradient>
      </defs>

      {/* Nozzle — thin centred */}
      <rect x="15.5" y="0" width="5" height="3.5" rx="1.2"
        fill={`url(#${g1})`} opacity="0.75"/>

      {/* Cap — wide, flat, prominent */}
      <rect x="8" y="3.5" width="20" height="7.5" rx="2.5"
        fill={`url(#${g1})`}/>
      <rect x="9.5" y="6.8" width="17" height="0.7" rx="0.35"
        fill="rgba(0,0,0,0.22)"/>
      <rect x="9.5" y="9.8" width="17" height="0.5" rx="0.25"
        fill="rgba(255,255,255,0.14)"/>

      {/* Neck — short, 6px tall */}
      <rect x="14" y="11" width="8" height="6" rx="0.8"
        fill="rgba(8,6,8,0.8)" stroke={`url(#${g1})`} strokeWidth="1"/>

      {/* Shoulder — slight taper */}
      <path d="M14 17 L9.5 21 H26.5 L22 17 Z"
        fill="rgba(8,6,8,0.82)"
        stroke={`url(#${g1})`} strokeWidth="0.9" strokeLinejoin="round"/>

      {/* Body — WIDE, square-ish: 23px wide × 19px tall */}
      <rect x="7" y="21" width="22" height="19" rx="2"
        fill="rgba(8,6,8,0.92)"
        stroke={`url(#${g1})`} strokeWidth="1.1"/>

      {/* Amber fill */}
      <rect x="8.8" y="22.8" width="18.4" height="15.4" rx="1.4"
        fill={`url(#${g2})`}/>

      {/* Glass shine */}
      <rect x="8.8" y="22.8" width="7" height="15.4" rx="1.4"
        fill={`url(#${g3})`}/>

      {/* Dark right edge */}
      <rect x="22.6" y="22.8" width="4.6" height="15.4" rx="0 1.4 1.4 0"
        fill="rgba(0,0,0,0.18)"/>

      {/* Label frame — wide */}
      <rect x="10" y="25.5" width="16" height="8" rx="1"
        fill="rgba(201,169,110,0.05)"
        stroke={`url(#${g1})`} strokeWidth="0.7" strokeOpacity="0.9"/>
      <line x1="11.5" y1="27" x2="24.5" y2="27"
        stroke="rgba(201,169,110,0.4)" strokeWidth="0.4"/>
      <line x1="11.5" y1="32.5" x2="24.5" y2="32.5"
        stroke="rgba(201,169,110,0.4)" strokeWidth="0.4"/>

      {/* Base plate */}
      <rect x="5.5" y="40" width="25" height="3.5" rx="1.5"
        fill="none"
        stroke={`url(#${g1})`} strokeWidth="0.9" strokeOpacity="0.65"/>
    </svg>
  );
}
