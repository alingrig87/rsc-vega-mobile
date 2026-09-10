/**
 * Polar/trig helpers shared by every chart under `rsc-mobile/` — these are
 * plain SVG, not Vega-Lite, on purpose: a donut with external labels and
 * leader lines has no native Vega-Lite mark (arc-label placement there is
 * limited to a fixed `radius` offset, no line-drawing between the two), and
 * this project already hit real, confirmed Vega-Lite sizing/positioning
 * bugs building the arc-based charts in `mobileCharts.ts`. Hand-computing
 * the geometry once here avoids that whole class of problem for anything
 * built on top of it.
 */

export interface Point {
  x: number;
  y: number;
}

/** angle in radians, 0 = 12 o'clock, positive = clockwise — matches the convention already used by mobileCharts.ts's gauge/donut angle math. */
export function polarToCartesian(cx: number, cy: number, radius: number, angle: number): Point {
  return { x: cx + radius * Math.sin(angle), y: cy - radius * Math.cos(angle) };
}

/** SVG path `d` for one donut/pie wedge (a ring segment when innerRadius > 0, a plain pie slice when it's 0). */
export function describeDonutSegment(cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number): string {
  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
  const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);

  if (innerRadius <= 0) {
    return `M ${cx} ${cy} L ${outerStart.x} ${outerStart.y} A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y} Z`;
  }

  const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

export interface Segment<T> {
  datum: T;
  value: number;
  startAngle: number;
  endAngle: number;
  midAngle: number;
  fraction: number;
}

/** Splits `data` into angular segments summing to a full circle (or `sweep` radians, for a gauge-style partial ring), in data order — matches RSC's own data-order stacking convention rather than Vega-Lite's default alphabetical one, same rule as the rest of this project. */
export function computeSegments<T>(data: T[], getValue: (d: T) => number, sweep = 2 * Math.PI, startAt = 0): Segment<T>[] {
  const total = data.reduce((sum, d) => sum + getValue(d), 0);
  let cumulative = 0;
  return data.map((datum) => {
    const value = getValue(datum);
    const startAngle = startAt + (cumulative / total) * sweep;
    cumulative += value;
    const endAngle = startAt + (cumulative / total) * sweep;
    return { datum, value, startAngle, endAngle, midAngle: (startAngle + endAngle) / 2, fraction: value / total };
  });
}
