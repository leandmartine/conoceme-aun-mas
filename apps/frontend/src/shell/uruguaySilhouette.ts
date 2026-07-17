/** Abstract Uruguay skyline / rambla silhouettes — SVG decorative, not clipart flags. */
export function uruguayBackdropSvg(): string {
  return `
<svg class="shell__skyline" viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
  <defs>
    <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1B4F72" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#0B1220" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="city" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#7EB6D9" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#0B1220" stop-opacity="0.85"/>
    </linearGradient>
  </defs>
  <path class="shell__skyline-far" fill="url(#city)" d="M0 280
    L60 270 L90 240 L110 250 L140 200 L160 210 L190 170 L210 185
    L250 150 L270 165 L300 140 L330 160 L360 130 L390 155 L430 120
    L460 145 L500 110 L540 150 L580 100 L620 140 L660 95 L700 130
    L740 90 L780 125 L820 105 L860 140 L900 115 L940 150 L980 120
    L1020 160 L1060 130 L1100 170 L1140 145 L1180 180 L1220 160
    L1260 190 L1300 175 L1340 200 L1380 185 L1440 210 L1440 420 L0 420 Z"/>
  <path class="shell__skyline-near" fill="#0d1a2c" opacity="0.85" d="M0 320
    L80 310 L130 280 L180 300 L240 250 L300 275 L360 230 L420 260
    L500 220 L580 255 L660 210 L740 245 L820 225 L900 250 L980 235
    L1060 265 L1140 250 L1220 280 L1300 270 L1380 295 L1440 290
    L1440 420 L0 420 Z"/>
  <ellipse class="shell__water" cx="720" cy="390" rx="900" ry="60" fill="url(#water)"/>
  <circle class="shell__sun" cx="1120" cy="120" r="36" fill="#F4C430" opacity="0.55"/>
</svg>`;
}
