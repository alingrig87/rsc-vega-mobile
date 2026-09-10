import { useContainerWidth } from '../useContainerWidth';
import { Panel } from './shared/Panel';
import { usePalette } from './shared/palettes';
import { ADOBE_CLEAN_FONT } from '../spectrumVegaTheme';

export interface FunnelStage {
  label: string;
  value: number;
}

interface FunnelProps {
  title?: string;
  data: FunnelStage[];
  isDark?: boolean;
  colors?: string[];
  /** Pre-formatted value text, e.g. "1,045". Falls back to the raw number. */
  format?: (value: number) => string;
  aspectRatio?: number;
}

/**
 * A smooth continuous taper — trapezoid bands stitched stage-to-stage, not
 * stepped bars — with the value inside each band and a conversion-rate
 * badge on a leader line outside it. No native Vega-Lite mark for this
 * shape either way (see `charts.ts`/`funnelVariants.ts` in the desktop
 * project, which explored the same "no funnel mark" problem for a
 * stepped-bar reading); the label placement here reuses the same
 * leader-line idea as `Donut.tsx` instead of the desktop project's inline
 * approach, since external labels are what this reference style calls for.
 */
export function Funnel({ title, data, isDark = false, colors, format = (v) => v.toLocaleString(), aspectRatio = 0.95 }: FunnelProps) {
  const { ref, width } = useContainerWidth();
  const { palette } = usePalette();
  const activeColors = colors ?? palette.colors;

  const labelColumn = Math.max(70, Math.round(width * 0.22));
  const plotWidth = Math.max(width - labelColumn, 40);
  const height = width > 0 ? Math.round(width * aspectRatio) : 260;
  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const stageHeight = height / data.length;
  const maxBandWidth = plotWidth * 0.94;

  const widthFor = (value: number) => Math.max((value / maxValue) * maxBandWidth, maxBandWidth * 0.12);

  return (
    <Panel title={title} isDark={isDark}>
      <div ref={ref} style={{ width: '100%' }}>
        {width > 0 && (
          <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block', overflow: 'visible' }}>
            {data.map((stage, i) => {
              const color = activeColors[i % activeColors.length];
              const topWidth = widthFor(stage.value);
              const nextValue = i < data.length - 1 ? data[i + 1].value : stage.value * 0.72;
              const bottomWidth = widthFor(nextValue);
              const yTop = i * stageHeight;
              const yBottom = yTop + stageHeight;
              const cx = plotWidth / 2;
              const path = [
                `M ${cx - topWidth / 2} ${yTop}`,
                `L ${cx + topWidth / 2} ${yTop}`,
                `L ${cx + bottomWidth / 2} ${yBottom}`,
                `L ${cx - bottomWidth / 2} ${yBottom}`,
                'Z',
              ].join(' ');
              const midY = yTop + stageHeight / 2;
              const pct = i === 0 ? 100 : Math.round((stage.value / data[0].value) * 1000) / 10;
              const leaderStart = { x: cx + Math.max(topWidth, bottomWidth) / 2, y: midY };
              const leaderBend = { x: plotWidth + 10, y: midY };
              return (
                <g key={stage.label}>
                  <path d={path} fill={color} />
                  <text x={cx} y={midY - 6} textAnchor="middle" fontFamily={ADOBE_CLEAN_FONT} fontSize={12} fontWeight="bold" fill="#fff">
                    {format(stage.value)}
                  </text>
                  <text x={cx} y={midY + 10} textAnchor="middle" fontFamily={ADOBE_CLEAN_FONT} fontSize={10} fill="rgba(255,255,255,0.85)">
                    {stage.label}
                  </text>
                  <line x1={leaderStart.x} y1={leaderStart.y} x2={leaderBend.x} y2={leaderBend.y} stroke={isDark ? '#888' : '#aaa'} strokeWidth={1} />
                  <circle cx={leaderBend.x} cy={leaderBend.y} r={2.5} fill={isDark ? '#888' : '#aaa'} />
                  <text x={leaderBend.x + 8} y={leaderBend.y} textAnchor="start" dominantBaseline="middle" fontFamily={ADOBE_CLEAN_FONT} fontSize={12} fill={isDark ? '#ddd' : '#333'}>
                    {pct}%
                  </text>
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </Panel>
  );
}
