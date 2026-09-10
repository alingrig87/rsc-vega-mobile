import type { VisualizationSpec } from 'vega-embed';
import { ResponsiveVegaLiteChart } from '../ResponsiveVegaLiteChart';
import { Panel } from './shared/Panel';
import { usePalette } from './shared/palettes';

export interface BulletDatum {
  category: string;
  current: number;
  target: number;
}

interface BulletProps {
  title?: string;
  data: BulletDatum[];
  isDark?: boolean;
  color?: string;
}

function buildBulletSpec(data: BulletDatum[], color: string): VisualizationSpec {
  // RSC's real <Bullet> draws no quantitative axis at all — and both layers
  // need `axis: null` on *both* channels, not just the ones that visibly
  // needed it, or the mismatch itself can break the compiled view (the
  // same class of bug documented at length in mobileCharts.ts's
  // buildLineCalloutSpec comment).
  const x = { field: 'current', type: 'quantitative' as const, axis: null };
  const xTarget = { field: 'target', type: 'quantitative' as const, axis: null };
  const y = { field: 'category', type: 'nominal' as const, sort: null, title: null, axis: { domain: false, ticks: false, grid: false, labelLimit: 90 } };
  return {
    data: { values: data },
    layer: [
      { mark: { type: 'bar', cornerRadiusTopRight: 4, cornerRadiusBottomRight: 4, height: 14, color }, encoding: { y, x } },
      { mark: { type: 'tick', thickness: 2, size: 26, color: 'black' }, encoding: { y, x: xTarget } },
    ],
  };
}

/** A rect + tick replica of RSC's alpha `<Bullet>` — no native Vega-Lite bullet mark, same as the desktop project's version. */
export function Bullet({ title, data, isDark = false, color }: BulletProps) {
  const { palette } = usePalette();
  return (
    <Panel title={title} isDark={isDark}>
      <ResponsiveVegaLiteChart spec={buildBulletSpec(data, color ?? palette.colors[0])} aspectRatio={0.55} colorScheme={isDark ? 'dark' : 'light'} />
    </Panel>
  );
}
