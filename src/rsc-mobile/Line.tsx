import type { VisualizationSpec } from 'vega-embed';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { Panel } from './shared/Panel';
import { usePalette } from './shared/palettes';

export interface SeriesDatum {
  x: string;
  y: number;
  series: string;
}

interface LineProps {
  title?: string;
  data: SeriesDatum[];
  yLabel?: string;
  isDark?: boolean;
  colors?: string[];
  /** Fills the area under the line when true — the same spec shape otherwise, matching how close `<Line>`/`<Area>` are in RSC itself. */
  filled?: boolean;
}

function buildLineSpec(data: SeriesDatum[], yLabel: string | undefined, filled: boolean): VisualizationSpec {
  // angled for the same reason as Bar.tsx's baselineAxis — see its comment
  const baselineAxis = { labelAngle: -40, labelAlign: 'right' as const, domain: true };
  if (!filled) {
    return {
      data: { values: data },
      mark: 'line',
      encoding: {
        x: { field: 'x', type: 'ordinal', title: null, axis: baselineAxis },
        y: { field: 'y', type: 'quantitative', title: yLabel ?? null },
        // a line's own legend swatch is stroke-only (hollow) by default — pairing a fill channel on the same field makes it a solid swatch like every other Spectrum legend symbol (same trick as the desktop project's lineSpec)
        stroke: { field: 'series', type: 'nominal', sort: null, legend: null },
        fill: { field: 'series', type: 'nominal', sort: null, legend: { title: null, orient: 'bottom', labelFontSize: 11 } },
      },
    };
  }
  const seriesOrder = [...new Set(data.map((d) => d.series))];
  const orderExpr = `{${seriesOrder.map((s, i) => `'${s}':${i}`).join(',')}}[datum.series]`;
  return {
    data: { values: data },
    transform: [{ calculate: orderExpr, as: '__order' }],
    mark: { type: 'area', line: true, opacity: 0.8 },
    encoding: {
      x: { field: 'x', type: 'ordinal', title: null, axis: baselineAxis },
      y: { field: 'y', type: 'quantitative', title: yLabel ?? null, stack: 'zero' },
      order: { field: '__order', type: 'quantitative' },
      color: { field: 'series', type: 'nominal', sort: null, legend: { title: null, orient: 'bottom', labelFontSize: 11 } },
    },
  };
}

export function Line({ title, data, yLabel, isDark = false, colors, filled = false }: LineProps) {
  const { palette } = usePalette();
  return (
    <Panel title={title} isDark={isDark}>
      {/* overflowMargin — see Bar.tsx's comment / ResponsiveVegaLiteChart's own doc comment */}
      <ResponsiveVegaLiteChart spec={buildLineSpec(data, yLabel, filled)} aspectRatio={0.62} colorScheme={isDark ? 'dark' : 'light'} colors={colors ?? palette.colors} overflowMargin={34} />
    </Panel>
  );
}
