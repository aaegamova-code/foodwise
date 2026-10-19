import { useId, type ReactElement } from 'react';
import type { Broth, FoodKey, PlateSpec, SideKey } from '../types';

// React-rendered SVG meal illustration.
// Wedges represent approximate share of PLATE AREA — not calories or macronutrients.

const BASE: Record<FoodKey, string> = {
  rice: '#F1E8D2',
  plov: '#E9B868',
  bread: '#F0D3A0',
  noodles: '#EBD49C',
  potato: '#F0D488',
  buckwheat: '#9A6A3E',
  salad: '#E9F0DD',
  greens: '#CFE3C0',
  stewedVeg: '#E9A066',
  meat: '#9C5A37',
  chicken: '#E2AE72',
  egg: '#FFF8E8',
  beans: '#B65B45',
  lentils: '#E59A52',
  chickpeas: '#EBCB8B',
  fish: '#F4DCC2',
  yogurt: '#FBF8F1',
  cheese: '#FFF7E1',
  fruit: '#F6E7D6',
  nuts: '#D9B98E',
  mung: '#B9C67E',
};

export const FOOD_SWATCH: Record<FoodKey, string> = {
  ...BASE,
  rice: '#E3D5B1',
  salad: '#7DB36A',
  greens: '#5E9E58',
  egg: '#F2B53A',
  yogurt: '#E7E1D3',
  cheese: '#F3DFA7',
  fruit: '#E2604A',
  fish: '#E9B998',
};

const BROTH: Record<Broth, string> = {
  shurpa: '#D9A15E',
  moshkhurda: '#CDAE68',
  mastava: '#D8794D',
  lentil: '#E7A04F',
  lagman: '#C9653F',
};

function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function seedOf(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h) + 7;
}

/** One small illustrated food piece. */
function Piece({ food, x, y, rot, k }: { food: FoodKey; x: number; y: number; rot: number; k: number }) {
  const t = `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)})`;
  switch (food) {
    case 'rice':
      return <ellipse transform={t} rx={2.4} ry={1.1} fill={k % 3 ? '#FFFDF6' : '#E8DCC0'} />;
    case 'plov':
      return k % 4 === 0 ? (
        <rect transform={t} x={-4} y={-0.9} width={8} height={1.8} rx={0.9} fill="#E2722F" />
      ) : k % 9 === 1 ? (
        <circle transform={t} r={2.2} fill="#E6C27F" stroke="#C99E55" strokeWidth={0.5} />
      ) : (
        <ellipse transform={t} rx={2.4} ry={1.1} fill={k % 2 ? '#F7DBA3' : '#F3CC86'} />
      );
    case 'bread':
      return <circle transform={t} r={1.1} fill="#B8783A" opacity={0.75} />;
    case 'noodles':
      return <path transform={t} d="M-7 0 q3.5 -3 7 0 t7 0" stroke="#F7E7BC" strokeWidth={1.8} fill="none" strokeLinecap="round" />;
    case 'potato':
      return <rect transform={t} x={-3.2} y={-3.2} width={6.4} height={6.4} rx={1.8} fill={k % 2 ? '#F6DE97' : '#EBCB72'} />;
    case 'buckwheat':
      return <path transform={t} d="M0 -1.8 L1.7 1.2 L-1.7 1.2 Z" fill={k % 2 ? '#7A4E2B' : '#B07F4E'} />;
    case 'salad':
    case 'greens': {
      const v = food === 'greens' ? k % 3 : k % 5;
      if (v === 0 || v === 3)
        return <path transform={t} d="M0 -6 C4 -3 4 3 0 6 C-4 3 -4 -3 0 -6Z" fill={k % 2 ? '#5E9E58' : '#7DB36A'} />;
      if (v === 1)
        return (
          <g transform={t}>
            <circle r={4.4} fill="#E2553F" />
            <circle r={3.2} fill="#F07A60" />
            <circle r={0.7} cx={1.2} cy={0.6} fill="#FBD9A0" />
            <circle r={0.7} cx={-1.1} cy={-0.8} fill="#FBD9A0" />
          </g>
        );
      if (v === 2)
        return (
          <g transform={t}>
            <circle r={4} fill="#79AE5C" />
            <circle r={3} fill="#D7EBC2" />
          </g>
        );
      return <circle transform={t} r={3.6} fill="none" stroke="#F3E9F2" strokeWidth={1.2} />;
    }
    case 'stewedVeg': {
      const v = k % 4;
      if (v === 0) return <circle transform={t} r={3.4} fill="#EA7A2F" stroke="#F5A15E" strokeWidth={1} />;
      if (v === 1) return <rect transform={t} x={-4} y={-1.4} width={8} height={2.8} rx={1.4} fill="#C9432F" />;
      if (v === 2) return <rect transform={t} x={-3} y={-3} width={6} height={6} rx={1.6} fill="#F2D27A" />;
      return <rect transform={t} x={-4.5} y={-1.1} width={9} height={2.2} rx={1.1} fill="#6DA04F" />;
    }
    case 'meat':
      return (
        <g transform={t}>
          <rect x={-5} y={-4} width={10} height={8} rx={3} fill="#7A4123" />
          <rect x={-3.5} y={-2.8} width={5} height={2} rx={1} fill="#A8673F" />
        </g>
      );
    case 'chicken':
      return (
        <g transform={t}>
          <rect x={-6} y={-4} width={12} height={8} rx={3.5} fill="#D79C5E" />
          <path d="M-3 -3 L-1 3 M1 -3 L3 3" stroke="#8E5A2B" strokeWidth={1.1} strokeLinecap="round" />
        </g>
      );
    case 'egg':
      return (
        <g transform={t}>
          <path d="M-7 0 C-7 -6 -1 -7 3 -5 C8 -3 7 5 2 6 C-3 7 -7 4 -7 0Z" fill="#FFFFFF" stroke="#F0E6D2" strokeWidth={0.6} />
          <circle r={3.2} cx={-0.4} cy={0} fill="#F2B53A" />
          <circle r={1} cx={-1.4} cy={-1} fill="#FAD47A" />
        </g>
      );
    case 'beans':
      return <ellipse transform={t} rx={3.4} ry={2} fill={k % 4 === 0 ? '#EFE5CF' : '#8E3A2B'} />;
    case 'lentils':
      return <circle transform={t} r={1.5} fill={k % 2 ? '#F0B06B' : '#D9823D'} />;
    case 'mung':
      return <ellipse transform={t} rx={2.2} ry={1.5} fill={k % 3 ? '#6E8F3A' : '#93AE55'} />;
    case 'chickpeas':
      return (
        <g transform={t}>
          <circle r={3} fill="#E3BE78" />
          <circle r={1.2} cx={-0.9} cy={-0.9} fill="#F3D9A3" />
        </g>
      );
    case 'fish':
      return (
        <g transform={t}>
          <path d="M-10 -4 C-4 -8 6 -6 10 -2 C8 3 0 6 -8 4 Z" fill="#F2CFAE" />
          <path d="M-4 -4 L-2 3 M1 -4 L3 3 M5 -3 L6 2" stroke="#E3A982" strokeWidth={0.9} />
          <circle r={1.6} cx={7} cy={-5} fill="#F4E06B" />
        </g>
      );
    case 'yogurt':
      return k % 3 === 0 ? (
        <circle transform={t} r={0.9} fill="#6DA04F" />
      ) : (
        <path transform={t} d="M-5 0 C-5 -4 4 -4 4 0 C4 3 -2 3 -2 0" stroke="#EDE5D4" strokeWidth={1.4} fill="none" strokeLinecap="round" />
      );
    case 'cheese':
      return <rect transform={t} x={-3.4} y={-3.4} width={6.8} height={6.8} rx={1.2} fill="#FFFDF4" stroke="#EADCB4" strokeWidth={0.8} />;
    case 'fruit': {
      const c = ['#E2604A', '#F29E3D', '#8B4A8F', '#D9415C'][k % 4];
      return (
        <g transform={t}>
          <circle r={3.6} fill={c} />
          <circle r={1} cx={-1.2} cy={-1.2} fill="#FFFFFF" opacity={0.45} />
        </g>
      );
    }
    case 'nuts':
      return (
        <g transform={t}>
          <path d="M-4 0 C-4 -4 4 -4 4 0 C4 4 -4 4 -4 0Z" fill="#A9733F" />
          <path d="M0 -3 V3 M-2 -2 C-1 0 -1 0 -2 2 M2 -2 C1 0 1 0 2 2" stroke="#7D5128" strokeWidth={0.7} fill="none" />
        </g>
      );
    default:
      return null;
  }
}

const DENSITY: Partial<Record<FoodKey, number>> = {
  rice: 140, plov: 120, bread: 30, lentils: 110, buckwheat: 120, mung: 90,
  salad: 26, greens: 22, stewedVeg: 26, beans: 30, chickpeas: 26, fruit: 14, nuts: 10,
  meat: 12, chicken: 9, egg: 4, fish: 3, potato: 16, noodles: 16, yogurt: 10, cheese: 12,
};

function wedgePath(cx: number, cy: number, r: number, a0: number, a1: number) {
  const p = (a: number) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${cx} ${cy} L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

function SideIllustration({ kind, cx, cy, r }: { kind: SideKey; cx: number; cy: number; r: number }) {
  switch (kind) {
    case 'non':
      return (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="#C98A47" />
          <circle cx={cx} cy={cy} r={r * 0.62} fill="#E2B475" />
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={cx + Math.cos(a) * r * 0.36} cy={cy + Math.sin(a) * r * 0.36} r={0.9} fill="#A86C33" />;
          })}
          <circle cx={cx} cy={cy} r={1.3} fill="#A86C33" />
        </g>
      );
    case 'salad':
      return (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke="#E7E3D8" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={r * 0.78} fill="#F5E9E2" />
          <circle cx={cx - 5} cy={cy - 3} r={5} fill="#E2553F" />
          <circle cx={cx - 5} cy={cy - 3} r={3.6} fill="#F07A60" />
          <circle cx={cx + 5} cy={cy + 3} r={4.6} fill="#E2553F" />
          <circle cx={cx + 5} cy={cy + 3} r={3.2} fill="#F07A60" />
          <circle cx={cx + 3} cy={cy - 6} r={3.4} fill="none" stroke="#FFFFFF" strokeWidth={1.2} />
          <path d={`M${cx - 6} ${cy + 6} c3 -3 5 -1 7 -4`} stroke="#5E9E58" strokeWidth={2} strokeLinecap="round" fill="none" />
        </g>
      );
    case 'tea':
      return (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke="#E7E3D8" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={r * 0.82} fill="none" stroke="#2D775C" strokeWidth={1.2} strokeDasharray="2 3" />
          <circle cx={cx} cy={cy} r={r * 0.62} fill="#C9A24C" />
          <circle cx={cx - 3} cy={cy - 3} r={2.4} fill="#E2C46F" opacity={0.7} />
        </g>
      );
    case 'yogurt':
    case 'ayran':
      return (
        <g>
          <circle cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke="#E7E3D8" strokeWidth={1.5} />
          <circle cx={cx} cy={cy} r={r * 0.74} fill="#F7F3EA" />
          <path d={`M${cx - 6} ${cy} c0 -5 10 -5 10 0 c0 3 -5 3 -5 0`} stroke="#E6DDCB" strokeWidth={1.5} fill="none" />
          {kind === 'ayran' && <circle cx={cx + 5} cy={cy + 4} r={1.2} fill="#5E9E58" />}
        </g>
      );
    case 'fruit':
      return (
        <g>
          <circle cx={cx - 5} cy={cy + 2} r={8} fill="#E2604A" />
          <circle cx={cx + 6} cy={cy - 3} r={7} fill="#F29E3D" />
          <path d={`M${cx - 5} ${cy - 6} q2 -4 5 -4`} stroke="#5E9E58" strokeWidth={2} fill="none" strokeLinecap="round" />
        </g>
      );
  }
}

interface PlateVizProps {
  spec: PlateSpec;
  seedKey: string;
  size?: number;
  showSides?: boolean;
  title?: string;
}

export function PlateViz({ spec, seedKey, size = 220, showSides = true, title }: PlateVizProps) {
  const uid = useId().replace(/:/g, '');
  const sides = showSides ? (spec.sides ?? []).slice(0, 3) : [];
  const W = sides.length ? 268 : 200;
  const H = 200;
  const cx = 100;
  const cy = 100;
  const rimR = 90;
  const foodR = spec.type === 'bowl' ? 68 : 74;
  const rand = rng(seedOf(seedKey));

  const pieces: ReactElement[] = [];
  const wedges: ReactElement[] = [];

  if (spec.type === 'plate') {
    let a = -Math.PI / 2;
    spec.parts.forEach((part, pi) => {
      const a1 = a + part.share * Math.PI * 2;
      const clip = `${uid}-w${pi}`;
      const d = wedgePath(cx, cy, foodR, a, a1);
      const n = Math.round((DENSITY[part.food] ?? 20) * part.share * 2.2);
      const items: ReactElement[] = [];
      for (let i = 0; i < n; i++) {
        const ang = a + rand() * (a1 - a);
        const rr = Math.sqrt(rand()) * (foodR - 4);
        items.push(
          <Piece key={i} food={part.food} k={i} x={cx + Math.cos(ang) * rr} y={cy + Math.sin(ang) * rr} rot={rand() * 360} />,
        );
      }
      wedges.push(
        <g key={pi}>
          <clipPath id={clip}>
            <path d={d} />
          </clipPath>
          <path d={d} fill={BASE[part.food]} />
          <g clipPath={`url(#${clip})`}>{items}</g>
        </g>,
      );
      a = a1;
    });
  } else {
    // Bowl: ingredients float in a broth (or yogurt) in proportion to their share.
    spec.parts.forEach((part, pi) => {
      const n = Math.max(3, Math.round((DENSITY[part.food] ?? 20) * part.share * 1.6));
      for (let i = 0; i < n; i++) {
        const ang = rand() * Math.PI * 2;
        const rr = Math.sqrt(rand()) * (foodR - 7);
        pieces.push(
          <Piece key={`${pi}-${i}`} food={part.food} k={i} x={cx + Math.cos(ang) * rr} y={cy + Math.sin(ang) * rr} rot={rand() * 360} />,
        );
      }
    });
  }

  const sidePos = sides.map((_, i) => ({ cx: 236, cy: sides.length === 1 ? 150 : 52 + i * (sides.length === 2 ? 96 : 64), r: sides.length === 3 ? 25 : 28 }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={size * (W / 200)}
      height={size}
      role="img"
      aria-label={title ?? 'Meal composition illustration'}
      style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
    >
      <defs>
        <radialGradient id={`${uid}-rim`} cx="45%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1EEE6" />
        </radialGradient>
        <filter id={`${uid}-sh`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#193A32" floodOpacity="0.14" />
        </filter>
        <clipPath id={`${uid}-bowl`}>
          <circle cx={cx} cy={cy} r={foodR} />
        </clipPath>
      </defs>

      {/* plate / bowl */}
      <circle cx={cx} cy={cy} r={rimR} fill={`url(#${uid}-rim)`} filter={`url(#${uid}-sh)`} />
      {spec.type === 'bowl' ? (
        <>
          <circle cx={cx} cy={cy} r={rimR - 4} fill="none" stroke="#2D775C" strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="1 5" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r={foodR + 3} fill="#E9E4D8" />
          <circle cx={cx} cy={cy} r={foodR} fill={spec.broth ? BROTH[spec.broth] : '#FBF8F1'} />
          <circle cx={cx - 18} cy={cy - 20} r={foodR * 0.55} fill="#FFFFFF" opacity={0.12} />
          <g clipPath={`url(#${uid}-bowl)`}>{pieces}</g>
        </>
      ) : (
        <>
          <circle cx={cx} cy={cy} r={foodR + 6} fill="#FFFFFF" stroke="#ECE8DD" strokeWidth={1} />
          {wedges}
          {spec.parts.length > 1 &&
            spec.parts.reduce<{ a: number; els: ReactElement[] }>(
              (acc, part, i) => {
                const x = cx + Math.cos(acc.a) * foodR;
                const y = cy + Math.sin(acc.a) * foodR;
                acc.els.push(<line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#FFFFFF" strokeWidth={2.2} />);
                acc.a += part.share * Math.PI * 2;
                return acc;
              },
              { a: -Math.PI / 2, els: [] },
            ).els}
        </>
      )}

      {sides.map((s, i) => (
        <g key={s} filter={`url(#${uid}-sh)`}>
          <SideIllustration kind={s} {...sidePos[i]} />
        </g>
      ))}
    </svg>
  );
}

export const SIDE_LABEL: Record<SideKey, string> = {
  non: 'Non bread',
  salad: 'Side salad',
  yogurt: 'Yogurt',
  tea: 'Green tea',
  fruit: 'Fruit',
  ayran: 'Ayran',
};

export function shareLabel(share: number) {
  if (share >= 0.45) return '≈ ½';
  if (share >= 0.3) return '≈ ⅓';
  if (share >= 0.2) return '≈ ¼';
  return 'small';
}
