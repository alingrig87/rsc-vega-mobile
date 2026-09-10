import { useEffect, useRef, useState, useCallback } from 'react';
import embed, { type VisualizationSpec } from 'vega-embed';
import type { ScenegraphEvent, View } from 'vega';
import { getMobileVegaLiteConfig } from './mobileTheme';
import { useContainerWidth } from './useContainerWidth';

export type Datum = Record<string, unknown>;

interface ResponsiveVegaLiteChartProps {
  /** Vega-Lite spec, or a factory that receives the *live, measured* container width so a chart (e.g. a donut's radius) can react to it. */
  spec: VisualizationSpec | ((width: number, height: number) => VisualizationSpec);
  colorScheme?: 'light' | 'dark';
  /** Custom categorical palette — mirrors RSC's `<Chart colors={[...]}>`. */
  colors?: string[];
  /** height = measured width * aspectRatio. Donuts/gauges want ~0.9–1; bar/line/area read better wider, ~0.55–0.7. */
  aspectRatio?: number;
  minHeight?: number;
  maxHeight?: number;
  /**
   * Extra pixels the clip boundary gets *beyond* the measured/requested
   * width, for content that's meant to bleed slightly past the chart's own
   * box — an angled axis label's tail, mainly (measured ~19px past the box
   * even with `labelAlign: 'right'`; Vega-Lite's plot-margin math reserves
   * room for rotated labels vertically but not this specific horizontal
   * case). Wrapping the *outer* element in more padding doesn't help — the
   * clip happens at this component's own box regardless of a sibling's
   * padding, confirmed by measuring a "fixed" label's position against the
   * unmoved inner clip boundary while the outer Panel had headroom to
   * spare. Needs pairing with a page-level `overflow-x: hidden` somewhere
   * up the tree (App.tsx's root, `.storybook/preview.tsx`'s decorator) —
   * this buffer intentionally lets content spill past *this* box; only the
   * page as a whole guarantees no actual horizontal scrollbar.
   */
  overflowMargin?: number;
  /**
   * Tap-to-reveal detail panel instead of a hover tooltip — the mobile-native
   * pattern (a cursor-tracking tooltip is hard to read and easy to lose under
   * a fingertip). On by default; pass `false` to opt out and roll your own
   * via `onMarkTap`.
   */
  enableTapDetail?: boolean;
  /** Custom detail-panel renderer. Defaults to a plain key: value list. */
  renderDetail?: (datum: Datum) => React.ReactNode;
  /** Fires on every mark tap, in addition to (or instead of) the built-in detail panel. */
  onMarkTap?: (datum: Datum, event: MouseEvent) => void;
}

const DEFAULT_ASPECT_RATIO = 0.62;

/**
 * Fluid width via our *own* ResizeObserver (below) driving a full
 * spec/width/height re-embed — not vega-embed's own `resize: true`
 * autosize flag (that runs a second, competing resize loop against the
 * same container, and on an otherwise-empty `<div>` with no intrinsic
 * height it can circularly settle on 0: confirmed by instrumenting a live
 * `View` mid-investigation and reading `view.signal('height')` back as `0`
 * while the DOM `<svg height="...">` attribute was already correct).
 *
 * `autosize: {type: 'pad'}` — same choice as the desktop-parity project,
 * but landed on here for a different, mobile-specific reason: Vega-Lite's
 * `'fit'` autosize has a real, reproducible bug (isolated by bisecting a
 * minimal repro down to four variants — see the git history for the
 * throwaway script) where a *layered* spec whose shared quantitative scale
 * carries an explicit `domain` array (exactly what `buildLineCalloutSpec`
 * needs, to reserve headroom above the highest point for its callout
 * bubble) makes the compiled view's `height` signal resolve to `0` —
 * every mark in every layer collapses to the same y position. `'pad'`
 * doesn't hit it. It also happens to be the right *containment* semantics
 * for a card-constrained mobile layout regardless: since width/height here
 * are already driven externally by our own measured container size, we
 * want the chart to stay exactly within that box (shrinking its plot area
 * to fit axis/legend chrome, `'pad'`'s behavior) rather than potentially
 * rendering larger than the container and overflowing the card (`'fit'`'s
 * behavior, sized around content instead of clipped to a boundary).
 */
export function ResponsiveVegaLiteChart({
  spec,
  colorScheme = 'light',
  colors,
  aspectRatio = DEFAULT_ASPECT_RATIO,
  minHeight = 180,
  maxHeight = 520,
  enableTapDetail = true,
  renderDetail,
  onMarkTap,
  overflowMargin = 0,
}: ResponsiveVegaLiteChartProps) {
  // `measureRef` is a plain, unstyled sibling used *only* to read the true
  // available width — `embedRef` (below) is what vega-embed actually
  // targets, and its own width is a fixed pixel value derived from this
  // measurement plus `overflowMargin`, not `100%`. Measuring from the
  // *embed* element itself would feed back into its own width once
  // `overflowMargin` widens it, growing without bound.
  const { ref: measureRef, width } = useContainerWidth();
  const embedRef = useRef<HTMLDivElement>(null);
  const [detail, setDetail] = useState<Datum | null>(null);

  const height = width > 0 ? Math.min(maxHeight, Math.max(minHeight, Math.round(width * aspectRatio))) : minHeight;

  useEffect(() => {
    const el = embedRef.current;
    if (!el || width === 0) return;
    let cancelled = false;
    let cleanupFn: (() => void) | undefined;

    const resolvedSpec = typeof spec === 'function' ? spec(width, height) : spec;
    const legendColumns = getResponsiveLegendColumns(width);
    const fullSpec = {
      ...resolvedSpec,
      width,
      height,
      autosize: { type: 'pad' },
      config: getMobileVegaLiteConfig(colorScheme, colors, legendColumns),
    } as VisualizationSpec;

    embed(el, fullSpec, { actions: false, renderer: 'svg' }).then((result) => {
      if (cancelled) {
        result.view.finalize();
        return;
      }

      let tapHandler: ((event: ScenegraphEvent, item: { datum?: Datum } | null | undefined) => void) | undefined;
      if (enableTapDetail || onMarkTap) {
        tapHandler = (event, item) => {
          if (!item?.datum) return;
          if (enableTapDetail) setDetail(item.datum);
          onMarkTap?.(item.datum, event as MouseEvent);
        };
        (result.view as View).addEventListener('click', tapHandler);
      }

      cleanupFn = () => {
        if (tapHandler) (result.view as View).removeEventListener('click', tapHandler);
        result.view.finalize();
      };
    });

    return () => {
      cancelled = true;
      cleanupFn?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spec, colorScheme, colors, width, height, enableTapDetail, onMarkTap]);

  const closeDetail = useCallback(() => setDetail(null), []);

  return (
    <div>
      {/* width-measurement only — no visible content, no overflow style. Kept separate from `embedRef` below so widening that one (via `overflowMargin`) never feeds back into what this one reports. */}
      <div ref={measureRef} style={{ width: '100%' }} />
      {/*
        overflow: hidden here is a containment safety net, not a fix for
        any one chart. Bisected this down thoroughly: even a bare-minimum
        Vega-Lite bar chart with nothing but a nominal y-axis (no custom
        config at all) renders its SVG *wider than the requested width* —
        confirmed by compiling and running specs headlessly and reading the
        actual `<svg width="...">` back. Neither `autosize: {type: 'pad'}`
        nor `{type: 'pad', contains: 'padding'}` changes this; only
        `{type: 'fit'}` keeps the *rendered* size at the requested one, and
        that mode has its own confirmed bug for layered specs (see
        buildLineCalloutSpec's comment). So: a category axis's label space
        gets added on top of the canvas regardless of autosize settings.
        That's real chart geometry, not decorative text like a legend —
        there's no "just render it in HTML instead" alternative for an
        axis. Clipping the container is the actual fix — `overflowMargin`
        (see its own doc comment) is the escape hatch for content that's
        *meant* to bleed a little past the chart's own box, like an angled
        label's tail; this fixed-pixel width (not `100%`) is what makes
        that safe to widen without measureRef seeing it and looping.
      */}
      <div ref={embedRef} style={width > 0 ? { width: width + overflowMargin, overflow: 'hidden' } : undefined} />
      {enableTapDetail && detail && (
        <DetailPanel datum={detail} colorScheme={colorScheme} onClose={closeDetail} render={renderDetail} />
      )}
    </div>
  );
}

function DetailPanel({
  datum,
  colorScheme,
  onClose,
  render,
}: {
  datum: Datum;
  colorScheme: 'light' | 'dark';
  onClose: () => void;
  render?: (datum: Datum) => React.ReactNode;
}) {
  const isDark = colorScheme === 'dark';
  const entries = Object.entries(datum).filter(([key]) => !key.startsWith('__') && key !== 'rscMarkId' && key !== 'rscSeriesId');
  return (
    <div
      role="dialog"
      aria-label="Data point detail"
      style={{
        marginTop: 10,
        padding: '10px 14px',
        borderRadius: 10,
        border: `1px solid ${isDark ? '#3a3a3a' : '#e6e6e6'}`,
        background: isDark ? '#262626' : '#fff',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        // touch-safe: comfortably above the ~44px minimum recommended tap target
        minHeight: 44,
      }}
    >
      <div style={{ fontSize: 14, lineHeight: 1.6, color: isDark ? '#eee' : '#222' }}>
        {render ? (
          render(datum)
        ) : (
          entries.map(([key, value]) => (
            <div key={key}>
              <strong>{key}:</strong> {String(value)}
            </div>
          ))
        )}
      </div>
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: 'none',
          background: isDark ? '#3a3a3a' : '#f0f0f0',
          color: isDark ? '#eee' : '#222',
          fontSize: 16,
          cursor: 'pointer',
        }}
      >
        ×
      </button>
    </div>
  );
}

/**
 * Below ~380px (the narrowest common phones, e.g. iPhone SE) a legend row
 * wraps into cramped, easy-to-mistap columns. Force a tighter column count
 * instead of letting Vega-Lite's own auto-wrap fight the available width.
 */
function getResponsiveLegendColumns(width: number): number | undefined {
  if (width < 340) return 1;
  if (width < 480) return 2;
  return undefined; // default RSC-like wrapping for anything tablet-sized or wider
}
