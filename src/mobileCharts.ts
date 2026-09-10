import type { VisualizationSpec } from 'vega-embed';
import { categorical16, DEFAULT_DONUT_HOLE_RATIO } from './spectrumVegaTheme';

// A small library of mobile-dashboard-shaped chart builders — the radial
// progress ring, the donut-with-center-total, the compact sparkline/mini-bar
// pair for a KPI card, and the line-with-callout-bubble pattern — modeled on
// common native dashboard UI (iOS Health-style rings, fintech app summaries)
// rather than RSC's own desktop chart catalogue, since none of those shapes
// exist as an RSC component. Colors/fonts/corner-radius still come from
// spectrumVegaTheme so they read as the same design system as the rest of
// this project's Spectrum-parity work, just applied to phone-native shapes.

export interface GaugeOptions {
  value: number;
  max?: number;
  label?: string;
  color?: string;
  trackColor?: string;
  /** Radians, 0 = 12 o'clock, positive = clockwise. Defaults to a 270° speedometer sweep with the gap at the bottom. */
  startAngle?: number;
  endAngle?: number;
}

const DEFAULT_TRACK_COLOR = 'rgb(230, 230, 230)';

/**
 * A radial progress ring: gray background track + a colored progress arc +
 * the percentage centered inside it. No RSC equivalent (closest is
 * `<Donut isBoolean>`, which is a full 360° ring split two ways, not an
 * open-gap sweep with a track) — this is the mobile-dashboard staple seen in
 * fitness/health and analytics apps instead.
 */
export function buildGaugeSpec(width: number, height: number, opts: GaugeOptions): VisualizationSpec {
  const {
    value,
    max = 100,
    label,
    color = categorical16[0],
    trackColor = DEFAULT_TRACK_COLOR,
    startAngle = -0.75 * Math.PI,
    endAngle = 0.75 * Math.PI,
  } = opts;
  const fraction = Math.max(0, Math.min(1, value / max));
  const valueAngle = startAngle + fraction * (endAngle - startAngle);
  const outerRadius = Math.min(width, height) / 2 - 4;
  const innerRadius = outerRadius * 0.72;
  const percentLabel = `${Math.round(fraction * 100)}%`;

  return {
    data: { values: [{}] },
    layer: [
      {
        mark: { type: 'arc', innerRadius, outerRadius, cornerRadius: (outerRadius - innerRadius) / 2, color: trackColor },
        encoding: { theta: { value: startAngle }, theta2: { value: endAngle } },
      },
      {
        mark: { type: 'arc', innerRadius, outerRadius, cornerRadius: (outerRadius - innerRadius) / 2, color },
        encoding: { theta: { value: startAngle }, theta2: { value: valueAngle } },
      },
      {
        mark: { type: 'text', fontSize: Math.max(18, Math.round(outerRadius * 0.34)), fontWeight: 'bold', dy: label ? -6 : 0 },
        encoding: { text: { value: percentLabel } },
      },
      ...(label
        ? ([
            {
              mark: { type: 'text', fontSize: 12, dy: Math.round(outerRadius * 0.34) + 10, opacity: 0.65 },
              encoding: { text: { value: label } },
            },
          ] as const)
        : []),
    ],
  };
}

export interface DonutSummaryOptions {
  data: { label: string; value: number }[];
  /** Pre-formatted center string, e.g. "$5,639". Falls back to the plain sum. */
  centerValue?: string;
  centerLabel?: string;
  holeRatio?: number;
  showSegmentPercent?: boolean;
}

/**
 * Donut ring with a big total in the hole and (optionally) a percent label
 * baked into each segment — RSC's `<DonutSummary>` + `<SegmentLabel>`
 * pattern, see the annotations-and-overlays skill reference.
 *
 * Segment angles are computed explicitly in JS (not left to Vega-Lite's
 * implicit quantitative-`theta` stacking) and baked into the data as
 * `startAngle`/`endAngle`/`midAngle` fields. That's the fix for a real bug
 * this repo hit: pairing a `text` mark with an arc mark via a shared
 * `theta: {field: 'value', type: 'quantitative'}` positions each label at
 * its segment's *cumulative running-sum* angle (effectively the boundary
 * with the next segment), not the segment's own visual midpoint — on a
 * multi-segment donut this reads as every label crowding toward one edge
 * instead of sitting centered in its own wedge.
 */
export function buildDonutSummarySpec(width: number, height: number, opts: DonutSummaryOptions): VisualizationSpec {
  const { data, centerValue, centerLabel, holeRatio = DEFAULT_DONUT_HOLE_RATIO, showSegmentPercent = true } = opts;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  // the bottom legend (added because small segments drop their inline
  // label below) needs room of its own — same idea as the desktop
  // project's DONUT_LEGEND_RESERVE, sized for ~2 wrapped legend rows.
  const legendReserve = 46;
  const outerRadius = Math.min(width, Math.max(height - legendReserve, 40)) / 2;
  const innerRadius = outerRadius * holeRatio;

  let cumulative = 0;
  const rows = data.map((d) => {
    const startAngle = (cumulative / total) * 2 * Math.PI;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI;
    const pct = d.value / total;
    return { ...d, startAngle, endAngle, midAngle: (startAngle + endAngle) / 2, pct: `${Math.round(pct * 100)}%`, fraction: pct };
  });

  const layers: Record<string, unknown>[] = [
    {
      mark: { type: 'arc' as const, innerRadius, outerRadius, padAngle: 0.012, cursor: 'pointer' as const },
      encoding: {
        theta: { field: 'startAngle', type: 'quantitative' as const, scale: null },
        theta2: { field: 'endAngle', type: 'quantitative' as const },
        // segments below the crowding threshold (see the filter below) drop
        // their inline label, so a legend is the only remaining way to
        // identify them — never suppress it here even though the rest of
        // this project's donuts keep legend/label choices explicit per call site.
        color: { field: 'label', type: 'nominal' as const, sort: null, legend: { title: null, orient: 'bottom', columns: 3, labelFontSize: 11 } },
        tooltip: [
          { field: 'label', type: 'nominal' as const },
          { field: 'value', type: 'quantitative' as const },
        ],
      },
    },
  ];

  if (showSegmentPercent) {
    // Below ~15% of the total, a segment's angular span is too narrow for
    // its own label at this font size without colliding with its
    // neighbors' — drop those rather than render a crowded cluster
    // (there's still no collision avoidance to fall back on, same caveat
    // as the desktop project's segment-label note in the
    // annotations-and-overlays skill reference — this fix only corrects
    // *where* a shown label sits, not spacing between adjacent ones).
    layers.push({
      data: { values: rows.filter((r) => r.fraction >= 0.15) },
      mark: { type: 'text', radius: (innerRadius + outerRadius) / 2, fontSize: 11, fontWeight: 'bold', color: 'white' },
      encoding: {
        theta: { field: 'midAngle', type: 'quantitative', scale: null },
        text: { field: 'pct' },
      },
    });
  }

  layers.push({
    data: { values: [{}] },
    mark: { type: 'text', fontSize: Math.max(16, Math.round(innerRadius * 0.32)), fontWeight: 'bold', dy: centerLabel ? -8 : 0 },
    encoding: { text: { value: centerValue ?? `$${total.toLocaleString()}` } },
  });
  if (centerLabel) {
    layers.push({
      data: { values: [{}] },
      mark: { type: 'text', fontSize: 11, opacity: 0.6, dy: 12 },
      encoding: { text: { value: centerLabel } },
    });
  }

  return { data: { values: rows }, layer: layers } as unknown as VisualizationSpec;
}

/** No axes, no gridlines, no legend — just the shape. The point of a sparkline is to sit inline in a KPI card next to a number, not to be read as a standalone chart. */
export function buildSparklineSpec(data: Record<string, unknown>[], dimensionField: string, metricField: string, color = categorical16[0]): VisualizationSpec {
  return {
    data: { values: data },
    mark: { type: 'line', strokeWidth: 2.5, interpolate: 'monotone', point: false },
    encoding: {
      x: { field: dimensionField, type: 'ordinal', axis: null },
      y: { field: metricField, type: 'quantitative', axis: null, scale: { zero: false } },
      color: { value: color },
    },
  };
}

/** Compact vertical dual-series bars with only x labels — no y-axis, no gridlines — matching the "Income / Expense" mini-bar block in the reference dashboards. */
export function buildCompactDualBarSpec(
  data: Record<string, unknown>[],
  dimensionField: string,
  metricField: string,
  seriesField: string,
  colors: [string, string] = [categorical16[1], categorical16[8]],
): VisualizationSpec {
  return {
    data: { values: data },
    mark: { type: 'bar', width: { band: 0.35 }, cornerRadiusTopLeft: 3, cornerRadiusTopRight: 3 },
    encoding: {
      x: { field: dimensionField, type: 'ordinal', title: null, axis: { domain: false, ticks: false, labelFontSize: 10 } },
      xOffset: { field: seriesField },
      y: { field: metricField, type: 'quantitative', axis: null },
      color: { field: seriesField, type: 'nominal', sort: null, scale: { range: colors }, legend: null },
    },
  };
}

/** A compact horizontal bar-per-row list (label · bar · value) — the "Sales by country" / progress-list pattern, built on the same centered layout idea as the desktop project's Bullet replica but without a target rule. */
export function buildMiniBarListSpec(data: { label: string; value: number }[], color = categorical16[0]): VisualizationSpec {
  const max = Math.max(...data.map((d) => d.value));
  return {
    data: { values: data },
    layer: [
      {
        mark: { type: 'bar', height: 8, cornerRadius: 4, color },
        encoding: {
          y: { field: 'label', type: 'nominal', sort: null, title: null, axis: { domain: false, ticks: false, grid: false } },
          x: { field: 'value', type: 'quantitative', axis: null, scale: { domain: [0, max] } },
        },
      },
      {
        mark: { type: 'text', align: 'left', dx: 8, fontSize: 11, fontWeight: 'bold', opacity: 0.7 },
        encoding: {
          y: { field: 'label', type: 'nominal', sort: null },
          x: { field: 'value', type: 'quantitative' },
          text: { field: 'value' },
        },
      },
    ],
  };
}

export interface LineCalloutOptions {
  data: Record<string, unknown>[];
  dimensionField: string;
  metricField: string;
  /** Index into `data` to highlight with a dot + value bubble. Defaults to the last point. */
  highlightIndex?: number;
  color?: string;
  bubbleTextColor?: string;
  format?: (value: unknown) => string;
}

/** Line/area with one point highlighted and a floating value "bubble" above it — the analytics-app pattern from the reference dashboards (a live tooltip permanently pinned to one point instead of only appearing on hover/tap). */
export function buildLineCalloutSpec(width: number, height: number, opts: LineCalloutOptions): VisualizationSpec {
  const { data, dimensionField, metricField, color = categorical16[0], bubbleTextColor = '#fff', format = String } = opts;
  const highlightIndex = opts.highlightIndex ?? data.length - 1;
  const highlighted = data[highlightIndex];
  const bubbleText = format(highlighted[metricField]);
  const bubbleWidth = Math.max(32, bubbleText.length * 7 + 16);
  // a bubble centered on the *last* point overhangs the card's right edge
  // (and one centered on the first point overhangs the left) — shift it
  // fully inward instead of clipping against the container.
  const bubbleDx = highlightIndex === data.length - 1 ? -bubbleWidth / 2 : highlightIndex === 0 ? bubbleWidth / 2 : 0;

  // The bubble floats ~22px above its point via `dy`. If the highlighted
  // point sits near the top of a tight (`zero: false`) y-domain — the
  // common case, since a callout is usually pinned to the highest/most
  // recent value — that offset pushes the bubble above y=0 in the plot's
  // own coordinate space, where Vega clips it: it exists in the DOM
  // (confirmed by inspecting the rendered SVG) but is invisible. Padding
  // the domain's upper bound reserves the headroom the bubble needs.
  const values = data.map((d) => Number(d[metricField]));
  const dataMin = Math.min(...values);
  const dataMax = Math.max(...values);
  const yDomain: [number, number] = [dataMin - (dataMax - dataMin) * 0.15, dataMax + (dataMax - dataMin) * 0.35];

  // A fresh object (and a fresh copy of the domain array) per layer, and
  // *always* `axis: null` on both channels — this is what actually fixed a
  // real, confirmed bug: giving `axis: null` to only the area layer's y
  // while the point/rect/text layers left their y axis undeclared made the
  // compiled view's `height` signal resolve to 0 (verified by evaluating
  // the compiled Vega spec headlessly — `view.signal('height')` came back
  // `0`, collapsing the linear y-scale's range to `[0, 0]` and flattening
  // every mark to the same position). Exactly the "keep axis overrides
  // consistent across layers sharing a channel" gotcha already documented
  // as rule 12 in the desktop project's llmPrompt.ts — reusing one `y`
  // object reference across layers was a red herring caught along the way,
  // not the actual cause; kept as a clone anyway since it's cheap and safe.
  const makeXY = () => ({
    x: { field: dimensionField, type: 'ordinal' as const, axis: null },
    y: { field: metricField, type: 'quantitative' as const, scale: { zero: false, domain: [...yDomain] as [number, number] }, axis: null },
  });

  return {
    data: { values: data },
    layer: [
      {
        mark: { type: 'area', line: { color, strokeWidth: 2.5 }, color: { x1: 1, y1: 1, x2: 1, y2: 0, gradient: 'linear', stops: [{ offset: 0, color: 'transparent' }, { offset: 1, color }] }, opacity: 0.25, interpolate: 'monotone' },
        encoding: makeXY(),
      },
      {
        data: { values: [highlighted] },
        mark: { type: 'point', filled: true, size: 90, color: '#fff', stroke: color, strokeWidth: 3 },
        encoding: makeXY(),
      },
      {
        data: { values: [{ ...highlighted, bubbleText }] },
        mark: { type: 'rect', dx: bubbleDx, dy: -22, height: 22, width: bubbleWidth, cornerRadius: 6, color },
        encoding: makeXY(),
      },
      {
        data: { values: [{ ...highlighted, bubbleText }] },
        mark: { type: 'text', dx: bubbleDx, dy: -22, fontSize: 12, fontWeight: 'bold', color: bubbleTextColor, align: 'center', baseline: 'middle' },
        encoding: {
          ...makeXY(),
          text: { field: 'bubbleText' },
        },
      },
    ],
  };
}
