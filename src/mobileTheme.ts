import { getSpectrumVegaLiteConfig, DEFAULT_LEGEND_SYMBOL_SIZE, DEFAULT_SYMBOL_SIZE } from './spectrumVegaTheme';

// Apple's and Google's platform guidelines both converge on ~44px / ~48dp as
// the minimum comfortable touch target. Vega's `symbolSize` is an *area* in
// px² (not a diameter), so growing it from the desktop default needs a much
// bigger number than it looks like at a glance — this roughly doubles the
// rendered legend swatch's linear size.
const MOBILE_LEGEND_SYMBOL_SIZE = DEFAULT_LEGEND_SYMBOL_SIZE * 1.7; // ~250 -> ~425
const MOBILE_POINT_SIZE = DEFAULT_SYMBOL_SIZE * 1.6; // easier to tap a scatter point with a fingertip
const MOBILE_LEGEND_ROW_PADDING = 14; // desktop: 8 — more vertical air between tappable legend rows
const MOBILE_LEGEND_COLUMN_PADDING = 24; // desktop: 20

/**
 * Extends the shared Spectrum theme with touch-target sizing. Colors, fonts,
 * corner radius, and the confirmed autosize/tickCount fidelity fixes are
 * untouched — only the things that matter for a finger instead of a cursor
 * change here: bigger legend swatches and row spacing, bigger point marks,
 * and (via `legendColumns`) a narrower-screen-aware legend column count fed
 * in by ResponsiveVegaLiteChart based on the live measured width.
 */
export function getMobileVegaLiteConfig(colorScheme: 'light' | 'dark' = 'light', colors?: string[], legendColumns?: number) {
  // `getSpectrumVegaLiteConfig`'s `autosize: {type: 'pad'}` is the desktop
  // project's own confirmed-correct choice (it matches RSC's fixed-canvas
  // behavior — see that project's theme-and-colors skill reference) but is
  // the wrong default here: this repo's whole premise is a fluid canvas
  // that resizes with the viewport. `ResponsiveVegaLiteChart` sets its own
  // top-level `autosize: {type: 'fit', resize: true}` per embed — leaving
  // the desktop value in `config.autosize` alongside it produced a real,
  // confirmed bug (not just a redundant setting): a layered chart's linear
  // y-scale collapsed to a zero-height range, flattening every mark to the
  // same y position, because the two conflicting autosize sources left the
  // view's `height` signal resolving inconsistently between layers.
  const { autosize: _desktopAutosize, ...base } = getSpectrumVegaLiteConfig(colorScheme, colors);
  return {
    ...base,
    legend: {
      ...base.legend,
      symbolSize: MOBILE_LEGEND_SYMBOL_SIZE,
      rowPadding: MOBILE_LEGEND_ROW_PADDING,
      columnPadding: MOBILE_LEGEND_COLUMN_PADDING,
      ...(legendColumns ? { columns: legendColumns } : {}),
    },
    point: {
      ...base.point,
      size: MOBILE_POINT_SIZE,
    },
    circle: {
      ...base.circle,
      size: MOBILE_POINT_SIZE,
    },
  } as const;
}
