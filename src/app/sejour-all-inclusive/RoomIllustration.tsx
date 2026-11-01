type Variant = "standard" | "junior" | "senior";

/** Vector illustration of a room with a sea view. Purely decorative. */
export default function RoomIllustration({ variant }: { variant: Variant }) {
  const id = `ri-${variant}`;
  const win = variant === "senior" ? { x: 22, w: 78 } : variant === "junior" ? { x: 26, w: 84 } : { x: 34, w: 96 };
  const wx = win.x;
  const ww = win.w;
  const arch = ww / 2;
  const bx = variant === "senior" ? 226 : variant === "junior" ? 150 : 168;
  const bw = variant === "senior" ? 100 : variant === "junior" ? 150 : 190;

  return (
    <svg viewBox="0 0 420 220" role="img" aria-hidden="true" preserveAspectRatio="xMidYMid slice" className="sj-illus">
      <defs>
        <linearGradient id={`${id}-wall`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1b2a38" />
          <stop offset="1" stopColor="#2f6f7e" />
        </linearGradient>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6dfae" />
          <stop offset="0.55" stopColor="#f2b988" />
          <stop offset="1" stopColor="#7fc4cf" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={`M${wx} 122 V70 a${arch} ${arch} 0 0 1 ${ww} 0 V122 Z`} />
        </clipPath>
      </defs>

      {/* wall & floor */}
      <rect width="420" height="220" fill={`url(#${id}-wall)`} />
      <rect y="168" width="420" height="52" fill="#101922" />
      <ellipse cx="215" cy="196" rx="160" ry="14" fill="#c8a97e" opacity=".18" />

      {/* window with sea view */}
      <g clipPath={`url(#${id}-clip)`}>
        <rect x={wx} y="20" width={ww} height="110" fill={`url(#${id}-sky)`} />
        <circle cx={wx + ww * 0.68} cy="84" r="13" fill="#fff4cf" opacity=".95" />
        <rect x={wx} y="100" width={ww} height="30" fill="#3f8d9c" />
        <path d={`M${wx} 108 q${ww / 8} -6 ${ww / 4} 0 t${ww / 4} 0 t${ww / 4} 0 t${ww / 4} 0`} stroke="#bfe6ea" strokeWidth="2" fill="none" opacity=".8" />
        <path d={`M${wx} 118 q${ww / 8} -6 ${ww / 4} 0 t${ww / 4} 0 t${ww / 4} 0 t${ww / 4} 0`} stroke="#bfe6ea" strokeWidth="2" fill="none" opacity=".55" />
        <path d={`M${wx + 14} 122 q4 -34 -2 -48`} stroke="#12303a" strokeWidth="3" fill="none" />
        <path d={`M${wx + 12} 74 q-16 -4 -22 8 M${wx + 12} 74 q14 -12 26 -2 M${wx + 12} 74 q-4 -16 10 -22 M${wx + 12} 74 q12 -4 20 8`} stroke="#12303a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      </g>
      <path d={`M${wx} 122 V70 a${arch} ${arch} 0 0 1 ${ww} 0 V122 Z`} fill="none" stroke="#c8a97e" strokeWidth="4" />
      <line x1={wx + arch} y1={70 - arch} x2={wx + arch} y2="122" stroke="#c8a97e" strokeWidth="2.5" />
      <line x1={wx} y1="96" x2={wx + ww} y2="96" stroke="#c8a97e" strokeWidth="2.5" />
      <rect x={wx - 5} y="122" width={ww + 10} height="6" rx="3" fill="#c8a97e" />

      {variant === "senior" && (
        <>
          {/* sofa */}
          <rect x="112" y="122" width="96" height="30" rx="12" fill="#e8dcc6" />
          <rect x="108" y="138" width="104" height="32" rx="12" fill="#c8a97e" />
          <rect x="104" y="132" width="16" height="38" rx="8" fill="#a98a5e" />
          <rect x="200" y="132" width="16" height="38" rx="8" fill="#a98a5e" />
          <rect x="130" y="130" width="22" height="20" rx="6" fill="#2f6f7e" />
          <rect x="172" y="130" width="22" height="20" rx="6" fill="#f7f3ec" />
          {/* pendant light */}
          <line x1="160" y1="0" x2="160" y2="52" stroke="#c8a97e" strokeWidth="2" />
          <path d="M142 70 q18 -26 36 0 Z" fill="#c8a97e" />
          <ellipse cx="160" cy="74" rx="26" ry="14" fill="#fff4cf" opacity=".18" />
        </>
      )}

      {/* bed */}
      <rect x={bx} y="82" width={bw} height="62" rx="8" fill="#8a6a43" />
      <rect x={bx - 6} y="124" width={bw + 12} height="40" rx="10" fill="#f7f3ec" />
      <rect x={bx - 6} y="140" width={bw + 12} height="26" rx="8" fill="#c8a97e" />
      <rect x={bx + 10} y="108" width={bw / 2 - 16} height="22" rx="9" fill="#ffffff" />
      <rect x={bx + bw / 2 + 6} y="108" width={bw / 2 - 16} height="22" rx="9" fill="#ffffff" />
      <rect x={bx} y="162" width="8" height="10" fill="#5a4328" />
      <rect x={bx + bw - 8} y="162" width="8" height="10" fill="#5a4328" />

      {/* nightstand + lamp (standard only) */}
      {variant === "standard" && (
        <g>
          <rect x="372" y="132" width="34" height="38" rx="4" fill="#8a6a43" />
          <rect x="386" y="108" width="6" height="24" fill="#c8a97e" />
          <path d="M376 112 q13 -22 26 0 Z" fill="#fff4cf" />
          <ellipse cx="389" cy="118" rx="26" ry="14" fill="#fff4cf" opacity=".16" />
        </g>
      )}

      {/* kitchenette (junior & senior) */}
      {variant !== "standard" && (
        <g transform={variant === "senior" ? "translate(4 0)" : ""}>
          <rect x="332" y="58" width="78" height="34" rx="4" fill="#8a6a43" />
          <line x1="371" y1="58" x2="371" y2="92" stroke="#5a4328" strokeWidth="2" />
          <circle cx="364" cy="76" r="2.5" fill="#c8a97e" />
          <circle cx="378" cy="76" r="2.5" fill="#c8a97e" />
          <rect x="328" y="118" width="86" height="52" rx="3" fill="#e8dcc6" />
          <rect x="324" y="112" width="94" height="9" rx="3" fill="#f7f3ec" />
          <circle cx="352" cy="108" r="5" fill="#2f6f7e" />
          <circle cx="376" cy="108" r="5" fill="#2f6f7e" />
          <rect x="392" y="96" width="14" height="16" rx="3" fill="#c8a97e" />
          <line x1="371" y1="122" x2="371" y2="170" stroke="#c9b997" strokeWidth="2" />
        </g>
      )}

      {/* sparkles */}
      <g fill="#fff4cf" opacity=".85">
        <path d="M206 30 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z" />
        <path d="M276 52 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z" />
      </g>
    </svg>
  );
}
