import type { BuildDiagram as BuildDiagramData, BuildLayer } from '../types';

interface BuildDiagramProps {
  diagram: BuildDiagramData;
  className?: string;
}

// Returns true when a fill color is dark enough to need a light label.
function isDark(hex: string): boolean {
  const h = hex.replace('#', '');
  if (h.length < 6) return false;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b < 140;
}

function NataDots({ x, width, y }: { x: number; width: number; y: number }) {
  const count = 6;
  const gap = width / (count + 1);
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <circle key={i} cx={x + gap * (i + 1)} cy={y} r={4} fill="#ffffff" opacity={0.92} />
      ))}
    </>
  );
}

// Straight-cup style (hot/iced coffee, chocolate, milk teas, matcha).
function CupDiagram({ diagram }: { diagram: BuildDiagramData }) {
  const W = 320;
  const H = 400;
  const cx = 90;
  const cw = 140;
  const top = diagram.hot ? 78 : 64;
  const bot = 372;
  const cupH = bot - top;
  const total = diagram.layers.reduce((sum, l) => sum + (l.size ?? 1), 0);

  let y = top;
  const bands = diagram.layers.map((layer: BuildLayer, i) => {
    const hh = (cupH * (layer.size ?? 1)) / total;
    const band = (
      <g key={i}>
        <rect x={cx} y={y} width={cw} height={hh + 0.5} fill={layer.color} />
        {layer.dots && <NataDots x={cx} width={cw} y={y + hh / 2} />}
        <text
          x={cx + cw / 2}
          y={y + hh / 2 + 6}
          textAnchor="middle"
          fontFamily="Helvetica, Arial, sans-serif"
          fontSize={18}
          fontWeight={700}
          fill={isDark(layer.color) ? '#ffffff' : '#2b1d12'}
        >
          {layer.label}
        </text>
      </g>
    );
    y += hh;
    return band;
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} role="img">
      {diagram.hot &&
        [0, 1, 2].map((i) => (
          <path
            key={i}
            d={`M${cx + 38 + i * 32} ${top - 12} q 10 -16 0 -30`}
            fill="none"
            stroke="#b9a890"
            strokeWidth={3}
            strokeLinecap="round"
          />
        ))}
      <clipPath id="cupClip">
        <rect x={cx} y={top} width={cw} height={cupH} rx={14} />
      </clipPath>
      <rect x={cx} y={top} width={cw} height={cupH} rx={14} fill="#ffffff" />
      <g clipPath="url(#cupClip)">{bands}</g>
      <rect x={cx} y={top} width={cw} height={cupH} rx={14} fill="none" stroke="#2b1d12" strokeWidth={3} />
    </svg>
  );
}

// Tapered fizz-style cup with side callouts (fizz, sunset, cloud drinks).
function TaperedDiagram({ diagram }: { diagram: BuildDiagramData }) {
  const W = 460;
  const H = 420;
  const txl = 80;
  const txr = 240;
  const ty = 92;
  const bxl = 96;
  const bxr = 224;
  const by = 360;
  const cupH = by - ty;
  const total = diagram.layers.reduce((sum, l) => sum + (l.size ?? 1), 0);

  // X edges of the trapezoid at a given y (for dots / callout anchoring)
  const edgeAt = (yy: number) => {
    const t = (yy - ty) / cupH;
    return { left: txl + (bxl - txl) * t, right: txr + (bxr - txr) * t };
  };

  let y = ty;
  const bands: React.ReactNode[] = [];
  const callouts: React.ReactNode[] = [];
  diagram.layers.forEach((layer, i) => {
    const hh = (cupH * (layer.size ?? 1)) / total;
    const midY = y + hh / 2;
    bands.push(<rect key={i} x={0} y={y} width={W} height={hh + 0.5} fill={layer.color} />);
    if (layer.dots) {
      const e = edgeAt(midY);
      bands.push(<NataDots key={`d${i}`} x={e.left + 6} width={e.right - e.left - 12} y={midY} />);
    }
    const anchor = edgeAt(midY).right;
    callouts.push(
      <g key={`c${i}`}>
        <line x1={anchor - 6} y1={midY} x2={300} y2={midY} stroke="#b3b3b3" strokeWidth={1.5} />
        <text x={306} y={midY + 5} fontFamily="Helvetica, Arial, sans-serif" fontSize={17} fill="#555">
          {layer.label}
        </text>
      </g>
    );
    y += hh;
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }} role="img">
      <ellipse cx={(txl + txr) / 2} cy={ty - 18} rx={(txr - txl) / 2 + 8} ry={11} fill="#f7fbff" stroke="#2b1d12" strokeWidth={3} />
      <clipPath id="fizzClip">
        <polygon points={`${txl},${ty} ${txr},${ty} ${bxr},${by} ${bxl},${by}`} />
      </clipPath>
      <g clipPath="url(#fizzClip)">{bands}</g>
      <polygon points={`${txl},${ty} ${txr},${ty} ${bxr},${by} ${bxl},${by}`} fill="none" stroke="#2b1d12" strokeWidth={3} />
      {callouts}
    </svg>
  );
}

export default function BuildDiagram({ diagram, className }: BuildDiagramProps) {
  if (!diagram?.layers?.length) return null;
  return (
    <div className={className}>
      {diagram.style === 'tapered' ? <TaperedDiagram diagram={diagram} /> : <CupDiagram diagram={diagram} />}
      {diagram.notes && diagram.notes.length > 0 && (
        <ul style={{ listStyle: 'none', margin: '4px 0 0', padding: '0 12px' }}>
          {diagram.notes.map((note, i) => (
            <li key={i} style={{ fontSize: 14, color: '#2b1d12', padding: '2px 0' }}>
              • {note}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
