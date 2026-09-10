import type { VisualizationSpec } from 'vega-embed';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { Panel } from './shared/Panel';
import { usePalette } from './shared/palettes';

export interface BarDatum {
  category: string;
  value: number;
  series?: string;
}

interface BarProps {
  title?: string;
  data: BarDatum[];
  /** `'simple'` — one bar per category. `'dodged'` — grouped bars, needs `series` on each datum. `'stacked'` — stacked bars, needs `series`. */
  type?: 'simple' | 'dodged' | 'stacked';
  yLabel?: string;
  isDark?: boolean;
  colors?: string[];
}

function buildBarSpec(data: BarDatum[], type: 'simple' | 'dodged' | 'stacked', yLabel?: string): VisualizationSpec {
  // Angled, not flat (RSC's own default) — a narrow phone card genuinely
  // doesn't have the horizontal room for 5 flat category labels without
  // Vega-Lite's `labelOverlap: true` (inherited from the shared Spectrum
  // config) silently dropping some to avoid collisions. Angling them lets
  // every label stay visible in the same width instead.
  const baselineAxis = { labelAngle: -40, labelAlign: 'right' as const, domain: true };
  if (type === 'simple') {
    return {
      data: { values: data },
      mark: 'bar',
      encoding: {
        x: { field: 'category', type: 'nominal', sort: null, title: null, axis: baselineAxis },
        y: { field: 'value', type: 'quantitative', title: yLabel ?? null },
      },
    };
  }
  if (type === 'dodged') {
    return {
      data: { values: data },
      mark: 'bar',
      encoding: {
        x: { field: 'category', type: 'nominal', sort: null, title: null, axis: baselineAxis },
        xOffset: { field: 'series', sort: null },
        y: { field: 'value', type: 'quantitative', title: yLabel ?? null },
        color: { field: 'series', type: 'nominal', sort: null, legend: { title: null, orient: 'bottom', labelFontSize: 11 } },
      },
    };
  }
  // stacked — RSC keeps series in data-arrival order (not Vega-Lite's default alphabetical one), same rule charts.ts documents at length
  const seriesOrder = [...new Set(data.map((d) => d.series))];
  const orderExpr = `{${seriesOrder.map((s, i) => `'${s}':${i}`).join(',')}}[datum.series]`;
  return {
    data: { values: data },
    transform: [{ calculate: orderExpr, as: '__order' }],
    mark: 'bar',
    encoding: {
      x: { field: 'category', type: 'nominal', sort: null, title: null, axis: baselineAxis },
      y: { field: 'value', type: 'quantitative', title: yLabel ?? null, stack: 'zero' },
      order: { field: '__order', type: 'quantitative' },
      color: { field: 'series', type: 'nominal', sort: null, legend: { title: null, orient: 'bottom', labelFontSize: 11 } },
    },
  };
}

export function Bar({ title, data, type = 'simple', yLabel, isDark = false, colors }: BarProps) {
  const { palette } = usePalette();
  return (
    <Panel title={title} isDark={isDark}>
      {/* overflowMargin: the last category's angled label leans further
          right than its own tick even with labelAlign: 'right' (measured
          ~19px past the chart's own box) — see ResponsiveVegaLiteChart's
          own doc comment for why a wrapper div's padding doesn't fix this
          (tried that first) and this prop does. */}
      <ResponsiveVegaLiteChart spec={buildBarSpec(data, type, yLabel)} aspectRatio={0.62} colorScheme={isDark ? 'dark' : 'light'} colors={colors ?? palette.colors} overflowMargin={34} />
    </Panel>
  );
}
