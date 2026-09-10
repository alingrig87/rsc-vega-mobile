import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { buildSparklineSpec } from '../mobileCharts';
import { Panel } from './shared/Panel';
import { usePalette } from './shared/palettes';
import { ADOBE_CLEAN_FONT } from '../spectrumVegaTheme';

interface BigNumberProps {
  label: string;
  value: string;
  isDark?: boolean;
  color?: string;
  trend?: { x: string; y: number }[];
}

/** RSC's `<BigNumber>` isn't a chart mark either — a styled number/label with an optional sparkline (a `<Line>` child). Matches that split: plain HTML for the number, the existing Vega-Lite sparkline builder for the trend. */
export function BigNumber({ label, value, isDark = false, color, trend }: BigNumberProps) {
  const { palette } = usePalette();
  const resolvedColor = color ?? palette.colors[0];
  return (
    <Panel isDark={isDark}>
      <div style={{ fontFamily: ADOBE_CLEAN_FONT }}>
        <div style={{ fontSize: 13, color: isDark ? '#999' : '#666', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 30, fontWeight: 700, color: isDark ? '#eee' : '#1a1a2e' }}>{value}</div>
      </div>
      {trend && (
        <div style={{ marginTop: 8 }}>
          <ResponsiveVegaLiteChart spec={buildSparklineSpec(trend, 'x', 'y', resolvedColor)} aspectRatio={0.3} minHeight={50} enableTapDetail={false} />
        </div>
      )}
    </Panel>
  );
}
