import type { VisualizationSpec } from 'vega-embed';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { Panel } from './shared/Panel';
import { usePalette } from './shared/palettes';

export interface ComboDatum {
  x: string;
  bar: number;
  line: number;
}

interface ComboProps {
  title?: string;
  data: ComboDatum[];
  barLabel?: string;
  lineLabel?: string;
  isDark?: boolean;
  barColor?: string;
  lineColor?: string;
}

function buildComboSpec(data: ComboDatum[], barLabel: string | undefined, lineLabel: string | undefined, barColor: string, lineColor: string): VisualizationSpec {
  // Both layers share the exact same x-axis definition (title/axis object,
  // not just an "equivalent" one) — a real bug this project hit building
  // buildLineCalloutSpec in mobileCharts.ts: mismatched axis declarations
  // across layers sharing a channel made the compiled view's height signal
  // resolve to 0, collapsing every mark to the same position.
  // angled for the same reason as Bar.tsx's baselineAxis — see its comment
  const x = { field: 'x', type: 'ordinal' as const, title: null, axis: { labelAngle: -40, labelAlign: 'right' as const, domain: true } };
  return {
    data: { values: data },
    resolve: { scale: { y: 'independent' } },
    layer: [
      {
        mark: { type: 'bar', color: barColor },
        encoding: { x, y: { field: 'bar', type: 'quantitative', title: barLabel ?? null } },
      },
      {
        mark: { type: 'line', color: lineColor, strokeWidth: 2.5, point: true },
        encoding: { x, y: { field: 'line', type: 'quantitative', title: lineLabel ?? null, axis: { orient: 'right' } } },
      },
    ],
  };
}

/** Bar + line sharing one x-axis with independent y-scales — RSC's alpha `<Combo>`. */
export function Combo({ title, data, barLabel, lineLabel, isDark = false, barColor, lineColor }: ComboProps) {
  const { palette } = usePalette();
  const resolvedBarColor = barColor ?? palette.colors[0];
  const resolvedLineColor = lineColor ?? palette.colors[1];
  return (
    <Panel title={title} isDark={isDark}>
      {/* overflowMargin — both the angled x-axis label and the
          right-oriented secondary y-axis's tick labels lean/extend past
          the chart's own measured box; see Bar.tsx / ResponsiveVegaLiteChart's own doc comment */}
      <ResponsiveVegaLiteChart
        spec={buildComboSpec(data, barLabel, lineLabel, resolvedBarColor, resolvedLineColor)}
        aspectRatio={0.62}
        colorScheme={isDark ? 'dark' : 'light'}
        overflowMargin={28}
      />
    </Panel>
  );
}
