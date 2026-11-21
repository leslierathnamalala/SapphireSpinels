import { useId } from 'react';

function outlineFor(shape) {
  switch (shape) {
    case 'Round':
    case 'Cabochon':
      return 'M82 150a78 78 0 1 0 156 0a78 78 0 1 0 -156 0';
    case 'Oval':
      return 'M160 62c40 0 72 38 72 88s-32 88-72 88-72-38-72-88 32-88 72-88z';
    case 'Cushion':
      return 'M108 78h104c22 10 40 32 40 72s-18 62-40 72H108c-22-10-40-32-40-72s18-62 40-72z';
    case 'Emerald':
      return 'M118 74h84l40 40v84l-40 40h-84l-40-40v-84z';
    case 'Pear':
      return 'M160 58c46 42 62 78 50 124-10 34-28 52-50 62-22-10-40-28-50-62-12-46 4-82 50-124z';
    case 'Marquise':
      return 'M160 54c42 48 58 86 0 196-58-110-42-148 0-196z';
    case 'Princess':
      return 'M160 64 236 150 160 236 84 150Z';
    default:
      return 'M160 62c40 0 72 38 72 88s-32 88-72 88-72-38-72-88 32-88 72-88z';
  }
}

function wedges(count, radius) {
  const cx = 160;
  const cy = 150;
  const paths = [];
  for (let index = 0; index < count; index += 1) {
    const start = -Math.PI / 2 + (index * 2 * Math.PI) / count;
    const end = -Math.PI / 2 + ((index + 1) * 2 * Math.PI) / count;
    const x1 = cx + Math.cos(start) * radius;
    const y1 = cy + Math.sin(start) * radius;
    const x2 = cx + Math.cos(end) * radius;
    const y2 = cy + Math.sin(end) * radius;
    paths.push(`M ${cx} ${cy} L ${x1.toFixed(1)} ${y1.toFixed(1)} L ${x2.toFixed(1)} ${y2.toFixed(1)} Z`);
  }
  return paths;
}

export function GemArt({
  hue = '#1a4c7c',
  accent = '#d7e6f5',
  shape = 'Oval',
  phenomenon,
  sheen = false,
  label,
  decorative = false,
}) {
  const rawId = useId().replace(/:/g, '');
  const outline = outlineFor(shape);
  const facetCount = shape === 'Cabochon' ? 6 : 10;
  const paths = wedges(facetCount, shape === 'Marquise' || shape === 'Pear' ? 96 : 88);

  return (
    <svg
      className="gem-art"
      viewBox="0 0 320 320"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : label}
      aria-hidden={decorative ? true : undefined}
    >
      <defs>
        <radialGradient id={`${rawId}-studio`} cx="50%" cy="38%" r="68%">
          <stop offset="0%" stopColor="#fffdf8" />
          <stop offset="58%" stopColor="#f3ecdf" />
          <stop offset="100%" stopColor="#e6dccb" />
        </radialGradient>
        <linearGradient id={`${rawId}-body`} x1="18%" y1="8%" x2="82%" y2="100%">
          <stop offset="0%" stopColor={accent} />
          <stop offset="42%" stopColor={hue} />
          <stop offset="100%" stopColor="#101820" />
        </linearGradient>
        <linearGradient id={`${rawId}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="38%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.28" />
        </linearGradient>
        <filter id={`${rawId}-shadow`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="16" stdDeviation="10" floodColor="#1c140c" floodOpacity="0.28" />
        </filter>
        <clipPath id={`${rawId}-clip`}>
          <path d={outline} />
        </clipPath>
      </defs>
      <rect width="320" height="320" fill={`url(#${rawId}-studio)`} />
      <ellipse cx="160" cy="262" rx="78" ry="14" fill="rgba(48, 34, 20, 0.16)" />
      <g filter={`url(#${rawId}-shadow)`} clipPath={`url(#${rawId}-clip)`}>
        <path d={outline} fill={`url(#${rawId}-body)`} />
        {paths.map((path, index) => (
          <path
            key={path}
            d={path}
            fill={index % 2 === 0 ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.14)'}
          />
        ))}
        {sheen ? (
          <ellipse cx="150" cy="146" rx="46" ry="70" fill="#ffffff" opacity="0.28" />
        ) : null}
        <path d={outline} fill={`url(#${rawId}-glass)`} />
        {phenomenon === 'Star' ? (
          <g stroke="#fff" strokeWidth="1.4" opacity="0.78" fill="none">
            <path d="M160 92v116M104 150h112M118 108l84 84M202 108l-84 84" />
          </g>
        ) : null}
        {phenomenon === "Cat's Eye" ? (
          <path d="M96 150h128" stroke="#fff8e8" strokeWidth="4" strokeLinecap="round" opacity="0.8" />
        ) : null}
      </g>
    </svg>
  );
}
