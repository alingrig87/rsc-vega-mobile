import type { VisualizationSpec } from 'vega-embed';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { Panel } from './shared/Panel';
import { useOrientation } from './shared/useOrientation';
import { usePalette } from './shared/palettes';

export interface ScatterDatum {
  x: number;
  y: number;
  series: string;
}

interface ScatterProps {
  title?: string;
  data: ScatterDatum[];
  xLabel?: string;
  yLabel?: string;
  isDark?: boolean;
  colors?: string[];
}

function buildScatterSpec(data: ScatterDatum[], xLabel: string, yLabel: string): VisualizationSpec {
  return {
    data: { values: data },
    mark: { type: 'point', filled: true, size: 130 },
    encoding: {
      x: { field: 'x', type: 'quantitative', title: xLabel, axis: { domain: true, labelAngle: 0 } },
      y: { field: 'y', type: 'quantitative', title: yLabel, axis: { domain: true } },
      color: { field: 'series', type: 'nominal', sort: null, legend: { title: null, orient: 'bottom', labelFontSize: 11 } },
      tooltip: [
        { field: 'series', type: 'nominal' },
        { field: 'x', type: 'quantitative' },
        { field: 'y', type: 'quantitative' },
      ],
    },
  };
}

/**
 * A scatter plot's whole point is seeing spread and correlation along x —
 * exactly the dimension a portrait phone has the least of. Rather than a
 * CSS rotation trick (fragile, and doesn't actually give the browser more
 * pixels to lay the chart out in), this widens its own aspect ratio and
 * surfaces a "rotate for a wider view" hint when `useOrientation()` reports
 * portrait; turning the phone sideways gives `ResponsiveVegaLiteChart`'s
 * own ResizeObserver a genuinely wider container to measure, which is what
 * actually improves the reading, not a transform layered on the same
 * number of pixels.
 */
export function Scatter({ title, data, xLabel = 'X', yLabel = 'Y', isDark = false, colors }: ScatterProps) {
  const orientation = useOrientation();
  const { palette } = usePalette();
  const activeColors = colors ?? palette.colors;
  const aspectRatio = orientation === 'landscape' ? 0.45 : 0.85;

  return (
    <Panel isDark={isDark}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        {title && <div style={{ fontSize: 15, fontWeight: 600, color: isDark ? '#eee' : '#3a2f1c' }}>{title}</div>}
        {orientation === 'portrait' && (
          <span style={{ fontSize: 11, color: isDark ? '#999' : '#888', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span aria-hidden>↻</span> Rotate for a wider view
          </span>
        )}
      </div>
      <ResponsiveVegaLiteChart
        spec={buildScatterSpec(data, xLabel, yLabel)}
        aspectRatio={aspectRatio}
        colorScheme={isDark ? 'dark' : 'light'}
        colors={activeColors}
      />
    </Panel>
  );
}
