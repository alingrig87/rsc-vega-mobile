import { useContainerWidth } from '../useContainerWidth';
import { Panel } from './shared/Panel';
import { Legend } from '../Legend';
import { computeSegments, describeDonutSegment, polarToCartesian } from './shared/geometry';
import { usePalette } from './shared/palettes';
import { ADOBE_CLEAN_FONT } from '../spectrumVegaTheme';

export interface DonutDatum {
  label: string;
  value: number;
}

interface DonutProps {
  title?: string;
  data: DonutDatum[];
  isDark?: boolean;
  holeRatio?: number;
  aspectRatio?: number;
  colors?: string[];
}

const LEADER_GAP = 6;
const LEADER_LENGTH = 14;
const LABEL_GAP = 6;

/**
 * A donut with percentage labels *outside* the ring, each on its own thin
 * leader line — the layout in the reference screenshot, and a genuinely
 * better answer to a problem `mobileCharts.ts`'s `buildDonutSummarySpec`
 * only partially solved: inline labels on a small/crowded segment have
 * nowhere to go without colliding with a neighbor, so that component drops
 * them below a size threshold. External labels have the whole margin
 * around the ring to spread into instead.
 *
 * Plain SVG, not Vega-Lite — a leader line from an arc's midpoint to an
 * external label has no native Vega-Lite mark, and this project already
 * hit enough confirmed Vega-Lite sizing/positioning bugs building the
 * arc-based charts in `mobileCharts.ts` that hand-computing the geometry
 * once (see `shared/geometry.ts`) was the more reliable path.
 */
export function Donut({ title, data, isDark = false, holeRatio = 0.6, aspectRatio = 0.85, colors }: DonutProps) {
  const { ref, width } = useContainerWidth();
  const { palette } = usePalette();
  const activeColors = colors ?? palette.colors;
  const height = width > 0 ? Math.round(width * aspectRatio) : 220;

  // reserve room on every side for the external labels + leader lines,
  // then fit the ring in whatever's left — same "reserve chrome space,
  // then size the ring off the remainder" idea as mobileCharts.ts's donut,
  // just reserving a margin on all four sides instead of one.
  const labelMargin = Math.max(44, Math.round(width * 0.16));
  const plotSize = Math.min(width - labelMargin * 2, height);
  const outerRadius = Math.max(plotSize / 2, 30);
  const innerRadius = outerRadius * holeRatio;
  const cx = width / 2;
  const cy = height / 2;

  const segments = width > 0 ? computeSegments(data, (d) => d.value) : [];
  const legendEntries = data.map((d, i) => ({ label: d.label, value: d.value, color: activeColors[i % activeColors.length] }));

  return (
    <Panel title={title} isDark={isDark}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div ref={ref} style={{ flex: '1 1 0', minWidth: 0 }}>
          {width > 0 && (
            <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
              {segments.map((seg, i) => {
                const color = activeColors[i % activeColors.length];
                const leaderStart = polarToCartesian(cx, cy, outerRadius + LEADER_GAP, seg.midAngle);
                const leaderEnd = polarToCartesian(cx, cy, outerRadius + LEADER_GAP + LEADER_LENGTH, seg.midAngle);
                const onRight = Math.sin(seg.midAngle) >= 0;
                const labelX = leaderEnd.x + (onRight ? LABEL_GAP : -LABEL_GAP);
                const pct = `${Math.round(seg.fraction * 100 * 100) / 100}%`;
                return (
                  <g key={seg.datum.label}>
                    <path d={describeDonutSegment(cx, cy, innerRadius, outerRadius, seg.startAngle, seg.endAngle)} fill={color} stroke={isDark ? '#1a1d24' : '#fff'} strokeWidth={2} />
                    <line x1={leaderStart.x} y1={leaderStart.y} x2={leaderEnd.x} y2={leaderEnd.y} stroke={isDark ? '#888' : '#aaa'} strokeWidth={1} />
                    <text
                      x={labelX}
                      y={leaderEnd.y}
                      textAnchor={onRight ? 'start' : 'end'}
                      dominantBaseline="middle"
                      fontFamily={ADOBE_CLEAN_FONT}
                      fontSize={12}
                      fill={isDark ? '#ddd' : '#333'}
                    >
                      {pct}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>
        <div style={{ flex: '0 0 auto', maxWidth: '38%', minWidth: 0 }}>
          <Legend entries={legendEntries} isDark={isDark} layout="right" />
        </div>
      </div>
    </Panel>
  );
}
