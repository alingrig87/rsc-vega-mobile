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

export interface ConcentricGaugeRing {
  value: number;
  max?: number;
  color: string;
  label?: string;
}

/**
 * Several progress rings nested inside one another, each its own metric —
 * a full 360° sweep per ring (not the open-gap speedometer style
 * `buildGaugeSpec` uses), since with 2–3 rings stacked the gap reads as
 * visual noise rather than a deliberate "meter" affordance. A shared center
 * label (usually the highest-priority ring's own value) sits in the
 * innermost hole; per-ring values are meant to be read from an accompanying
 * legend/list rendered in React next to the chart, not crammed as more text
 * inside the rings themselves.
 */
export function buildConcentricGaugeSpec(width: number, height: number, rings: ConcentricGaugeRing[], centerText?: string): VisualizationSpec {
  const outerRadius = Math.min(width, height) / 2 - 4;
  const ringThickness = outerRadius / (rings.length * 1.8);
  const ringGap = ringThickness * 0.35;

  const layers: Record<string, unknown>[] = [];
  rings.forEach((ring, i) => {
    const ringOuter = outerRadius - i * (ringThickness + ringGap);
    const ringInner = ringOuter - ringThickness;
    const fraction = Math.max(0, Math.min(1, ring.value / (ring.max ?? 100)));
    const endAngle = fraction * 2 * Math.PI;
    layers.push(
      {
        mark: { type: 'arc', innerRadius: ringInner, outerRadius: ringOuter, color: 'rgb(238, 238, 238)' },
        encoding: { theta: { value: 0 }, theta2: { value: 2 * Math.PI } },
      },
      {
        mark: { type: 'arc', innerRadius: ringInner, outerRadius: ringOuter, cornerRadius: ringThickness / 2, color: ring.color },
        encoding: { theta: { value: 0 }, theta2: { value: endAngle } },
      },
    );
  });

  if (centerText) {
    const innermostRadius = outerRadius - (rings.length - 1) * (ringThickness + ringGap) - ringThickness;
    layers.push({
      data: { values: [{}] },
      mark: { type: 'text', fontSize: Math.max(14, Math.round(innermostRadius * 0.5)), fontWeight: 'bold' },
      encoding: { text: { value: centerText } },
    });
  }

  return { data: { values: [{}] }, layer: layers } as unknown as VisualizationSpec;
}

export interface DonutSummaryOptions {
  data: { label: string; value: number }[];
  /** Pre-formatted center string, e.g. "$5,639". Falls back to the plain sum. */
  centerValue?: string;
  centerLabel?: string;
  holeRatio?: number;
  showSegmentPercent?: boolean;
  colors?: string[];
}

export interface DonutLegendEntry {
  label: string;
  value: number;
  color: string;
}

/**
 * Per-segment colors, computed once and shared by both
 * `buildDonutSummarySpec` (so the ring's arc colors match) and whatever
 * legend the caller renders next to it. Deliberately plain data, not a
 * chart spec — see `buildDonutSummarySpec`'s own comment for why the
 * legend itself belongs in React/HTML, not here.
 */
export function getDonutLegend(data: { label: string; value: number }[], colors: string[] = categorical16): DonutLegendEntry[] {
  return data.map((d, i) => ({ label: d.label, value: d.value, color: colors[i % colors.length] }));
}

/**
 * Donut ring with a big total in the hole and (optionally) a percent label
 * baked into each segment — RSC's `<DonutSummary>` + `<SegmentLabel>`
 * pattern, see the annotations-and-overlays skill reference. Renders the
 * ring only — no Vega-Lite legend. A legend positioned beside or below the
 * ring is layout and text, which CSS already does well; asking Vega-Lite's
 * legend to fit a width/height *this component* reserved for it, rather
 * than one Vega-Lite computed for itself, turned out not to work: a
 * `orient: 'right'` legend with long-enough labels rendered wider than the
 * space reserved, and because Vega's `'pad'` autosize sizes the SVG to
 * whatever the legend actually needs (not the `width` requested) and SVGs
 * don't clip to their own `width` attribute by default, the excess became
 * visible content pushing past the card — confirmed by watching
 * `document.documentElement.scrollWidth` exceed the viewport. Pair this
 * with `getDonutLegend(data)` rendered as plain HTML next to or below the
 * `<ResponsiveVegaLiteChart>` instead (see the `Mobile/DonutSummary` story
 * or `App.tsx`'s "Spend by Team" card for the pattern) — same colors,
 * guaranteed to fit because it's laid out by the browser, not a chart engine.
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
  const { data, centerValue, centerLabel, holeRatio = DEFAULT_DONUT_HOLE_RATIO, showSegmentPercent = true, colors = categorical16 } = opts;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const outerRadius = Math.min(width, height) / 2 - 4;
  const innerRadius = outerRadius * holeRatio;

  let cumulative = 0;
  const rows = data.map((d, i) => {
    const startAngle = (cumulative / total) * 2 * Math.PI;
    cumulative += d.value;
    const endAngle = (cumulative / total) * 2 * Math.PI;
    const pct = d.value / total;
    return {
      ...d,
      startAngle,
      endAngle,
      midAngle: (startAngle + endAngle) / 2,
      pct: `${Math.round(pct * 100)}%`,
      fraction: pct,
      color: colors[i % colors.length],
    };
  });

  const layers: Record<string, unknown>[] = [
    {
      mark: { type: 'arc' as const, innerRadius, outerRadius, padAngle: 0.012, cursor: 'pointer' as const },
      encoding: {
        theta: { field: 'startAngle', type: 'quantitative' as const, scale: null },
        theta2: { field: 'endAngle', type: 'quantitative' as const },
        color: { field: 'color', type: 'nominal' as const, scale: null, legend: null },
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
    // neighbors' — drop those rather than render a crowded cluster (still
    // no collision avoidance to fall back on, same caveat as the desktop
    // project's segment-label note in the annotations-and-overlays skill
    // reference — this fix only corrects *where* a shown label sits, not
    // spacing between adjacent ones). The paired legend (see this
    // function's own doc comment) is what keeps a dropped segment
    // identifiable regardless.
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

// Horizontal bar-per-row lists (ranked, badged, or current-vs-previous
// comparison) used to live here as Vega-Lite specs. Moved to `BarList.tsx`
// as a plain HTML/CSS component instead: every version hit the same
// confirmed Vega sizing bug — a nominal y-axis of category labels makes
// Vega-Lite render its SVG wider than the requested width regardless of
// autosize settings (bisected down to a bare-minimum repro, see
// ResponsiveVegaLiteChart's `overflow: hidden` comment) — and for a widget
// that's fundamentally "N rows, each a colored width percentage," CSS does
// the job directly with none of that failure mode.

export interface TrendSparklineOptions {
  data: Record<string, unknown>[];
  previousData?: Record<string, unknown>[];
  dimensionField: string;
  metricField: string;
  color?: string;
  previousColor?: string;
}

/** A KPI-tile sparkline with the previous period traced faintly underneath the current one — the overlap is the point (comparison at a glance), not either line read in isolation. Pair with a plain number + delta badge rendered in React above it (see `App.tsx`) rather than trying to fit that into the chart itself. */
export function buildTrendSparklineSpec(opts: TrendSparklineOptions): VisualizationSpec {
  const { data, previousData, dimensionField, metricField, color = categorical16[0], previousColor = 'rgb(210, 210, 210)' } = opts;
  const layer: Record<string, unknown>[] = [];
  if (previousData) {
    layer.push({
      data: { values: previousData },
      mark: { type: 'line', strokeWidth: 1.75, interpolate: 'monotone', point: false, color: previousColor },
      encoding: {
        x: { field: dimensionField, type: 'ordinal', axis: null },
        y: { field: metricField, type: 'quantitative', axis: null, scale: { zero: false } },
      },
    });
  }
  layer.push({
    mark: { type: 'line', strokeWidth: 2, interpolate: 'monotone', point: false, color },
    encoding: {
      x: { field: dimensionField, type: 'ordinal', axis: null },
      y: { field: metricField, type: 'quantitative', axis: null, scale: { zero: false } },
    },
  });
  return { data: { values: data }, layer } as unknown as VisualizationSpec;
}

export interface StackedAreaOptions {
  data: Record<string, unknown>[];
  dimensionField: string;
  metricField: string;
  seriesField: string;
  /** Data order, first-drawn = bottom of the stack — matches how RSC's own stacked marks read (see charts.ts's stackedBarSpec/areaSpec for the underlying rule this mirrors). */
  seriesOrder: string[];
  colors?: string[];
}

/**
 * A stacked area chart in the same minimal-chrome register as the rest of
 * `mobileCharts.ts` — smooth (`monotone`) curves, a bare x-axis (no title,
 * no ticks, no gridlines) instead of `charts.ts`'s fuller desktop-parity
 * axis treatment, and an optional compact legend instead of one that always
 * reserves its own row. The desktop project's `areaSpec` is the
 * pixel-accurate RSC replica; this is the same stacking idea restyled for a
 * dashboard card instead of a full chart panel.
 */
export function buildStackedAreaSpec(opts: StackedAreaOptions): VisualizationSpec {
  const { data, dimensionField, metricField, seriesField, seriesOrder, colors = categorical16 } = opts;
  const orderExpr = `{${seriesOrder.map((s, i) => `'${s}':${i}`).join(',')}}[datum.${seriesField}]`;

  return {
    data: { values: data },
    transform: [{ calculate: orderExpr, as: '__stackOrder' }],
    mark: { type: 'area', line: { strokeWidth: 1.5 }, opacity: 0.88, interpolate: 'monotone' },
    encoding: {
      x: { field: dimensionField, type: 'ordinal', title: null, axis: { domain: false, ticks: false, grid: false, labelFontSize: 10 } },
      y: { field: metricField, type: 'quantitative', stack: 'zero', axis: null },
      order: { field: '__stackOrder', type: 'quantitative' },
      // No Vega-Lite legend here (see buildDonutSummarySpec's doc comment
      // for the full story) — this one hit the exact same failure mode: a
      // forced `columns: seriesOrder.length` bottom legend doesn't wrap
      // when four category names don't fit one row's width, it just
      // renders wider than the chart. Pair with `getSeriesLegend` +
      // `<Legend layout="bottom">` instead (see the Mobile/StackedArea story).
      color: { field: seriesField, type: 'nominal', sort: null, scale: { domain: seriesOrder, range: colors }, legend: null },
    },
  };
}

/** Label/color pairs for a series-colored chart with no per-entry value (a stacked area's legend, unlike a donut's) — pairs with `<Legend>`. */
export function getSeriesLegend(seriesOrder: string[], colors: string[] = categorical16): DonutLegendEntry[] {
  return seriesOrder.map((label, i) => ({ label, value: 0, color: colors[i % colors.length] }));
}
