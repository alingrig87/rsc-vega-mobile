import type { VisualizationSpec } from 'vega-embed';
import { DEFAULT_DONUT_HOLE_RATIO, DEFAULT_DONUT_PAD_ANGLE } from './spectrumVegaTheme';
import { browserTrend, spend, regionSales } from './data';

// react-spectrum-charts keeps categories/series in the order they first
// appear in the data (no implicit alphabetical sort), unlike Vega-Lite's
// nominal-field default. `sort: null` matches that behavior — ported as-is
// from the desktop parity project, it's a data-fidelity rule, not a
// desktop-only one.
const encoding = {
  color: { field: 'browser', type: 'nominal', sort: null, legend: { title: 'Browser' } },
} as const;

const browserStackOrder = {
  calculate: "{'Chrome':0,'Safari':1,'Firefox':2,'Edge':3}[datum.browser]",
  as: 'stackOrder',
} as const;
const orderByStack = { field: 'stackOrder', type: 'quantitative' } as const;

const baselineAxis = { labelAngle: 0, domain: true } as const;

export const barSpec: VisualizationSpec = {
  data: { values: spend },
  mark: { type: 'bar' },
  encoding: {
    x: { field: 'category', type: 'nominal', sort: null, title: null, axis: baselineAxis },
    y: { field: 'value', type: 'quantitative', title: 'Spend ($k)' },
  },
};

export const dodgedBarSpec: VisualizationSpec = {
  data: { values: regionSales },
  mark: { type: 'bar' },
  encoding: {
    x: { field: 'quarter', type: 'nominal', sort: null, title: null, axis: baselineAxis },
    xOffset: { field: 'region', sort: null },
    y: { field: 'value', type: 'quantitative', title: 'Sales ($k)' },
    color: { field: 'region', type: 'nominal', sort: null, legend: { title: 'Region' } },
  },
};

export const stackedBarSpec: VisualizationSpec = {
  data: { values: browserTrend },
  transform: [browserStackOrder],
  mark: { type: 'bar' },
  encoding: {
    x: { field: 'month', type: 'ordinal', title: null, axis: baselineAxis },
    y: { field: 'share', type: 'quantitative', title: 'Share (%)', stack: 'zero' },
    order: orderByStack,
    ...encoding,
  },
};

export const lineSpec: VisualizationSpec = {
  data: { values: browserTrend },
  mark: { type: 'line' },
  encoding: {
    x: { field: 'month', type: 'ordinal', title: null, axis: baselineAxis },
    y: { field: 'share', type: 'quantitative', title: 'Share (%)' },
    stroke: { field: 'browser', type: 'nominal', sort: null, legend: null },
    fill: { field: 'browser', type: 'nominal', sort: null, legend: { title: 'Browser' } },
  },
};

export const areaSpec: VisualizationSpec = {
  data: { values: browserTrend },
  transform: [browserStackOrder],
  mark: { type: 'area', line: true, opacity: 0.8 },
  encoding: {
    x: { field: 'month', type: 'ordinal', title: null, axis: baselineAxis },
    y: { field: 'share', type: 'quantitative', title: 'Share (%)', stack: 'zero' },
    order: orderByStack,
    ...encoding,
  },
};

// The donut's ring needs to be sized off the plot box (see the desktop
// project's DONUT_LEGEND_RESERVE rule) — on a phone that box changes on
// every resize, not just once at mount, so this factory is what
// ResponsiveVegaLiteChart calls on *every* measured-width change, not just
// the first render.
const DONUT_LEGEND_RESERVE = 70;

export function getDonutSpec(width: number, height: number): VisualizationSpec {
  const outerRadius = Math.min(width, Math.max(height - DONUT_LEGEND_RESERVE, 40)) / 2;
  const innerRadius = outerRadius * DEFAULT_DONUT_HOLE_RATIO;
  return {
    data: { values: spend },
    transform: [{ calculate: "{'Marketing':0,'Engineering':1,'Sales':2,'Support':3,'Design':4}[datum.category]", as: 'order' }],
    mark: { type: 'arc', innerRadius, outerRadius, padAngle: DEFAULT_DONUT_PAD_ANGLE, cursor: 'pointer' },
    encoding: {
      theta: { field: 'value', type: 'quantitative' },
      order: { field: 'order', type: 'quantitative' },
      color: { field: 'category', type: 'nominal', sort: null, legend: { title: 'Team' } },
      tooltip: [
        { field: 'category', type: 'nominal', title: 'Team' },
        { field: 'value', type: 'quantitative', title: 'Spend ($k)' },
      ],
    },
  };
}
