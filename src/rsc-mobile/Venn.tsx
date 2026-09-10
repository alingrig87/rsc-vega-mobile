import { useContainerWidth } from '../useContainerWidth';
import { Panel } from './shared/Panel';
import { usePalette } from './shared/palettes';
import { ADOBE_CLEAN_FONT } from '../spectrumVegaTheme';

export interface VennSet {
  label: string;
  size: number;
}

interface VennProps {
  title?: string;
  setA: VennSet;
  setB: VennSet;
  intersection: number;
  isDark?: boolean;
  colors?: string[];
  aspectRatio?: number;
}

/**
 * A hand-placed two-circle approximation, same as the desktop project's
 * Venn replica — RSC's real alpha `<Venn>` computes a proportional-overlap
 * layout of its own, not something Vega-Lite (or a couple of manually
 * positioned SVG circles) actually solves for exact intersection area, so
 * this is illustrative sizing only, not a substitute for the real
 * component's math. Plain SVG for the same reason as `Donut`/`geometry.ts`:
 * this shape has no Vega-Lite mark to begin with.
 */
export function Venn({ title, setA, setB, intersection, isDark = false, colors, aspectRatio = 0.6 }: VennProps) {
  const { ref, width } = useContainerWidth();
  const { palette } = usePalette();
  const activeColors = colors ?? palette.colors;
  const height = width > 0 ? Math.round(width * aspectRatio) : 180;

  const pxPerUnitRadius = Math.max(width, 1) * 0.09;
  const r1 = Math.sqrt(setA.size / Math.PI) * pxPerUnitRadius;
  const r2 = Math.sqrt(setB.size / Math.PI) * pxPerUnitRadius;
  const overlapFraction = Math.min(0.85, intersection / Math.min(setA.size, setB.size));
  const distance = (r1 + r2) * (1 - overlapFraction * 0.9);
  const cx = width / 2;
  const cy = height / 2;

  return (
    <Panel title={title} isDark={isDark}>
      <div ref={ref} style={{ width: '100%' }}>
        {width > 0 && (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
            <circle cx={cx - distance / 2} cy={cy} r={r1} fill={activeColors[0]} opacity={0.6} />
            <circle cx={cx + distance / 2} cy={cy} r={r2} fill={activeColors[1]} opacity={0.6} />
            <text x={cx - distance / 2 - r1 * 0.3} y={cy - r1 - 8} textAnchor="middle" fontFamily={ADOBE_CLEAN_FONT} fontSize={13} fontWeight="bold" fill={isDark ? '#eee' : '#222'}>
              {setA.label}
            </text>
            <text x={cx + distance / 2 + r2 * 0.3} y={cy - r2 - 8} textAnchor="middle" fontFamily={ADOBE_CLEAN_FONT} fontSize={13} fontWeight="bold" fill={isDark ? '#eee' : '#222'}>
              {setB.label}
            </text>
            <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontFamily={ADOBE_CLEAN_FONT} fontSize={13} fontWeight="bold" fill="#fff">
              {intersection}
            </text>
          </svg>
        )}
      </div>
    </Panel>
  );
}
